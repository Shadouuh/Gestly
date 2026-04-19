import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Store, Plus, Users, ArrowUpRight, MapPin, MoreVertical, Package, TrendingUp, X } from 'lucide-react';

const Branches = () => {
  const { isMultiBranch } = useOutletContext();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newBranch, setNewBranch] = useState({ name: '', address: '', city: '' });
  
  const [branches, setBranches] = useState([
    { id: 1, name: 'Sucursal Centro', address: 'Av. Corrientes 1234', employees: 4, todaySales: 25000, status: 'abierta', stockValue: 1250000, productsCount: 340 },
    { id: 2, name: 'Sucursal Norte', address: 'Cabildo 4500', employees: 2, todaySales: 20200, status: 'abierta', stockValue: 850000, productsCount: 210 },
  ]);

  return (
    <div className="p-6 min-h-full flex flex-col max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Mis Sucursales</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona tus puntos de venta, personal y stock independiente</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
          >
            <Plus size={18} />
            Nueva Sucursal
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map(branch => (
          <div key={branch.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="absolute top-4 right-4">
              <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <Store size={28} />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">{branch.name}</h3>
                <div className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <MapPin size={14} />
                  {branch.address}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><TrendingUp size={10}/> Ventas Hoy</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">${branch.todaySales.toLocaleString()}</p>
              </div>
              <div 
                onClick={() => navigate('/app/employees')}
                className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors group/emp"
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Users size={10}/> Personal</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-black text-slate-900 dark:text-white group-hover/emp:text-indigo-600 dark:group-hover/emp:text-indigo-400 transition-colors">{branch.employees}</p>
                  <span className="text-[10px] font-bold text-indigo-500 opacity-0 group-hover/emp:opacity-100 transition-opacity">Ver/Asignar &rarr;</span>
                </div>
              </div>
            </div>

            <div 
              onClick={() => navigate('/app/catalog')}
              className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50 mb-6 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors relative z-10 group/stock"
            >
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Package size={10}/> Inventario (Stock local)</p>
                <span className="text-[10px] font-bold text-indigo-500 opacity-0 group-hover/stock:opacity-100 transition-opacity">Ver en Catálogo &rarr;</span>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-lg font-black text-slate-900 dark:text-white group-hover/stock:text-indigo-600 dark:group-hover/stock:text-indigo-400 transition-colors">{branch.productsCount} <span className="text-xs text-slate-500 font-bold">ítems</span></p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Valor: ${branch.stockValue.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${branch.status === 'abierta' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500'}`}></div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{branch.status}</span>
              </div>
              <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                Administrar <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Branch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Store size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Nueva Sucursal</h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Abre un nuevo punto de venta</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Nombre de la Sucursal</label>
                <input 
                  type="text" 
                  placeholder="Ej. Sucursal Sur"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Dirección</label>
                <input 
                  type="text" 
                  placeholder="Ej. Av. San Martín 321"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Ciudad / Barrio</label>
                <input 
                  type="text" 
                  placeholder="Ej. Belgrano"
                  value={newBranch.city}
                  onChange={(e) => setNewBranch({...newBranch, city: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setBranches([...branches, {
                    id: branches.length + 1,
                    name: newBranch.name || 'Nueva Sucursal',
                    address: newBranch.address || 'Sin dirección',
                    employees: 0,
                    todaySales: 0,
                    status: 'abierta',
                    stockValue: 0,
                    productsCount: 0
                  }]);
                  setIsAddModalOpen(false);
                  setNewBranch({name: '', address: '', city: ''});
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
              >
                Crear Sucursal
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;