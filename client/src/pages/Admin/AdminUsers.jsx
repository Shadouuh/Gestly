import React, { useState, useEffect } from 'react';
import { Search, Users, Mail, Shield, ShieldCheck, ShieldAlert, Clock, CheckCircle, XCircle, MoreVertical, MapPin, Filter, Store, ChevronDown } from 'lucide-react';
import { getAdminUsers } from '../../services/api';
import { DataStatusPanel } from '../../shared/components/DataStatus';
import { useLocation } from 'react-router-dom';

const ROLE_CONFIG = {
  superadmin: { icon: ShieldCheck, label: 'Super Admin', color: 'text-red-600 bg-red-50 dark:bg-red-500/10' },
  OWNER: { icon: Store, label: 'Dueño', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' },
  ADMIN: { icon: Shield, label: 'Admin', color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
  SELLER: { icon: Users, label: 'Vendedor', color: 'text-slate-600 bg-slate-50 dark:bg-slate-500/10' },
  CASHIER: { icon: Users, label: 'Cajero', color: 'text-slate-600 bg-slate-50 dark:bg-slate-500/10' },
};

const AdminUsers = () => {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminUsers()
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || (u.role || '').toLowerCase() === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">Usuarios</h1>
          <p className="text-xs text-slate-500 mt-0.5">{users.length} usuarios registrados</p>
        </div>
        <DataStatusPanel pathname={location.pathname} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuarios..." className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none">
          <option value="all">Todos los roles</option>
          {Object.entries(ROLE_CONFIG).map(([k, v]) => <option key={k} value={k.toLowerCase()}>{v.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-sm text-slate-400">Cargando usuarios...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Usuario', 'Email', 'Rol', 'Negocio', 'Ciudad', 'Estado'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.SELLER;
                  const Icon = roleConf.icon;
                  return (
                    <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{u.name || 'Sin nombre'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleConf.color}`}>
                          <Icon size={10} /> {roleConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{u.business || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{u.city || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${u.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {u.status === 'active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          {u.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
