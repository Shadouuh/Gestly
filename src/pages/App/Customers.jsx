import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, Mail, MoreVertical, CreditCard, ShoppingBag, X, ArrowLeft, Calendar, FileText, Check } from 'lucide-react';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [customers] = useState([
    { 
      id: 1, name: 'Juan Pérez', phone: '+54 11 4321-8765', email: 'juan.p@email.com', balance: 4500, lastPurchase: '2023-10-25', totalSpent: 125000, visits: 14,
      history: [
        { id: 1043, date: '2023-10-25T11:05:00', items: [{name: 'Coca Cola 2.25L', qty: 2, price: 2500}], amount: 5000, method: 'fiado', status: 'pendiente' },
        { id: 1021, date: '2023-10-18T14:30:00', items: [{name: 'Yerba Taragüi 500g', qty: 1, price: 1400}, {name: 'Pan Bimbo', qty: 1, price: 2100}], amount: 3500, method: 'efectivo', status: 'completada' },
        { id: 980, date: '2023-10-05T09:15:00', items: [{name: 'Leche La Serenísima', qty: 3, price: 1100}], amount: 3300, method: 'fiado', status: 'completada' }
      ]
    },
    { 
      id: 2, name: 'María Gómez', phone: '+54 11 9876-5432', email: 'maria.g@email.com', balance: 0, lastPurchase: '2023-10-24', totalSpent: 45000, visits: 6,
      history: [
        { id: 1041, date: '2023-10-24T16:20:00', items: [{name: 'Shampoo Pantene', qty: 1, price: 3500}], amount: 3500, method: 'tarjeta', status: 'completada' }
      ]
    },
    { 
      id: 3, name: 'Carlos Rodríguez', phone: '+54 11 5555-4444', email: 'carlos.r@email.com', balance: 12500, lastPurchase: '2023-10-22', totalSpent: 210000, visits: 25,
      history: [
        { id: 1040, date: '2023-10-22T10:10:00', items: [{name: 'Vino Rutini Malbec', qty: 2, price: 8500}], amount: 17000, method: 'fiado', status: 'pendiente' },
        { id: 1010, date: '2023-10-15T18:45:00', items: [{name: 'Cerveza Quilmes 1L', qty: 6, price: 2500}], amount: 15000, method: 'efectivo', status: 'completada' }
      ]
    },
    { id: 4, name: 'Ana Martínez', phone: '+54 11 3333-2222', email: 'ana.m@email.com', balance: 0, lastPurchase: '2023-10-20', totalSpent: 15000, visits: 2, history: [] },
    { id: 5, name: 'Roberto Silva', phone: '+54 11 1111-9999', email: 'roberto.s@email.com', balance: 800, lastPurchase: '2023-10-18', totalSpent: 85000, visits: 9, history: [] },
  ]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const totalDebt = customers.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="p-6 h-full flex flex-col max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Clientes y Deudores</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona tu cartera de clientes y cuentas corrientes</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-5 rounded-3xl shadow-xl shadow-indigo-900/20 relative overflow-hidden text-white border border-indigo-500/30 group hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <svg className="absolute bottom-0 left-0 w-full h-24 opacity-20 pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,218.7C960,224,1056,192,1152,165.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Total Clientes</p>
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <User size={16} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-black tracking-tight mb-1">{customers.length}</p>
              <p className="text-xs text-indigo-200 font-medium">En base de datos</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-900 p-5 rounded-3xl shadow-xl shadow-yellow-900/20 relative overflow-hidden text-white border border-yellow-500/30 group hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-yellow-200 uppercase tracking-wider">Deuda Total (Fiados)</p>
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <CreditCard size={16} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-black tracking-tight mb-1">${totalDebt.toLocaleString()}</p>
              <p className="text-xs text-yellow-200 font-medium">Cuentas por cobrar</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-5 rounded-3xl shadow-xl shadow-emerald-900/20 relative overflow-hidden text-white border border-emerald-500/30 group hover:-translate-y-1 transition-all duration-300 cursor-pointer sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Valor LTV (Histórico)</p>
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-black tracking-tight mb-1">${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}</p>
              <p className="text-xs text-emerald-200 font-medium">Ingresos totales de clientes</p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      {selectedCustomer ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col w-full mb-6 animate-fadeIn">
          {/* Customer Detail Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black uppercase text-lg border border-indigo-100 dark:border-indigo-500/20">
                  {selectedCustomer.name.substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedCustomer.name}</h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{selectedCustomer.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto mt-2 sm:mt-0">
              <div className="flex-1 sm:flex-none text-center sm:text-right bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Invertido</p>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">${selectedCustomer.totalSpent.toLocaleString()}</p>
              </div>
              <div className={`flex-1 sm:flex-none text-center sm:text-right p-3 rounded-xl border ${selectedCustomer.balance > 0 ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Balance</p>
                {selectedCustomer.balance > 0 ? (
                  <p className="text-lg font-black text-red-500">-${selectedCustomer.balance.toLocaleString()}</p>
                ) : (
                  <p className="text-lg font-black text-emerald-500">Al día</p>
                )}
              </div>
            </div>
          </div>

          {/* Transaction History List */}
          <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50 rounded-b-3xl">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-slate-400" />
              Historial de Compras y Fiados
            </h3>
            
            {selectedCustomer.history.length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <ShoppingBag size={32} className="mx-auto mb-3 opacity-30 text-slate-400" />
                <p className="font-bold text-sm">Sin historial de compras</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedCustomer.history.map(t => (
                  <div key={t.id} className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 sm:mt-0 ${
                        t.method === 'fiado' 
                          ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500 border border-yellow-100 dark:border-yellow-900/50'
                          : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border border-emerald-100 dark:border-emerald-900/50'
                      }`}>
                        {t.method === 'fiado' ? <CreditCard size={18} /> : <ShoppingBag size={18} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-slate-900 dark:text-white text-sm">Ticket #{t.id}</span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Calendar size={10} /> {new Date(t.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 space-y-1">
                          {t.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                              {item.qty}x {item.name} <span className="opacity-50">(${item.price})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-1.5 pt-3 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-0 w-full sm:w-auto">
                      <span className={`text-lg font-black ${t.status === 'pendiente' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                        ${t.amount.toLocaleString()}
                      </span>
                      {t.method === 'fiado' && (
                        <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border ${
                          t.status === 'completada' 
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                          {t.status === 'completada' ? <><Check size={10} /> Pagado</> : 'Deuda Pendiente'}
                        </div>
                      )}
                      {t.method === 'efectivo' && (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/50 uppercase tracking-wider">Contado</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col w-full mb-6 animate-fadeIn">
          
          {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-3xl">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-colors dark:text-white"
            />
          </div>
        </div>

        {/* Responsive Content: Table on Desktop, Cards on Mobile */}
        <div className="w-full bg-slate-50/50 dark:bg-slate-950/50 overflow-x-auto rounded-b-3xl">
          
          {isMobile ? (
            /* MOBILE CARDS VIEW */
            <div className="p-4 space-y-4">
              {filteredCustomers.map(customer => (
                <div 
                  key={customer.id} 
                  onClick={() => setSelectedCustomer(customer)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-md flex flex-col gap-4 relative overflow-hidden group cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black uppercase text-lg shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                        {customer.name.substring(0, 2)}
                      </div>
                      <div>
                        <span className="font-black text-slate-900 dark:text-white text-lg">{customer.name}</span>
                        <div className="flex flex-col mt-1">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Phone size={12}/> {customer.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Última Compra</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {new Date(customer.lastPurchase).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Visitas</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {customer.visits} veces
                      </p>
                    </div>
                    <div className="col-span-2 mt-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Invertido (LTV)</p>
                      <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">${customer.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Balance Actual</span>
                      {customer.balance > 0 ? (
                        <span className="text-lg font-black text-red-500">Deuda: ${customer.balance.toLocaleString()}</span>
                      ) : (
                        <span className="text-lg font-black text-emerald-500">Al día</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* DESKTOP TABLE VIEW */
            <div className="w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cliente</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contacto</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Total Invertido</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Balance</th>
                    <th className="p-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredCustomers.map(customer => (
                    <tr 
                      key={customer.id} 
                      onClick={() => setSelectedCustomer(customer)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black uppercase shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                            {customer.name.substring(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white">{customer.name}</span>
                            <span className="text-[11px] font-bold text-slate-400 mt-0.5">Última compra: {new Date(customer.lastPurchase).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                            <Phone size={14} className="text-slate-400" />
                            {customer.phone}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                            <Mail size={12} className="text-slate-400" />
                            {customer.email}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-black text-indigo-600 dark:text-indigo-400">${customer.totalSpent.toLocaleString()}</span>
                          <span className="text-[11px] font-bold text-slate-400 mt-0.5">{customer.visits} visitas</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {customer.balance > 0 ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="font-black text-red-500">${customer.balance.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-red-700 bg-red-100 dark:bg-red-500/20 px-2 py-0.5 rounded-md mt-1 border border-red-200 dark:border-red-500/30">Deuda</span>
                          </div>
                        ) : (
                          <span className="font-black text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">Al día</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {filteredCustomers.length === 0 && (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900">
              <User size={48} className="mx-auto mb-4 opacity-30 text-indigo-500" />
              <p className="font-bold text-lg">No se encontraron clientes</p>
              <p className="text-sm font-medium mt-1">Revisa tu búsqueda o añade uno nuevo.</p>
            </div>
          )}
        </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Nuevo Cliente</h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Ingresa los datos del nuevo contacto</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  placeholder="Ej. Juan Pérez"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Teléfono</label>
                  <input 
                    type="tel" 
                    placeholder="Ej. +54 11 4321-8765"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Email (Opcional)</label>
                  <input 
                    type="email" 
                    placeholder="Ej. juan@email.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Dirección (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Calle, Ciudad, Provincia"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all dark:text-white"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  console.log("Saving...", newCustomer);
                  setIsAddModalOpen(false);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
              >
                Guardar Cliente
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;