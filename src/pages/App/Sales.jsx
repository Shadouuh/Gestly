import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Search, Banknote, BookOpen, ChevronDown, Filter, Calendar, Check, Clock, TrendingDown, TrendingUp, AlertTriangle, User, MonitorSmartphone, X, ChevronRight } from 'lucide-react';

const Sales = () => {
  const [activeTab, setActiveTab] = useState('transacciones'); // 'transacciones', 'fiados'
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('Mes');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Filtros Avanzados
  const [filterType, setFilterType] = useState('all'); // all, ingreso, egreso
  const [filterMethod, setFilterMethod] = useState('all'); // all, efectivo, tarjeta, fiado, perdida
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);

  const typeDropdownRef = useRef(null);
  const methodDropdownRef = useRef(null);

  const filterTypeOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'ingreso', label: 'Ingresos (Ventas)' },
    { value: 'egreso', label: 'Egresos (Pérdidas)' }
  ];

  const filterMethodOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta / Transferencia' },
    { value: 'fiado', label: 'Fiados' },
    { value: 'perdida', label: 'Pérdidas de Stock' }
  ];

  // Lógica para Fiados
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  
  const [sales, setSales] = useState([
    { id: 1045, date: '2023-10-25T14:30:00', type: 'ingreso', amount: 4500, method: 'efectivo', items: 3, status: 'completada', seller: 'Martín', register: 'Caja 1' },
    { id: 1044, date: '2023-10-25T12:15:00', type: 'ingreso', amount: 8200, method: 'tarjeta', items: 5, status: 'completada', seller: 'Laura', register: 'Caja 2' },
    { id: 1043, date: '2023-10-25T11:05:00', type: 'ingreso', amount: 1500, method: 'fiado', customer: 'Juan Pérez', items: 1, status: 'pendiente', seller: 'Martín', register: 'Caja 1' },
    { id: 1042, date: '2023-10-24T18:45:00', type: 'ingreso', amount: 3200, method: 'efectivo', items: 2, status: 'completada', seller: 'Juan', register: 'Caja 1' },
    { id: 1041, date: '2023-10-24T16:20:00', type: 'ingreso', amount: 12500, method: 'tarjeta', items: 8, status: 'completada', seller: 'Laura', register: 'Caja 2' },
    { id: 1040, date: '2023-10-24T10:10:00', type: 'ingreso', amount: 4800, method: 'fiado', customer: 'Carlos R.', items: 4, status: 'pendiente', seller: 'Martín', register: 'Caja 1' },
    { id: 1039, date: '2023-10-23T19:30:00', type: 'ingreso', amount: 2100, method: 'efectivo', items: 2, status: 'completada', seller: 'Juan', register: 'Caja 1' },
    { id: 1038, date: '2023-10-23T14:00:00', type: 'egreso', amount: 8500, method: 'perdida', items: 0, status: 'completada', seller: 'Sistema', register: 'General', reason: 'Vencimiento de Lácteos' },
    { id: 1037, date: '2023-10-22T09:15:00', type: 'egreso', amount: 3200, method: 'perdida', items: 0, status: 'completada', seller: 'Martín', register: 'Caja 1', reason: 'Faltante de caja' },
  ]);

  // Cargar egresos de compras desde localStorage
  useEffect(() => {
    const loadExpenses = () => {
      const mockExpenses = JSON.parse(localStorage.getItem('gestly_mock_expenses') || '[]');
      if (mockExpenses.length > 0) {
        const formattedExpenses = mockExpenses.map(exp => ({
          id: exp.id,
          date: exp.date,
          type: 'egreso',
          amount: exp.amount,
          method: 'efectivo',
          items: 0,
          status: 'completada',
          seller: 'Admin',
          register: exp.branch === 'centro' ? 'Caja 1' : 'Caja 2',
          reason: exp.description
        }));
        
        // Evitar duplicados
        setSales(prev => {
          const prevIds = new Set(prev.map(p => p.id));
          const newExpenses = formattedExpenses.filter(e => !prevIds.has(e.id));
          return [...newExpenses, ...prev];
        });
      }
    };

    loadExpenses();
    window.addEventListener('gestly_expenses_updated', loadExpenses);
    return () => window.removeEventListener('gestly_expenses_updated', loadExpenses);
  }, []);

  const fiadosPorCliente = sales
    .filter(s => s.method === 'fiado' && (!searchTerm || (s.customer && s.customer.toLowerCase().includes(searchTerm.toLowerCase()))))
    .reduce((acc, curr) => {
      const cliente = curr.customer || 'Cliente Anónimo';
      if (!acc[cliente]) {
        acc[cliente] = {
          cliente: cliente,
          total: 0,
          pagado: 0,
          pendiente: 0,
          transacciones: []
        };
      }
      acc[cliente].total += curr.amount;
      if (curr.status === 'completada') {
        acc[cliente].pagado += curr.amount;
      } else {
        acc[cliente].pendiente += curr.amount;
      }
      acc[cliente].transacciones.push(curr);
      return acc;
    }, {});

  const fiadosArray = Object.values(fiadosPorCliente);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
      if (methodDropdownRef.current && !methodDropdownRef.current.contains(event.target)) {
        setIsMethodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isMonth = dateRange === 'Mes';
  
  // Sumar dinámicamente los egresos actuales del estado `sales`
  const egresosDinamicos = sales.filter(s => s.type === 'egreso').reduce((acc, s) => acc + s.amount, 0);
  const ingresosDinamicos = sales.filter(s => s.type === 'ingreso').reduce((acc, s) => acc + s.amount, 0);

  const stats = {
    ingresos: isMonth ? 142500 + ingresosDinamicos : 14200 + ingresosDinamicos,
    egresos: isMonth ? 12000 + egresosDinamicos : 8500 + egresosDinamicos,
    efectivo: isMonth ? 85200 : 7700,
    transferencia: isMonth ? 42800 : 5000,
    fiadoEsperado: isMonth ? 14500 : 1500,
    fiadoCobrado: isMonth ? 4500 : 0,
  };

  const totalCaja = stats.efectivo + stats.transferencia + stats.fiadoCobrado - stats.egresos;
  const totalEsperado = stats.efectivo + stats.transferencia + stats.fiadoEsperado - stats.egresos;

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.id.toString().includes(searchTerm) || 
      (s.customer && s.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.seller && s.seller.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.reason && s.reason.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesType = filterType === 'all' || s.type === filterType;
    const matchesMethod = filterMethod === 'all' || s.method === filterMethod;
    
    return matchesSearch && matchesType && matchesMethod;
  });

  const toggleStatus = (id) => {
    setSales(prev => prev.map(s => 
      s.id === id ? { ...s, status: s.status === 'completada' ? 'pendiente' : 'completada' } : s
    ));
  };

  const getMethodIcon = (method) => {
    switch(method) {
      case 'efectivo': return <Banknote size={16} />;
      case 'tarjeta': return <CreditCard size={16} />;
      case 'fiado': return <BookOpen size={16} />;
      case 'perdida': return <AlertTriangle size={16} />;
      default: return <CreditCard size={16} />;
    }
  };

  const getMethodColor = (method) => {
    switch(method) {
      case 'efectivo': return 'text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';
      case 'tarjeta': return 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-500/10';
      case 'fiado': return 'text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10';
      case 'perdida': return 'text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-500/10';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col max-w-7xl mx-auto w-full overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Ventas y Fiados</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Historial de transacciones y cuentas por cobrar</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 relative w-full md:w-auto z-40">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center justify-between md:justify-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {dateRange === 'Mes' ? 'Este mes' : dateRange === 'Hoy' ? 'Hoy' : 'Rango personalizado'}
            </div>
            <ChevronDown size={14} />
          </button>

          {isFilterOpen && (
            <div className="absolute top-full left-0 md:right-0 md:left-auto mt-2 w-full md:w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 py-1">
              <button 
                onClick={() => { setDateRange('Hoy'); setIsFilterOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors"
              >
                Hoy
              </button>
              <button 
                onClick={() => { setDateRange('Mes'); setIsFilterOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors"
              >
                Este Mes
              </button>
              <button 
                onClick={() => { setDateRange('Rango'); setIsFilterOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors"
              >
                Rango de fechas
              </button>
            </div>
          )}
          
          {dateRange === 'Rango' && (
            <div className="flex items-center gap-2 animate-fadeIn mt-2 md:mt-0">
              <input 
                type="date" 
                value={customStartDate} 
                onChange={e => setCustomStartDate(e.target.value)} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-slate-900 dark:focus:border-slate-400"
              />
              <span className="text-slate-400 font-bold text-xs">A</span>
              <input 
                type="date" 
                value={customEndDate} 
                onChange={e => setCustomEndDate(e.target.value)} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-slate-900 dark:focus:border-slate-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Rediseñadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* 1. Total en Caja */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-900 p-5 rounded-3xl shadow-xl shadow-blue-900/20 relative overflow-hidden text-white border border-blue-500/30 group hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <svg className="absolute bottom-0 left-0 w-full h-24 opacity-20 pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,218.7C960,224,1056,192,1152,165.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">Total en Caja</p>
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Banknote size={16} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-black tracking-tight mb-3">${totalCaja.toLocaleString()}</p>
              <div className="flex justify-between items-center text-xs font-medium text-blue-100 bg-blue-950/30 p-2 rounded-lg backdrop-blur-sm">
                <span className="flex items-center gap-1"><Banknote size={12}/> Efec: ${stats.efectivo.toLocaleString()}</span>
                <span className="flex items-center gap-1"><CreditCard size={12}/> Transf: ${stats.transferencia.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Total Esperado */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden text-white border border-slate-700 group hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Esperado</p>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-400"/>
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-black tracking-tight mb-3 text-emerald-400">${totalEsperado.toLocaleString()}</p>
              <p className="text-xs text-slate-400 font-medium bg-slate-950/50 p-2 rounded-lg">Si se cobraran todos los fiados</p>
            </div>
          </div>
        </div>

        {/* 3. Ingresos y Egresos */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 group hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Flujo del Periodo</p>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <TrendingDown size={16} className="text-slate-500"/>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1"><TrendingUp size={14}/> Ingresos</span>
              <span className="font-black text-emerald-700 dark:text-emerald-400">${stats.ingresos.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center bg-red-50 dark:bg-red-500/10 p-2.5 rounded-xl border border-red-100 dark:border-red-500/20">
              <span className="text-xs font-bold text-red-600 dark:text-red-500 flex items-center gap-1"><TrendingDown size={14}/> Egresos</span>
              <span className="font-black text-red-700 dark:text-red-400">-${stats.egresos.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 4. Fiados */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 group hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado de Fiados</p>
            <div className="w-8 h-8 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
              <BookOpen size={16} className="text-yellow-500"/>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Esperado</span>
              <span className="font-black text-yellow-600 dark:text-yellow-500">${stats.fiadoEsperado.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Cobrado</span>
              <span className="font-black text-emerald-600 dark:text-emerald-500">${stats.fiadoCobrado.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-center gap-2 mb-6 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('transacciones')}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === 'transacciones'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Transacciones
        </button>
        <button
          onClick={() => setActiveTab('fiados')}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'fiados'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen size={16} className={activeTab === 'fiados' ? 'text-yellow-500' : ''} />
          Cuentas Corrientes (Fiados)
        </button>
      </div>

      {/* List Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col w-full mb-6">
        
        {/* Toolbar con Filtros Avanzados */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={activeTab === 'fiados' ? "Buscar por nombre del cliente..." : "Buscar por ticket, cliente, vendedor o motivo..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-colors dark:text-white"
              />
            </div>
            {activeTab === 'transacciones' && (
              <button 
                onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                className={`flex items-center justify-center gap-2 border px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                  isAdvancedFilterOpen || filterType !== 'all' || filterMethod !== 'all'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Filter size={16} />
                Filtros
                {(filterType !== 'all' || filterMethod !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>
            )}
          </div>

          {/* Panel de Filtros Avanzados */}
          {activeTab === 'transacciones' && (
            <div className={`overflow-visible transition-all duration-300 ease-in-out ${isAdvancedFilterOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 m-0 overflow-hidden'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
              
              {/* Tipo de Movimiento Combobox */}
              <div className="relative" ref={typeDropdownRef}>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Tipo de Movimiento</label>
                <div 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium flex justify-between items-center cursor-pointer dark:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                >
                  <span>{filterTypeOptions.find(opt => opt.value === filterType)?.label}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                {isTypeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                    {filterTypeOptions.map(option => (
                      <div 
                        key={option.value}
                        className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors flex items-center justify-between
                          ${filterType === option.value 
                            ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }
                        `}
                        onClick={() => {
                          setFilterType(option.value);
                          setIsTypeDropdownOpen(false);
                        }}
                      >
                        {option.label}
                        {filterType === option.value && <Check size={14} className="text-emerald-500" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Método / Tipo Combobox */}
              <div className="relative" ref={methodDropdownRef}>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Método / Tipo</label>
                <div 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium flex justify-between items-center cursor-pointer dark:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  onClick={() => setIsMethodDropdownOpen(!isMethodDropdownOpen)}
                >
                  <span>{filterMethodOptions.find(opt => opt.value === filterMethod)?.label}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isMethodDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                {isMethodDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                    {filterMethodOptions.map(option => (
                      <div 
                        key={option.value}
                        className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors flex items-center justify-between
                          ${filterMethod === option.value 
                            ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }
                        `}
                        onClick={() => {
                          setFilterMethod(option.value);
                          setIsMethodDropdownOpen(false);
                        }}
                      >
                        {option.label}
                        {filterMethod === option.value && <Check size={14} className="text-emerald-500" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <button 
                onClick={() => { setFilterType('all'); setFilterMethod('all'); setSearchTerm(''); }}
                className="text-xs font-bold text-red-500 hover:text-red-600 px-2 py-1"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Responsive Content */}
        <div className="w-full bg-slate-50/50 dark:bg-slate-950/50 overflow-x-auto">
          
          {activeTab === 'transacciones' ? (
            <>
              {isMobile ? (
                /* MOBILE CARDS VIEW */
                <div className="p-4 space-y-5">
                  {filteredSales.map(sale => (
                <div key={sale.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-md flex flex-col gap-4 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getMethodColor(sale.method)} shadow-sm`}>
                        {getMethodIcon(sale.method)}
                      </div>
                      <div>
                        <span className="font-black text-slate-900 dark:text-white text-lg">#{sale.id}</span>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                          {new Date(sale.date).toLocaleDateString()} • {new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-black ${sale.type === 'egreso' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                        {sale.type === 'egreso' ? '-' : ''}${sale.amount.toLocaleString()}
                      </span>
                      <p className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${sale.type === 'egreso' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {sale.type}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Vendedor</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><User size={14}/> {sale.seller}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Caja</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><MonitorSmartphone size={14}/> {sale.register}</p>
                    </div>
                    {sale.customer && (
                      <div className="col-span-2 mt-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Cliente (Fiado)</p>
                        <p className="text-sm font-bold text-yellow-600 dark:text-yellow-500">{sale.customer}</p>
                      </div>
                    )}
                    {sale.reason && (
                      <div className="col-span-2 mt-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Motivo</p>
                        <p className="text-sm font-bold text-red-500">{sale.reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      {sale.items} {sale.items === 1 ? 'ítem' : 'ítems'}
                    </span>
                    <button 
                      onClick={() => toggleStatus(sale.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-colors shadow-sm active:scale-95 ${
                        sale.status === 'completada' 
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-500/10 dark:text-yellow-400'
                      }`}
                    >
                      {sale.status === 'completada' ? <><Check size={14} /> Pagado</> : <><Clock size={14} /> Pendiente</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* DESKTOP TABLE VIEW */
            <div className="w-full">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-slate-50 dark:bg-slate-900/80 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ticket #</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha / Tipo</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Detalles (Vendedor / Caja)</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Método / Cliente</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                  {filteredSales.map(sale => (
                    <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 dark:text-white">#{sale.id}</span>
                        <div className="text-[10px] font-bold text-slate-400 mt-1">{sale.items} ítems</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{new Date(sale.date).toLocaleDateString()}</div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${sale.type === 'egreso' ? 'text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:bg-red-500/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-500/10'}`}>
                          {sale.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          <User size={14} className="text-slate-400" /> {sale.seller}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <MonitorSmartphone size={14} className="text-slate-400" /> {sale.register}
                        </div>
                        {sale.reason && (
                          <div className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                            <AlertTriangle size={10} /> {sale.reason}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold capitalize border border-transparent ${getMethodColor(sale.method)}`}>
                          {getMethodIcon(sale.method)}
                          {sale.method}
                        </div>
                        {sale.customer && (
                          <div className="text-[10px] font-bold text-yellow-600 dark:text-yellow-500 mt-1.5 ml-1 flex items-center gap-1">
                            <User size={10} /> {sale.customer}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => toggleStatus(sale.id)}
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
                            sale.status === 'completada' 
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
                              : 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-900 dark:bg-yellow-500/10 dark:text-yellow-400 dark:hover:bg-yellow-500/20'
                          }`}
                          title="Clic para cambiar estado"
                        >
                          {sale.status === 'completada' ? <><Check size={14} /> Pagado</> : <><Clock size={14} /> Pendiente</>}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className={`text-lg font-black ${sale.type === 'egreso' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                          {sale.type === 'egreso' ? '-' : ''}${sale.amount.toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredSales.length === 0 && (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 h-full">
              <Search size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-bold text-lg">No se encontraron registros</p>
              <p className="text-sm font-medium mt-1">Prueba cambiando los filtros de búsqueda</p>
            </div>
          )}
          </>
        ) : (
          /* VISTA DE FIADOS (CUENTAS CORRIENTES) */
          <div className="p-4 space-y-4">
            {fiadosArray.length === 0 ? (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 h-full rounded-2xl">
                <BookOpen size={48} className="mx-auto mb-4 opacity-30 text-yellow-500" />
                <p className="font-bold text-lg">No hay cuentas corrientes activas</p>
                <p className="text-sm font-medium mt-1">No se encontraron fiados con los filtros actuales</p>
              </div>
            ) : (
              fiadosArray.map((fiadoData) => (
                <div key={fiadoData.cliente} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                  {/* Header del Cliente */}
                  <div 
                    className="p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    onClick={() => setExpandedCustomer(expandedCustomer === fiadoData.cliente ? null : fiadoData.cliente)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-500 shadow-sm border border-yellow-100 dark:border-yellow-900/30">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{fiadoData.cliente}</h3>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {fiadoData.transacciones.length} transacciones registradas
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                      <div className="flex gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Pendiente</p>
                          <p className="text-lg font-black text-red-500">${fiadoData.pendiente.toLocaleString()}</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Pagado</p>
                          <p className="text-lg font-black text-emerald-500">${fiadoData.pagado.toLocaleString()}</p>
                        </div>
                      </div>
                      <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${expandedCustomer === fiadoData.cliente ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Detalles Expandidos */}
                  {expandedCustomer === fiadoData.cliente && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 sm:p-6 animate-fadeIn">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Historial de {fiadoData.cliente}</h4>
                        <div className="sm:hidden text-right">
                          <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                            Total Pagado: ${fiadoData.pagado.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {fiadoData.transacciones.map(t => (
                          <div key={t.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                t.status === 'completada' 
                                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border border-emerald-100 dark:border-emerald-900/50'
                                  : 'bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-900/50'
                              }`}>
                                {t.status === 'completada' ? <Check size={16} /> : <Clock size={16} />}
                              </div>
                              <div>
                                <span className="font-black text-slate-900 dark:text-white text-sm">Ticket #{t.id}</span>
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                  {new Date(t.date).toLocaleDateString()} • Vendedor: {t.seller}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                              <span className={`text-lg font-black ${t.status === 'completada' ? 'text-emerald-500' : 'text-red-500'}`}>
                                ${t.amount.toLocaleString()}
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStatus(t.id);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors shadow-sm active:scale-95 ${
                                  t.status === 'completada' 
                                    ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                    : 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                                }`}
                              >
                                {t.status === 'completada' ? 'Marcar Pendiente' : 'Marcar Pagado'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Sales;