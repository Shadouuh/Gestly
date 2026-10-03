import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign, Loader2, X, Users, Filter, RefreshCw, Package, Clock, CheckCircle, Trash2, CreditCard, Banknote, ArrowRightLeft, LayoutGrid, Table2, Download, CalendarDays, ArrowUpDown, Wallet } from 'lucide-react';
import { getCurrentBusiness, getCurrentUser } from '../../services/api';
import api from '../../services/api';
import { useNotification } from '../../shared/components/Notification/NotificationContext';

const PAYMENT_CONFIG = {
  cash: { label: 'Efectivo', icon: Banknote, pill: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' },
  mp: { label: 'MercadoPago', icon: CreditCard, pill: 'text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20' },
  transfer: { label: 'Transferencia', icon: ArrowRightLeft, pill: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20' },
  fiado: { label: 'Fiado', icon: Clock, pill: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20' },
  efectivo: { label: 'Efectivo', icon: Banknote, pill: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' },
  tarjeta: { label: 'Tarjeta/Transf.', icon: CreditCard, pill: 'text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20' },
};

const STATUS_CONFIG = {
  paid: { label: 'Pagado', icon: CheckCircle, dot: 'bg-emerald-500', pill: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' },
  pending: { label: 'Pendiente', icon: Clock, dot: 'bg-amber-500', pill: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20' },
  voided: { label: 'Anulada', icon: X, dot: 'bg-slate-400', pill: 'text-slate-500 bg-slate-100 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10' },
};

const Sales = () => {
  const notify = useNotification();
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [viewMode, setViewMode] = useState('table');
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = () => {
    const business = getCurrentBusiness();
    if (!business) { setLoading(false); return; }
    setLoading(true);
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
      countVentas: ventas.length,
    };
  }, [rows]);

  const neto = stats.totalIngresos - stats.totalEgresos;

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (statusFilter !== 'all') n++;
    if (methodFilter !== 'all') n++;
    if (typeFilter !== 'all') n++;
    if (dateFilter !== 'all') n++;
    if (clientFilter) n++;
    if (search) n++;
    return n;
  }, [statusFilter, methodFilter, typeFilter, dateFilter, clientFilter, search]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const day = 86400000;
    let list = rows.filter(r => {
      if (typeFilter !== 'all' && r._type !== typeFilter) return false;
      if (statusFilter !== 'all' && (r.status || 'paid') !== statusFilter) return false;
      if (methodFilter !== 'all' && r.payment_method !== methodFilter) return false;
      if (dateFilter !== 'all') {
        const diff = now - (r._date || 0);
        if (dateFilter === 'today' && diff > day) return false;
        if (dateFilter === '7d' && diff > 7 * day) return false;
        if (dateFilter === '30d' && diff > 30 * day) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchId = String(r.id).toLowerCase().includes(q);
        const matchDesc = (r.description || '').toLowerCase().includes(q);
        const matchCustomer = (r.customer_name || '').toLowerCase().includes(q);
        const matchBranch = (r.branch_name || '').toLowerCase().includes(q);
        if (!matchId && !matchDesc && !matchCustomer && !matchBranch) return false;
      }
      if (clientFilter && r._type === 'venta' && !(r.customer_name || '').toLowerCase().includes(clientFilter.toLowerCase())) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'date_asc') return (a._date || 0) - (b._date || 0);
      if (sortBy === 'total_desc') return Number(b.total || 0) - Number(a.total || 0);
      if (sortBy === 'total_asc') return Number(a.total || 0) - Number(b.total || 0);
      return (b._date || 0) - (a._date || 0);
    });
    return list;
  }, [rows, search, clientFilter, statusFilter, methodFilter, typeFilter, dateFilter, sortBy]);

  const clearFilters = () => {
    setSearch(''); setClientFilter(''); setStatusFilter('all');
    setMethodFilter('all'); setTypeFilter('all'); setDateFilter('all'); setSortBy('date_desc');
  };

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

  const handleExport = () => {
    if (!filtered.length) { notify.warning('No hay datos para exportar'); return; }
    const header = 'id;tipo;fecha;cliente;sucursal;metodo;estado;total;detalle\n';
    const body = filtered.map(r => [
      r.id, r._type,
      r.created_at ? new Date(r.created_at).toLocaleString('es-AR') : '',
      `"${(r.customer_name || '').replace(/"/g, "'")}"`,
      `"${(r.branch_name || '').replace(/"/g, "'")}"`,
      r.payment_method || '', r.status || 'paid', Number(r.total || 0),
      `"${((r.description || (r.items || []).map(i => i.product_name).join(', ')) || '').replace(/"/g, "'")}"`,
    ].join(';')).join('\n');
    const blob = new Blob(["\ufeff" + header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ventas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    notify.success('CSV exportado');
  };

  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const kpis = [
    { key: 'ing', label: 'Ingresos cobrados', value: stats.totalIngresos, sub: `${stats.countPagadas} ventas pagadas`, icon: TrendingUp, wrap: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20', iconWrap: 'bg-emerald-500 text-white', text: 'text-emerald-600 dark:text-emerald-300' },
    { key: 'egr', label: 'Egresos', value: stats.totalEgresos, sub: `${stats.countEgresos} movimientos`, icon: TrendingDown, wrap: 'from-rose-500/15 to-rose-500/5 border-rose-500/20', iconWrap: 'bg-rose-500 text-white', text: 'text-rose-600 dark:text-rose-300' },
    { key: 'net', label: neto >= 0 ? 'Balance neto' : 'Balance neto', value: neto, sub: neto >= 0 ? 'Ganancia del período' : 'Pérdida del período', icon: Wallet, wrap: neto >= 0 ? 'from-blue-500/15 to-blue-500/5 border-blue-500/20' : 'from-orange-500/15 to-orange-500/5 border-orange-500/20', iconWrap: neto >= 0 ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white', text: neto >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-600 dark:text-orange-300' },
    { key: 'pen', label: 'Pendiente de cobro', value: stats.totalPendiente, sub: `${stats.countPendientes} fiados abiertos`, icon: Clock, wrap: 'from-amber-500/15 to-amber-500/5 border-amber-500/20', iconWrap: 'bg-amber-500 text-white', text: 'text-amber-600 dark:text-amber-300' },
  ];

  const renderRowActions = (r, isVenta, isVoided, isPending) => (
    <div className="flex items-center justify-end gap-1">
      {isVenta && !isVoided && getCurrentUser()?.role === 'admin' && (
        <>
          {isPending && (
            <button onClick={() => handleMarkPaid(r)}
              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500 hover:text-white transition-colors"
              title="Marcar como pagado">
              <CheckCircle size={15} />
            </button>
          )}
          <button onClick={() => handleDeleteSale(r)}
            disabled={deletingId === r.id}
            className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500 hover:text-white transition-colors disabled:opacity-50"
            title="Anular venta">
            {deletingId === r.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
        </>
      )}
    </div>
  );

  const renderCards = (list, compact = false) => (
    <div className={compact ? 'space-y-2' : 'grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3'}>
      {list.map(r => {
        const isVenta = r._type === 'venta';
        const isEgreso = r._type === 'egreso';
        const status = r.status || 'paid';
        const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG.paid;
        const methodConf = PAYMENT_CONFIG[r.payment_method] || { label: r.payment_method || '—', icon: DollarSign, pill: 'text-slate-600 bg-slate-100 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10' };
        const MethodIcon = methodConf.icon;
        const StatusIcon = statusConf.icon;
        const isVoided = status === 'voided';
        const isPending = status === 'pending';
        return (
          <div key={r.id} className={`group bg-white dark:bg-white/[0.03] rounded-2xl border p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 ${isVoided ? 'border-slate-200 dark:border-white/10 opacity-60' : isPending ? 'border-amber-500/30' : 'border-slate-200/80 dark:border-white/10'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isEgreso ? 'bg-rose-500/10 text-rose-500' : isPending ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {isEgreso ? <TrendingDown size={18} /> : isPending ? <Clock size={18} /> : <TrendingUp size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-display text-[13px] font-bold text-slate-900 dark:text-white">#{r.id}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConf.pill}`}>
                      <StatusIcon size={10} /> {statusConf.label}
                    </span>
                    {!isEgreso && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${methodConf.pill}`}>
                        <MethodIcon size={10} /> {methodConf.label}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {fmtDate(r.created_at)}
                    {r.branch_name ? ` · ${r.branch_name}` : ''}{r.customer_name ? ` · ${r.customer_name}` : ''}
                  </p>
                  {(r.description || (r.items && r.items.length > 0)) && (
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {r.description || r.items.map(i => i.product_name).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-num text-[15px] font-bold tabular-nums ${isEgreso ? 'text-rose-600 dark:text-rose-300' : isPending ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300'}`}>
                  {isEgreso ? '−' : '+'}${Number(r.total || 0).toLocaleString('es-AR')}
                </p>
                <div className="mt-1.5">{renderRowActions(r, isVenta, isVoided, isPending)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#f6f7f9] dark:bg-black overflow-hidden font-sans">
      {/* Header */}
      <div className="shrink-0 px-4 lg:px-6 pt-4 pb-3 border-b border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-black/80 backdrop-blur">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center">
                <DollarSign size={18} className="text-white dark:text-slate-900" strokeWidth={2.5} />
              </span>
              <div>
                <h1 className="font-display text-[19px] leading-none font-extrabold tracking-tight text-slate-900 dark:text-white">Ventas</h1>
                <p className="mt-1 text-[12px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-200">{stats.countVentas} ventas</span> · {stats.countPendientes} pendientes · {stats.countEgresos} egresos
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl p-1">
              <button onClick={() => setViewMode('table')} title="Vista tabla"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${viewMode === 'table' ? 'bg-white dark:bg-white text-slate-900 shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                <Table2 size={14} /> <span className="hidden sm:inline">Tabla</span>
              </button>
              <button onClick={() => setViewMode('cards')} title="Vista tarjetas"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-white text-slate-900 shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                <LayoutGrid size={14} /> <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
              <Download size={14} /> <span className="hidden sm:inline">CSV</span>
            </button>
            <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 mb-3">
          {kpis.map(k => (
            <div key={k.key} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-3.5 ${k.wrap} bg-white dark:bg-white/[0.03]`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{k.label}</p>
                  <p className={`font-display mt-1 text-[22px] leading-none font-extrabold tracking-tight tabular-nums ${k.text}`}>
                    ${Number(k.value || 0).toLocaleString('es-AR')}
                  </p>
                  <p className="mt-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{k.sub}</p>
                </div>
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${k.iconWrap}`}>
                  <k.icon size={17} strokeWidth={2.4} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Search + quick filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por ID, cliente, sucursal o detalle…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-slate-900 dark:focus:border-white/30 transition-all" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            {[{ k: 'date_desc', l: 'Recientes' }, { k: 'total_desc', l: 'Mayor total' }].map(o => (
              <button key={o.k} onClick={() => setSortBy(o.k)}
                className={`px-3 py-2.5 rounded-xl text-[12px] font-bold border transition-colors ${sortBy === o.k ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'}`}>
                {o.l}
              </button>
            ))}
          </div>
          <button onClick={() => setFilterOpen(!filterOpen)}
            className={`relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12px] font-bold border transition-all ${filterOpen || activeFiltersCount > 0 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'}`}>
            <Filter size={14} /> Filtros
            {activeFiltersCount > 0 && (
              <span className="min-w-[20px] h-5 px-1 rounded-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[11px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 animate-fadeIn">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em] block mb-2">Tipo</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[{ key: 'all', label: 'Todo' }, { key: 'venta', label: 'Ventas' }, { key: 'egreso', label: 'Egresos' }].map(s => (
                    <button key={s.key} onClick={() => setTypeFilter(s.key)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${typeFilter === s.key ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-400'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em] block mb-2">Estado</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[{ key: 'all', label: 'Todos' }, { key: 'paid', label: 'Pagados' }, { key: 'pending', label: 'Pendientes' }, { key: 'voided', label: 'Anulados' }].map(s => (
                    <button key={s.key} onClick={() => setStatusFilter(s.key)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${statusFilter === s.key ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-400'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em] block mb-2">Método de pago</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[{ key: 'all', label: 'Todos' }, { key: 'cash', label: 'Efectivo' }, { key: 'mp', label: 'MP' }, { key: 'transfer', label: 'Transf.' }, { key: 'fiado', label: 'Fiado' }].map(m => (
                    <button key={m.key} onClick={() => setMethodFilter(m.key)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${methodFilter === m.key ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-400'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em] block mb-2">Período</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[{ key: 'all', label: 'Siempre' }, { key: 'today', label: 'Hoy' }, { key: '7d', label: '7 días' }, { key: '30d', label: '30 días' }].map(o => (
                    <button key={o.key} onClick={() => setDateFilter(o.key)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${dateFilter === o.key ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-400'}`}>
                      <CalendarDays size={11} /> {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-white/10 grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em] block mb-2">Cliente</label>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={clientFilter} onChange={e => setClientFilter(e.target.value)}
                    placeholder="Filtrar por cliente…"
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-[12px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-slate-900 dark:focus:border-white/30" />
                  {clientFilter && (
                    <button onClick={() => setClientFilter('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                      <X size={14} />
                    </button>
                  )}
                </div>
                {customers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {customers.filter(c => !clientFilter || c.name?.toLowerCase().includes(clientFilter.toLowerCase())).slice(0, 5).map(c => (
                      <button key={c.id} onClick={() => setClientFilter(c.name)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${clientFilter === c.name ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'}`}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em] block mb-2">Ordenar por</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[{ k: 'date_desc', l: 'Más recientes' }, { k: 'date_asc', l: 'Más antiguas' }, { k: 'total_desc', l: 'Mayor monto' }, { k: 'total_asc', l: 'Menor monto' }].map(o => (
                    <button key={o.k} onClick={() => setSortBy(o.k)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${sortBy === o.k ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'}`}>
                      <ArrowUpDown size={11} /> {o.l}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={clearFilters} className="text-[12px] font-bold text-rose-500 hover:text-rose-600">
                    Limpiar todo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 lg:px-6 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={28} className="animate-spin text-slate-300 dark:text-slate-600" />
            <p className="font-display text-[13px] font-bold text-slate-400">Cargando movimientos…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
              <Package size={30} strokeWidth={1.2} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-display text-[15px] font-extrabold text-slate-700 dark:text-slate-200">Sin resultados</p>
            <p className="text-[12px] font-medium text-slate-400 max-w-xs">No hay movimientos con esos filtros. Probá limpiar o registrá ventas desde el POS.</p>
            {(activeFiltersCount > 0) && (
              <button onClick={clearFilters} className="mt-1 px-4 py-2 rounded-xl text-[12px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <>
            {/* Tabla desktop */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.03]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[860px]">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-white/[0.04] border-b border-slate-200 dark:border-white/10">
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Venta</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Cliente / Sucursal</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Detalle</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Método</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Estado</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400 text-right">Total</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filtered.map(r => {
                      const isVenta = r._type === 'venta';
                      const isEgreso = r._type === 'egreso';
                      const status = r.status || 'paid';
                      const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG.paid;
                      const methodConf = PAYMENT_CONFIG[r.payment_method] || { label: r.payment_method || '—', icon: DollarSign, pill: 'text-slate-500 bg-slate-100 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10' };
                      const MethodIcon = methodConf.icon;
                      const StatusIcon = statusConf.icon;
                      const isVoided = status === 'voided';
                      const isPending = status === 'pending';
                      return (
                        <tr key={r.id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04] ${isVoided ? 'opacity-55' : ''}`}>
                          <td className="px-4 py-3 align-top">
                            <p className="font-display text-[13px] font-extrabold text-slate-900 dark:text-white leading-none">#{r.id}</p>
                            <p className="mt-1 text-[11px] font-medium text-slate-400 whitespace-nowrap">{fmtDate(r.created_at)}</p>
                            <span className={`mt-1.5 inline-block px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${isEgreso ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300' : 'bg-blue-500/10 text-blue-600 dark:text-blue-300'}`}>
                              {isEgreso ? 'Egreso' : 'Venta'}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top max-w-[190px]">
                            <p className="text-[12px] font-bold text-slate-800 dark:text-slate-100 truncate">{r.customer_name || '—'}</p>
                            <p className="text-[11px] font-medium text-slate-400 truncate">{r.branch_name || 'Sin sucursal'}</p>
                          </td>
                          <td className="px-4 py-3 align-top max-w-[240px]">
                            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 truncate">
                              {r.description || (r.items && r.items.length ? r.items.map(i => i.product_name).join(', ') : '—')}
                            </p>
                            {r.items && r.items.length > 0 && (
                              <p className="text-[10px] font-semibold text-slate-400">{r.items.length} ítems</p>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            {!isEgreso ? (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${methodConf.pill}`}>
                                <MethodIcon size={12} /> {methodConf.label}
                              </span>
                            ) : <span className="text-[12px] text-slate-400">—</span>}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${statusConf.pill}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                              <StatusIcon size={11} /> {statusConf.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top text-right">
                            <p className={`font-num text-[14px] font-bold tabular-nums whitespace-nowrap ${isEgreso ? 'text-rose-600 dark:text-rose-300' : isPending ? 'text-amber-600 dark:text-amber-300' : 'text-slate-900 dark:text-white'}`}>
                              {isEgreso ? '−' : '+'}${Number(r.total || 0).toLocaleString('es-AR')}
                            </p>
                          </td>
                          <td className="px-4 py-3 align-top">
                            {renderRowActions(r, isVenta, isVoided, isPending)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400">{filtered.length} movimientos</p>
                <p className="font-num text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                  Total visible: ${filtered.filter(f => f._type === 'venta' && f.status === 'paid').reduce((s, f) => s + Number(f.total || 0), 0).toLocaleString('es-AR')}
                </p>
              </div>
            </div>
            {/* Cards en mobile cuando está en modo tabla */}
            <div className="md:hidden">
              {renderCards(filtered, true)}
            </div>
          </>
        ) : (
          renderCards(filtered, false)
        )}
      </div>
    </div>
  );
};

export default Sales;
