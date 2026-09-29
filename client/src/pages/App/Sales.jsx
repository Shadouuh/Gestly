import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign, Loader2, X, Users, Filter, RefreshCw, Package, Clock, CheckCircle, Trash2, AlertTriangle, CreditCard, Banknote, ArrowRightLeft } from 'lucide-react';
import { getCurrentBusiness, getCurrentUser } from '../../services/api';
import api from '../../services/api';
import { useNotification } from '../../shared/components/Notification/NotificationContext';

const PAYMENT_CONFIG = {
  cash: { label: 'Efectivo', icon: Banknote, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
  mp: { label: 'MercadoPago', icon: CreditCard, color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400' },
  transfer: { label: 'Transferencia', icon: ArrowRightLeft, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400' },
  fiado: { label: 'Fiado', icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' },
  efectivo: { label: 'Efectivo', icon: Banknote, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
  tarjeta: { label: 'Tarjeta/Transf.', icon: CreditCard, color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400' },
};

const STATUS_CONFIG = {
  paid: { label: 'Pagado', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30' },
  pending: { label: 'Pendiente', icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30' },
  voided: { label: 'Anulada', icon: X, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
};

const Sales = () => {
  const notify = useNotification();
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = () => {
    const business = getCurrentBusiness();
    if (!business) { setLoading(false); return; }
    Promise.all([
      api.get('/salesTransactions', { params: { businessId: business.id, limit: 500 } }),
      api.get('/cashMovements', { params: { businessId: business.id, limit: 500 } }),
      api.get('/customers', { params: { businessId: business.id } }),
    ]).then(([sr, cr, custR]) => {
      const sales = (sr.data || []).map(s => ({
        ...s, _type: 'venta', _date: new Date(s.created_at).getTime(),
      }));
      const expenses = (cr.data || []).filter(m => m.type === 'expense').map(m => ({
        id: `e${m.id}`, created_at: m.created_at, total: m.amount,
        _type: 'egreso', _date: new Date(m.created_at).getTime(),
        payment_method: 'perdida', description: m.description,
        customer_name: '', status: 'paid', branch_name: '',
      }));
      setRows([...sales, ...expenses].sort((a, b) => b._date - a._date));
      setCustomers(custR.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => {
    const ventas = rows.filter(r => r._type === 'venta');
    const egresos = rows.filter(r => r._type === 'egreso');
    const pagadas = ventas.filter(r => r.status === 'paid');
    const pendientes = ventas.filter(r => r.status === 'pending');
    const anuladas = ventas.filter(r => r.status === 'voided');
    return {
      totalIngresos: pagadas.reduce((s, r) => s + Number(r.total || 0), 0),
      totalEgresos: egresos.reduce((s, r) => s + Number(r.total || 0), 0),
      totalPendiente: pendientes.reduce((s, r) => s + Number(r.total || 0), 0),
      countPagadas: pagadas.length,
      countPendientes: pendientes.length,
      countAnuladas: anuladas.length,
      countEgresos: egresos.length,
    };
  }, [rows]);

  const neto = stats.totalIngresos - stats.totalEgresos;

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (statusFilter !== 'all' && (r.status || 'paid') !== statusFilter) return false;
      if (methodFilter !== 'all' && r.payment_method !== methodFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchId = String(r.id).includes(search);
        const matchDesc = (r.description || '').toLowerCase().includes(q);
        const matchCustomer = (r.customer_name || '').toLowerCase().includes(q);
        if (!matchId && !matchDesc && !matchCustomer) return false;
      }
      if (clientFilter && r._type === 'venta' && !(r.customer_name || '').toLowerCase().includes(clientFilter.toLowerCase())) return false;
      return true;
    });
  }, [rows, search, clientFilter, statusFilter, methodFilter]);

  const handleDeleteSale = async (sale) => {
    if (!confirm(`¿Anular venta #${sale.id}? Se restaurará el stock y se eliminarán las deudas asociadas.`)) return;
    setDeletingId(sale.id);
    try {
      await api.delete(`/salesTransactions/${sale.id}`);
      notify.success('Venta anulada y stock restaurado');
      loadData();
    } catch (e) {
      notify.error('Error al anular: ' + (e.response?.data?.message || e.message));
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkPaid = async (sale) => {
    try {
      await api.patch(`/salesTransactions/${sale.id}/status`, { status: 'paid' });
      notify.success('Venta marcada como pagada');
      loadData();
    } catch (e) {
      notify.error('Error al actualizar: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 lg:px-6 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Ventas</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{rows.filter(r => r._type === 'venta').length} ventas · {stats.countPendientes} pendientes</p>
          </div>
          <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-3 rounded-xl text-white relative overflow-hidden">
            <p className="text-[10px] font-bold text-blue-200 uppercase">Ingresos</p>
            <p className="text-xl font-black">${stats.totalIngresos.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-blue-200/80">{stats.countPagadas} ventas pagadas</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-3 rounded-xl text-white relative overflow-hidden">
            <p className="text-[10px] font-bold text-red-200 uppercase">Egresos</p>
            <p className="text-xl font-black">${stats.totalEgresos.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-red-200/80">{stats.countEgresos} movimientos</p>
          </div>
          <div className={`bg-gradient-to-br ${neto >= 0 ? 'from-emerald-500 to-emerald-700' : 'from-orange-500 to-orange-700'} p-3 rounded-xl text-white relative overflow-hidden`}>
            <p className={`text-[10px] font-bold ${neto >= 0 ? 'text-emerald-200' : 'text-orange-200'} uppercase`}>Neto</p>
            <p className="text-xl font-black">${neto.toLocaleString()}</p>
            <p className={`text-[10px] font-bold ${neto >= 0 ? 'text-emerald-200/80' : 'text-orange-200/80'}`}>
              {neto >= 0 ? 'Ganancia' : 'Pérdida'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-3 rounded-xl text-white relative overflow-hidden">
            <p className="text-[10px] font-bold text-amber-200 uppercase">Pendiente Cobro</p>
            <p className="text-xl font-black">${stats.totalPendiente.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-amber-200/80">{stats.countPendientes} fiados</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por ID, cliente o detalle..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all" />
          </div>
          <button onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${filterOpen || clientFilter || statusFilter !== 'all' || methodFilter !== 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            <Filter size={14} />
            {(clientFilter || statusFilter !== 'all' || methodFilter !== 'all') && <span className="ml-0.5 text-[10px] opacity-70">Filtros</span>}
          </button>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 animate-fadeIn space-y-3">
            {/* Status tabs */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Estado</label>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'paid', label: 'Pagados' },
                  { key: 'pending', label: 'Pendientes' },
                  { key: 'voided', label: 'Anulados' },
                ].map(s => (
                  <button key={s.key} onClick={() => setStatusFilter(s.key)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${statusFilter === s.key ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Payment method filter */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Método de pago</label>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'cash', label: 'Efectivo' },
                  { key: 'mp', label: 'MP' },
                  { key: 'transfer', label: 'Transfer.' },
                  { key: 'fiado', label: 'Fiado' },
                ].map(m => (
                  <button key={m.key} onClick={() => setMethodFilter(m.key)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${methodFilter === m.key ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Client filter */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Cliente</label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={clientFilter} onChange={e => setClientFilter(e.target.value)}
                  placeholder="Nombre del cliente..."
                  className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15" />
                {clientFilter && (
                  <button onClick={() => setClientFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5">
                    <X size={14} />
                  </button>
                )}
              </div>
              {customers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {customers.filter(c => c.name?.toLowerCase().includes(clientFilter.toLowerCase())).slice(0, 5).map(c => (
                    <button key={c.id} onClick={() => setClientFilter(c.name)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${clientFilter === c.name ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sale List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 lg:px-6 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-slate-300 dark:text-slate-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Package size={28} strokeWidth={1} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-bold text-sm">No hay movimientos</p>
            <p className="text-xs">Registra ventas desde el POS para ver datos aquí</p>
          </div>
        ) : (
          <div className="space-y-2 mt-3">
            {filtered.map(r => {
              const isVenta = r._type === 'venta';
              const isEgreso = r._type === 'egreso';
              const status = r.status || 'paid';
              const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG.paid;
              const methodConf = PAYMENT_CONFIG[r.payment_method] || { label: r.payment_method || '—', icon: DollarSign, color: 'text-slate-600 bg-slate-50 dark:bg-slate-700/30 dark:text-slate-400' };
              const MethodIcon = methodConf.icon;
              const StatusIcon = statusConf.icon;
              const isVoided = status === 'voided';
              const isPending = status === 'pending';

              return (
                <div key={r.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-4 transition-all hover:shadow-md ${
                  isVoided ? 'border-slate-200 dark:border-slate-700 opacity-50' :
                  isPending ? 'border-amber-200 dark:border-amber-800/30' :
                  'border-slate-200 dark:border-slate-700'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isEgreso ? 'bg-red-50 dark:bg-red-900/20' : isPending ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                        {isEgreso ? <TrendingDown size={18} className="text-red-500" /> :
                         isPending ? <Clock size={18} className="text-amber-500" /> :
                         <TrendingUp size={18} className="text-emerald-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 dark:text-white">#{r.id}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConf.color}`}>
                            <StatusIcon size={10} /> {statusConf.label}
                          </span>
                          {!isEgreso && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${methodConf.color}`}>
                              <MethodIcon size={10} /> {methodConf.label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {r.created_at ? new Date(r.created_at).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                          {r.branch_name && <span className="text-[11px] text-slate-400 dark:text-slate-500">· {r.branch_name}</span>}
                          {r.customer_name && <span className="text-[11px] text-slate-400 dark:text-slate-500">· {r.customer_name}</span>}
                        </div>
                        {r.items && r.items.length > 0 && (
                          <div className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {r.items.map(i => i.product_name).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className={`text-base font-black ${isEgreso ? 'text-red-600 dark:text-red-400' : isPending ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {isEgreso ? '-' : '+'}${Number(r.total || 0).toLocaleString()}
                        </p>
                      </div>
                      {/* Actions */}
                      {isVenta && !isVoided && getCurrentUser()?.role === 'admin' && (
                        <div className="flex items-center gap-1">
                          {isPending && (
                            <button onClick={() => handleMarkPaid(r)}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                              title="Marcar como pagado">
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button onClick={() => handleDeleteSale(r)}
                            disabled={deletingId === r.id}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                            title="Anular venta">
                            {deletingId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
