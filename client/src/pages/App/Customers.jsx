import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, MoreVertical, CreditCard, ShoppingBag, X, ArrowLeft, Calendar, FileText, Check, Loader2 } from 'lucide-react';
import api, { getCurrentBusiness } from '../../services/api';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

  const loadCustomers = async () => {
    try {
      const b = getCurrentBusiness();
      if (!b?.id) return;
      const res = await api.get('/customers', { params: { businessId: b.id } });
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error loading customers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, []);

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim()) return;
    setSaving(true);
    try {
      const b = getCurrentBusiness();
      const res = await api.post('/customers', {
        business_id: b.id,
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim() || null,
      });
      setCustomers(prev => [...prev, res.data]);
      setNewCustomer({ name: '', phone: '' });
      setIsAddModalOpen(false);
    } catch (e) {
      console.error('Error creating customer:', e);
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-5 h-full flex flex-col w-full max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="app-page-title">Clientes</h1>
          <p className="app-page-subtitle mt-0.5">Gestiona tu cartera de clientes</p>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--sidebar-active-text)' }}
        >
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="app-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' + '15' }}>
            <User size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{customers.length}</p>
            <p className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>Total Clientes</p>
          </div>
        </div>
        <div className="app-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <CreditCard size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-xl font-black text-red-500">{customers.filter(c => c.balance > 0).length}</p>
            <p className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>Con deuda</p>
          </div>
        </div>
        <div className="app-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <ShoppingBag size={18} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-xl font-black text-emerald-500">{customers.filter(c => !c.balance || c.balance === 0).length}</p>
            <p className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>Al día</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="app-card p-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none transition-colors"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />
        </div>
      ) : selectedCustomer ? (
        /* Customer Detail */
        <div className="app-card flex flex-col w-full animate-fadeIn">
          <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-secondary)' }}
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black uppercase text-lg" style={{ backgroundColor: 'var(--color-primary)' + '15', color: 'var(--color-primary)' }}>
                {selectedCustomer.name?.substring(0, 2)}
              </div>
              <div>
                <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{selectedCustomer.name}</h2>
                <p className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <Phone size={12} /> {selectedCustomer.phone || 'Sin teléfono'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FileText size={16} style={{ color: 'var(--text-secondary)' }} />
              Información del Cliente
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--input-bg)' }}>
                <p className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>ID</p>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>#{selectedCustomer.id}</p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--input-bg)' }}>
                <p className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Teléfono</p>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{selectedCustomer.phone || '—'}</p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--input-bg)' }}>
                <p className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Balance</p>
                <p className="text-xs font-bold" style={{ color: selectedCustomer.balance > 0 ? '#ef4444' : '#10b981' }}>
                  {selectedCustomer.balance > 0 ? `$${selectedCustomer.balance.toLocaleString()}` : 'Al día'}
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--input-bg)' }}>
                <p className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Registro</p>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Customer Table */
        <div className="app-card flex flex-col w-full animate-fadeIn overflow-hidden">
          {filteredCustomers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-secondary)' }}>
              <User size={40} className="mb-3 opacity-30" />
              <p className="font-bold text-sm">{customers.length === 0 ? 'No hay clientes registrados' : 'No se encontraron clientes'}</p>
              <p className="text-xs mt-1">{customers.length === 0 ? 'Agregá tu primer cliente para empezar' : 'Probá con otra búsqueda'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Cliente</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Teléfono</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-right" style={{ color: 'var(--text-secondary)' }}>Balance</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-right" style={{ color: 'var(--text-secondary)' }}>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer, idx) => (
                    <tr 
                      key={customer.id} 
                      onClick={() => setSelectedCustomer(customer)}
                      className="border-b cursor-pointer transition-colors hover:opacity-80"
                      style={{ borderColor: 'var(--border-color)', backgroundColor: idx % 2 === 0 ? 'var(--card-bg)' : 'var(--input-bg)' }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0" style={{ backgroundColor: 'var(--color-primary)' + '15', color: 'var(--color-primary)' }}>
                            {customer.name?.substring(0, 2)}
                          </div>
                          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                          <Phone size={12} /> {customer.phone || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {customer.balance > 0 ? (
                          <span className="text-xs font-black text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg">
                            ${customer.balance.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                            Al día
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                          {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl shadow-2xl border animate-scaleIn" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex justify-between items-center p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Nuevo Cliente</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nombre *</label>
                <input 
                  type="text" 
                  placeholder="Ej. Juan Pérez"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Teléfono (opcional)</label>
                <input 
                  type="tel" 
                  placeholder="Ej. +54 11 4321-8765"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
            <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: 'var(--border-color)' }}>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddCustomer}
                disabled={saving || !newCustomer.name.trim()}
                className="px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--sidebar-active-text)' }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
