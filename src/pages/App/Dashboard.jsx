import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  TrendingUp, Users, ShoppingCart, AlertCircle, Package, DollarSign, Calendar, 
  ChevronDown, Lock, Medal, Activity, Store, TrendingDown, Box, AlertTriangle,
  History, Plus, Minus, Check, X, CreditCard, Banknote, Clock
} from 'lucide-react';

// --- COMPONENTES DE GRÁFICOS SVG ---

// Gráfico de Línea con Área (Subidas y bajadas)
const AreaLineChart = ({ data, labels, series, isCashFlow }) => {
  const maxVal = Math.max(...data.flatMap(d => series.map(s => d[s.key] || 0))) * 1.2 || 1;
  const height = 180;
  const width = 800; // SVG viewBox width
  const stepX = width / (data.length - 1 || 1);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const getPath = (key) => {
    let d = `M 0 ${height - ((data[0][key] || 0) / maxVal) * height}`;
    data.forEach((point, i) => {
      if (i > 0) {
        const x = i * stepX;
        const y = height - ((point[key] || 0) / maxVal) * height;
        const prevX = (i - 1) * stepX;
        const prevY = height - ((data[i-1][key] || 0) / maxVal) * height;
        const cpX = prevX + (x - prevX) / 2;
        d += ` C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y}`;
      }
    });
    return d;
  };

  const getArea = (key) => {
    return `${getPath(key)} L ${width} ${height} L 0 ${height} Z`;
  };

  const formatCurrency = (val) => `$${Math.round(val).toLocaleString()}`;

  // Helper for tooltip interaction
  const handlePointClick = (pointData, index, x, y) => {
    if (activeTooltip && activeTooltip.index === index) {
      setActiveTooltip(null); // toggle off
    } else {
      setActiveTooltip({ data: pointData, index, x, y, label: labels[index] });
    }
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar relative" onMouseLeave={() => setActiveTooltip(null)}>
      <div className="min-w-[600px] relative h-[220px] pb-6 pt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line key={i} x1="0" y1={height * ratio} x2={width} y2={height * ratio} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="4 4" />
          ))}
          
          {/* Areas & Lines */}
          {series.slice().reverse().map((s) => (
            <g key={`series-${s.key}`}>
              <path d={getArea(s.key)} fill={`url(#gradient-${s.key})`} opacity="0.3" />
              <path d={getPath(s.key)} fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round" />
            </g>
          ))}

          {/* Interactive Data Points */}
          {data.map((d, i) => {
            const x = i * stepX;
            // Para el tooltip agrupamos los datos de este punto (columna)
            const pointData = series.map(s => ({
              key: s.key,
              name: s.name,
              color: s.color,
              val: d[s.key] || 0,
              qty: d[`${s.key}_qty`]
            }));
            
            // Usamos el valor más alto de este punto para posicionar el tooltip
            const highestVal = Math.max(...pointData.map(p => p.val));
            const y = height - (highestVal / maxVal) * height;

            return (
              <g key={`points-${i}`}>
                {/* Hitbox invisible más grande para facilitar el hover/click */}
                <circle cx={x} cy={y} r="15" fill="transparent" 
                  className="cursor-pointer"
                  onMouseEnter={() => handlePointClick(pointData, i, x, y)}
                  onClick={() => handlePointClick(pointData, i, x, y)}
                />
                {pointData.map(p => {
                  const ptY = height - (p.val / maxVal) * height;
                  const isActive = activeTooltip?.index === i;
                  return (
                    <circle 
                      key={`pt-${p.key}-${i}`} 
                      cx={x} 
                      cy={ptY} 
                      r={isActive ? "6" : "4"} 
                      fill={p.color} 
                      className="transition-all pointer-events-none"
                      stroke="white"
                      strokeWidth={isActive ? "2" : "0"}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Gradients */}
          <defs>
            {series.map(s => (
              <linearGradient key={`grad-${s.key}`} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="1"/>
                <stop offset="100%" stopColor={s.color} stopOpacity="0"/>
              </linearGradient>
            ))}
          </defs>
        </svg>

        {/* Labels */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] font-bold text-slate-400 px-1">
          {labels.map((lbl, i) => (
            <span key={i} className="transform -translate-x-1/2">{lbl}</span>
          ))}
        </div>

        {/* Custom HTML Tooltip */}
        {activeTooltip && (
          <div 
            className="absolute z-50 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-15px]"
            style={{ 
              left: `${(activeTooltip.x / width) * 100}%`, 
              top: `${(activeTooltip.y / height) * 100}%` 
            }}
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-700 pb-1">
              {activeTooltip.label}
            </p>
            <div className="space-y-2">
              {activeTooltip.data.map(p => (
                <div key={p.key} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                    <span className="text-xs font-bold text-slate-300">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-white block">{formatCurrency(p.val)}</span>
                    {p.qty && <span className="text-[9px] font-medium text-slate-400 block">{p.qty} ventas</span>}
                  </div>
                </div>
              ))}
              
              {/* Resumen extra si es flujo de caja */}
              {isCashFlow && activeTooltip.data.length >= 2 && (
                <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Flujo Neto:</span>
                  <span className={`text-xs font-black ${activeTooltip.data[0].val - activeTooltip.data[1].val >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {activeTooltip.data[0].val - activeTooltip.data[1].val >= 0 ? '+' : ''}
                    {formatCurrency(activeTooltip.data[0].val - activeTooltip.data[1].val)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Tooltip triangle */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-900/95 dark:bg-slate-800/95 border-b border-r border-slate-700 rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Gráfico de Torta Estilizado (SVG)
const PieChart = ({ data, size = 160 }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let currentAngle = -90; // Start at top

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform w-full h-full drop-shadow-md">
        {data.map((item, index) => {
          if (item.value === 0) return null;
          const angle = (item.value / total) * 360;
          const startX = 50 + 40 * Math.cos((Math.PI * currentAngle) / 180);
          const startY = 50 + 40 * Math.sin((Math.PI * currentAngle) / 180);
          
          currentAngle += angle;
          
          const endX = 50 + 40 * Math.cos((Math.PI * currentAngle) / 180);
          const endY = 50 + 40 * Math.sin((Math.PI * currentAngle) / 180);
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const d = [
            `M 50 50`,
            `L ${startX} ${startY}`,
            `A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `Z`
          ].join(' ');

          return (
            <path key={index} d={d} fill={item.color} className="transition-all duration-300 hover:opacity-80 cursor-pointer stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
          );
        })}
        {/* Inner circle for Donut effect */}
        <circle cx="50" cy="50" r="25" fill="currentColor" className="text-white dark:text-slate-900" />
      </svg>
      {/* Center Text */}
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total</span>
        <span className="text-sm font-black text-slate-800 dark:text-white">
          {total > 1000 ? `${(total/1000).toFixed(1)}k` : total}
        </span>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

const Dashboard = () => {
  const { isMultiBranch, selectedBranch } = useOutletContext();
  
  // Estados de Filtro Inteligente
  const [filterMode, setFilterMode] = useState('Hoy'); // Hoy, Rango
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeChart, setActiveChart] = useState('empleados'); // 'empleados' | 'flujo'
  
  // Estados de Caja
  const [isCashRegisterOpen, setIsCashRegisterOpen] = useState(false);
  const [initialCash, setInitialCash] = useState(0);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [closeAdjustments, setCloseAdjustments] = useState({ extra: 0, loss: 0, reason: '' });
  
  // Historial de cajas mock con más registros y fechas de inicio/fin reales
  const [registerHistory] = useState([
    { id: 1, dateStart: '2024-04-14', dateEnd: '2024-04-14', open: '08:00', close: '20:30', initial: 10000, expected: 450000, real: 449500, diff: -500, status: 'Cerrada' },
    { id: 2, dateStart: '2024-04-13', dateEnd: '2024-04-13', open: '08:15', close: '20:00', initial: 10000, expected: 420000, real: 420000, diff: 0, status: 'Cerrada' },
    { id: 3, dateStart: '2024-04-12', dateEnd: '2024-04-12', open: '07:50', close: '21:00', initial: 15000, expected: 380000, real: 385000, diff: 5000, status: 'Cerrada' },
    { id: 4, dateStart: '2024-04-10', dateEnd: '2024-04-11', open: '08:00', close: '14:00', initial: 10000, expected: 510000, real: 510000, diff: 0, status: 'Cerrada (2 días)' },
    { id: 5, dateStart: '2024-04-09', dateEnd: '2024-04-09', open: '08:30', close: '20:00', initial: 5000, expected: 290000, real: 289000, diff: -1000, status: 'Cerrada' },
    { id: 6, dateStart: '2024-04-08', dateEnd: '2024-04-08', open: '08:00', close: '20:30', initial: 10000, expected: 460000, real: 460000, diff: 0, status: 'Cerrada' },
    { id: 7, dateStart: '2024-04-01', dateEnd: '2024-04-07', open: '08:00', close: '20:00', initial: 20000, expected: 1500000, real: 1505000, diff: 5000, status: 'Semanal' },
  ]);

  const [expensesUpdateTrigger, setExpensesUpdateTrigger] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setExpensesUpdateTrigger(prev => prev + 1);
    window.addEventListener('gestly_expenses_updated', handleUpdate);
    return () => window.removeEventListener('gestly_expenses_updated', handleUpdate);
  }, []);

  // Lógica Inteligente de Fechas
  const daysDiff = useMemo(() => {
    if (filterMode === 'Hoy') return 1;
    if (!dateRange.start || !dateRange.end) return 1;
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
  }, [filterMode, dateRange]);

  const isMonthView = daysDiff > 60; // Si el rango es mayor a 60 días, agrupa por meses
  const multiplier = filterMode === 'Hoy' ? 0.05 : daysDiff * 0.05;

  // Mock data calculada con el multiplicador
  const salesCash = Math.floor(485000 * multiplier);
  const salesMP = Math.floor(210000 * multiplier);
  const salesTransfer = Math.floor(106000 * multiplier);
  const salesVirtual = salesMP + salesTransfer;
  const totalSales = salesCash + salesVirtual;
  const qtySales = Math.floor(245 * multiplier);
  const toCollect = Math.floor(45200 * multiplier); // Fiados
  const collectedFiados = Math.floor(12500 * multiplier); // Fiados pagados
  
  const loadedProducts = 145;
  const stockItems = 1250;
  const missingStock = 12;

  // Datos para gráfico de actividad (Generación dinámica según vista)
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const currentMonthIndex = new Date().getMonth();

  const chartDataLength = isMonthView ? Math.ceil(daysDiff / 30) : filterMode === 'Hoy' ? 12 : Math.min(daysDiff, 30);
  const chartData = Array.from({length: chartDataLength}, () => {
    const baseE1 = Math.floor(Math.random() * 40000 * multiplier) + 15000;
    const baseE2 = Math.floor(Math.random() * 30000 * multiplier) + 10000;
    const baseE3 = Math.floor(Math.random() * 20000 * multiplier) + 5000;
    
    return {
      e1: baseE1,
      e1_qty: Math.floor(baseE1 / 2500) || 1,
      e2: baseE2,
      e2_qty: Math.floor(baseE2 / 2500) || 1,
      e3: baseE3,
      e3_qty: Math.floor(baseE3 / 2500) || 1,
      ingresos: baseE1 + baseE2 + baseE3,
      egresos: Math.floor((baseE1 + baseE2 + baseE3) * 0.4) + Math.floor(Math.random() * 10000),
    };
  });
  
  const chartLabels = isMonthView 
    ? Array.from({length: chartDataLength}, (_, i) => monthNames[(currentMonthIndex - chartDataLength + i + 1 + 12) % 12] || monthNames[i % 12])
    : filterMode === 'Hoy' 
      ? Array.from({length: 12}, (_, i) => `${i+9}h`)
      : Array.from({length: chartDataLength}, (_, i) => `Día ${i+1}`);

  // Montos iniciales históricos y cálculo de flujo de caja acumulado
  const historicalInitialAmount = 17000000; // 17M
  const currentTotalIncome = chartData.reduce((acc, d) => acc + d.ingresos, 0);
  const baseTotalExpense = chartData.reduce((acc, d) => acc + d.egresos, 0);
  
  // Agregar egresos mock de localStorage (compras)
  const mockExpenses = JSON.parse(localStorage.getItem('gestly_mock_expenses') || '[]');
  const shoppingExpenses = mockExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  
  const currentTotalExpense = baseTotalExpense + shoppingExpenses;
  const currentNetFlow = currentTotalIncome - currentTotalExpense;
  const currentTotalAmount = historicalInitialAmount + currentNetFlow;

  // Mock de la tendencia respecto al periodo anterior
  const previousPeriodNetFlow = currentNetFlow * 0.8; // Asumimos un 80% del actual para el ejemplo
  const isTrendingUp = currentNetFlow >= previousPeriodNetFlow;

  // Empleados (Colores azulados/celestes)
  const topEmployees = [
    { id: 'e1', name: 'Martín', sales: Math.floor(318500 * multiplier), count: Math.floor(120 * multiplier), avatar: 'M', color: '#3b82f6' }, // blue-500
    { id: 'e2', name: 'Laura', sales: Math.floor(285200 * multiplier), count: Math.floor(95 * multiplier), avatar: 'L', color: '#0ea5e9' }, // sky-500
    { id: 'e3', name: 'Juan', sales: Math.floor(197500 * multiplier), count: Math.floor(64 * multiplier), avatar: 'J', color: '#6366f1' } // indigo-500
  ];

  // Datos para Tortas
  const incomeDistribution = [
    { name: 'Efectivo', value: salesCash, color: '#3b82f6' }, // blue
    { name: 'MercadoPago', value: salesMP, color: '#0ea5e9' }, // sky
    { name: 'Transferencia', value: salesTransfer, color: '#6366f1' }, // indigo
    { name: 'Fiados', value: toCollect, color: '#0f172a' } // slate-900
  ];

  const categoryDistribution = [
    { name: 'Bebidas', value: Math.floor(450 * multiplier), color: '#2563eb' }, // blue-600
    { name: 'Almacén', value: Math.floor(320 * multiplier), color: '#0284c7' }, // sky-600
    { name: 'Limpieza', value: Math.floor(150 * multiplier), color: '#4f46e5' }, // indigo-600
    { name: 'Otros', value: Math.floor(80 * multiplier), color: '#64748b' } // slate-500
  ];

  const branchData = [
    { name: 'Centro', total: Math.floor(450000 * multiplier), percentage: 55 },
    { name: 'Norte', total: Math.floor(351000 * multiplier), percentage: 45 }
  ];

  // Manejadores de Caja
  const handleCloseRegister = () => {
    setShowCloseModal(true);
  };

  const confirmCloseRegister = () => {
    setIsCashRegisterOpen(false);
    setShowCloseModal(false);
    setInitialCash(0);
    setCloseAdjustments({ extra: 0, loss: 0, reason: '' });
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col mx-auto w-full overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-[#0b1120] relative">
      {/* Fondo estilizado con degradado y ondas en la parte inferior */}
      <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-gradient-to-t from-blue-500/10 dark:from-blue-900/10 to-transparent pointer-events-none z-0"></div>
      <svg className="absolute bottom-0 left-0 w-full h-32 opacity-[0.03] dark:opacity-[0.02] pointer-events-none z-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="currentColor" className="text-blue-900 dark:text-blue-400" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,213.3C672,203,768,149,864,133.3C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
      
      {/* HEADER & FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-50">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Panel Principal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Resumen de actividad {selectedBranch !== 'all' ? `en Sucursal ${selectedBranch === 'centro' ? 'Centro' : 'Norte'}` : 'global'}
          </p>
        </div>

        <div className="flex gap-3 relative">
          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <History size={16} className="text-blue-500" />
            Historial Cajas
          </button>

          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
            >
              <Calendar size={16} />
              {filterMode === 'Hoy' ? 'Hoy' : 'Rango de Fechas'}
              <ChevronDown size={14} />
            </button>
            
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 animate-fadeIn">
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => { setFilterMode('Hoy'); setIsFilterOpen(false); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${filterMode === 'Hoy' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    Hoy
                  </button>
                  <button 
                    onClick={() => setFilterMode('Rango')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${filterMode === 'Rango' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    Rango
                  </button>
                </div>
                
                {filterMode === 'Rango' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Desde</label>
                      <input 
                        type="date" 
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Hasta</label>
                      <input 
                        type="date" 
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full mt-2 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Aplicar Filtro
                    </button>
                    {isMonthView && (
                      <p className="text-[10px] text-center text-slate-500 mt-2 flex items-center justify-center gap-1">
                        <AlertCircle size={10} /> Rango {'>'} 60 días: Vista agrupada por meses
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* GRID PRINCIPAL: 4 Columnas (3 para contenido principal, 1 para sidebar de caja/rankings) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8 relative z-20">
        
        {/* COLUMNA PRINCIPAL (3/4 width en pantallas grandes) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* QUICK STATS CARDS - Diseño renovado con texturas y colores azulados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Tarjeta 1: Ingresos Brutos (Blue Theme) */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-2xl shadow-xl shadow-blue-900/20 relative overflow-hidden text-white border border-blue-500/30 group">
              {/* Textura Ondas */}
              <svg className="absolute bottom-0 left-0 w-full h-24 opacity-20 pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="currentColor" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,218.7C960,224,1056,192,1152,165.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1">Ingresos Brutos</p>
                  <p className="text-3xl font-display font-black tracking-tight">${totalSales.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner border border-white/20">
                  <DollarSign size={20} className="text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-100 relative z-10 bg-black/10 w-max px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                <TrendingUp size={12} className="text-blue-300" />
                +12% vs anterior
              </div>
            </div>

            {/* Tarjeta 2: Ventas Realizadas (Sky/Cyan Theme) */}
            <div className="bg-gradient-to-br from-sky-500 to-cyan-700 p-5 rounded-2xl shadow-xl shadow-sky-900/20 relative overflow-hidden text-white border border-sky-400/30 group">
              {/* Textura Puntos */}
              <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMSkiLz48L3N2Zz4=')]"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">Ventas Realizadas</p>
                  <p className="text-3xl font-display font-black tracking-tight">{qtySales}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner border border-white/20">
                  <ShoppingCart size={20} className="text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-100 relative z-10 bg-black/10 w-max px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                <Calendar size={12} />
                {filterMode === 'Hoy' ? 'Hoy' : `${daysDiff} días`}
              </div>
            </div>

            {/* Tarjeta 3: Fiados (Slate 900 Theme - Tonos Azulados Oscuros 111827) */}
            <div className="bg-slate-900 p-5 rounded-2xl shadow-xl shadow-slate-900/30 relative overflow-hidden text-white border border-slate-700 group">
              {/* Textura Gradiente Radial */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1">Cuentas por Cobrar</p>
                  <p className="text-3xl font-display font-black tracking-tight text-white">${toCollect.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Users size={20} className="text-blue-400" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 relative z-10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-800 w-max px-2.5 py-1 rounded-lg border border-slate-700">
                  <CreditCard size={12} className="text-blue-400" />
                  Fiados
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                  +${collectedFiados.toLocaleString()} cobrados
                </span>
              </div>
            </div>

            {/* Tarjeta 4: Alertas Stock (Indigo Theme) */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 p-5 rounded-2xl shadow-xl shadow-indigo-900/5 dark:shadow-none relative overflow-hidden group border border-indigo-200 dark:border-slate-700 flex flex-col justify-between">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-indigo-900 dark:text-white pointer-events-none">
                <Box size={100} />
              </div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Inventario</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">{stockItems}</p>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ítems</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100 dark:border-slate-700">
                  <Box size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="flex items-center gap-3 relative z-10 mt-auto pt-4 border-t border-indigo-200/50 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  {loadedProducts} Prods
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-500/20">
                  <AlertTriangle size={12} />
                  {missingStock} Faltantes
                </div>
              </div>
            </div>

          </div>

          {/* GRÁFICO DE ACTIVIDAD Y FLUJO DE CAJA */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none p-5 sm:p-6 overflow-visible relative z-30">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity size={20} className={activeChart === 'empleados' ? 'text-blue-500' : 'text-emerald-500'} />
                    {activeChart === 'empleados' ? 'Evolución de Ventas por Empleado' : 'Flujo de Caja'}
                  </h2>
                </div>

                {/* Resumen Histórico y Acumulado (Compacto) */}
                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/50 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Base (Ene):</span>
                    <span className="text-sm font-bold text-slate-400 opacity-60 line-through decoration-slate-400/30">
                      ${historicalInitialAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="hidden sm:block text-slate-300">
                    <TrendingUp size={14} className={currentNetFlow >= 0 ? 'text-emerald-500' : 'text-red-500'} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Actual:</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      ${currentTotalAmount.toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${isTrendingUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {isTrendingUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {isTrendingUp ? '+' : ''}{(((currentNetFlow - previousPeriodNetFlow) / Math.abs(previousPeriodNetFlow)) * 100).toFixed(1)}%
                    </span>
                  </div>

                  {activeChart === 'flujo' && (
                    <div className="border-l border-slate-200 dark:border-slate-800 pl-4 ml-auto hidden md:flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Flujo Neto:</span>
                      <span className={`text-sm font-black ${currentNetFlow >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {currentNetFlow >= 0 ? '+' : ''}${currentNetFlow.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                {/* Toggle de gráficos */}
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => setActiveChart('empleados')} 
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeChart === 'empleados' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    Empleados
                  </button>
                  <button 
                    onClick={() => setActiveChart('flujo')} 
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeChart === 'flujo' ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    Flujo de Caja
                  </button>
                </div>

                {/* Leyenda */}
                <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {activeChart === 'empleados' ? (
                    topEmployees.map(emp => (
                      <div key={emp.id} className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: emp.color }}></div>
                        {emp.name}
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div> Ingresos</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div> Egresos</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <AreaLineChart 
              data={chartData} 
              labels={chartLabels} 
              series={activeChart === 'empleados' 
                ? topEmployees.map(emp => ({ key: emp.id, color: emp.color, name: emp.name }))
                : [
                    { key: 'ingresos', color: '#10b981', name: 'Ingresos' }, // emerald-500
                    { key: 'egresos', color: '#ef4444', name: 'Egresos' }    // red-500
                  ]
              }
            />
          </div>

          {/* SECCIÓN DE TORTAS Y SUCURSALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Torta: Distribución de Ingresos */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none p-6 flex flex-col items-center">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-6 w-full text-left flex items-center gap-2">
                <Banknote size={16} className="text-blue-500" />
                Composición de Ingresos
              </h2>
              <PieChart data={incomeDistribution} />
              <div className="w-full mt-6 space-y-2">
                {incomeDistribution.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="font-bold text-slate-600 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Torta: Ventas por Categoría */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none p-6 flex flex-col items-center">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-6 w-full text-left flex items-center gap-2">
                <Package size={16} className="text-sky-500" />
                Ventas por Categoría
              </h2>
              <PieChart data={categoryDistribution} />
              <div className="w-full mt-6 space-y-2">
                {categoryDistribution.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="font-bold text-slate-600 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{item.value.toLocaleString()} u.</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparativa Sucursales */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none p-6 lg:col-span-1 md:col-span-2">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Store size={16} className="text-indigo-500" />
                Comparativa Sucursales
              </h2>
              
              {!isMultiBranch || selectedBranch !== 'all' ? (
                <div className="flex flex-col items-center justify-center h-40 text-center text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Store size={32} className="mb-2 opacity-50" />
                  <p className="text-xs font-bold px-4">Selecciona "Todas las sucursales" para ver la comparativa global.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {branchData.map((branch, index) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Sucursal</span>
                          <span className="font-black text-lg text-slate-900 dark:text-white">{branch.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-lg text-blue-600 dark:text-blue-400">${branch.total.toLocaleString()}</span>
                          <span className="text-xs font-bold text-slate-500 block">{branch.percentage}% del total</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-blue-500' : 'bg-indigo-500'}`} 
                          style={{ width: `${branch.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className="text-[10px] font-bold text-center text-slate-400 mt-2">
                    Datos calculados según el periodo ({isMonthView ? 'Mensual' : filterMode})
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* SIDEBAR DERECHO (Caja, Rankings) */}
        <div className="space-y-6 xl:col-span-1">
          
          {/* CERRAR CAJA WIDGET */}
          <div className={`rounded-3xl shadow-xl relative overflow-hidden transition-all duration-500 border ${
            isCashRegisterOpen 
              ? 'bg-slate-900 border-slate-700 shadow-slate-900/20' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-slate-200/20 dark:shadow-none'
          }`}>
            <div className={`absolute top-0 right-0 w-40 h-40 rounded-bl-full -mr-10 -mt-10 opacity-20 transition-colors ${isCashRegisterOpen ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
            
            <div className="p-6 relative z-10">
              <h2 className={`font-bold text-lg mb-6 flex items-center justify-between ${isCashRegisterOpen ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                <div className="flex items-center gap-2">
                  <Lock size={18} className={isCashRegisterOpen ? 'text-blue-400' : 'text-slate-400'} />
                  {isCashRegisterOpen ? 'Caja Abierta' : 'Caja Cerrada'}
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${isCashRegisterOpen ? 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)] animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
              </h2>
              
              {!isCashRegisterOpen ? (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Monto Inicial Efectivo</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number"
                        value={initialCash}
                        onChange={(e) => setInitialCash(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-3 font-black text-lg text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsCashRegisterOpen(true)}
                    className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2"
                  >
                    Abrir Turno
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase">Efectivo (Incl. Inicial)</span>
                      <span className="font-black text-white">${(salesCash + initialCash).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase">Medios Virtuales</span>
                      <span className="font-black text-blue-300">${salesVirtual.toLocaleString()}</span>
                    </div>
                    
                    <div className="w-full h-px bg-slate-700 my-3"></div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-300">Total Esperado</span>
                      <span className="text-2xl font-black text-blue-400">${(totalSales + initialCash).toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCloseRegister}
                    className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-xl shadow-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                  >
                    Realizar Cierre de Caja
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RANKING EMPLEADOS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none p-6">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Medal size={16} className="text-blue-500" />
              Rendimiento de Equipo
            </h2>
            
            <div className="space-y-4">
              {topEmployees.map((emp, index) => (
                <div key={index} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white shadow-md" style={{ backgroundColor: emp.color }}>
                      {emp.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{emp.name}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{emp.count} ventas concretadas</p>
                    </div>
                  </div>
                  <div className="font-black text-sm text-slate-900 dark:text-white">
                    ${emp.sales.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL CIERRE DE CAJA AVANZADO */}
      {showCloseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="bg-slate-900 p-6 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>
              <h3 className="text-xl font-black relative z-10">Cierre de Caja</h3>
              <p className="text-slate-400 text-sm font-medium relative z-10">Verificación y ajustes finales</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-600 dark:text-slate-400">Total Esperado Sistema</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">${(totalSales + initialCash).toLocaleString()}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Ingresos Extra / Ajustes a favor (+)</label>
                  <div className="relative">
                    <Plus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input 
                      type="number"
                      value={closeAdjustments.extra || ''}
                      onChange={(e) => setCloseAdjustments({...closeAdjustments, extra: Number(e.target.value)})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Pérdidas / Faltantes (-)</label>
                  <div className="relative">
                    <Minus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                    <input 
                      type="number"
                      value={closeAdjustments.loss || ''}
                      onChange={(e) => setCloseAdjustments({...closeAdjustments, loss: Number(e.target.value)})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Motivo del Ajuste (Opcional)</label>
                  <input 
                    type="text"
                    value={closeAdjustments.reason}
                    onChange={(e) => setCloseAdjustments({...closeAdjustments, reason: e.target.value})}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    placeholder="Ej: Cambio chico, pago a proveedor..."
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex justify-between items-center">
                <span className="font-bold text-blue-800 dark:text-blue-300">Total Final Real</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  ${(totalSales + initialCash + closeAdjustments.extra - closeAdjustments.loss).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmCloseRegister}
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Confirmar Cierre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTORIAL DE CAJAS */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <History className="text-blue-500" />
                Historial de Cajas Registradas
              </h2>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-100/50 dark:bg-slate-900/50">
              <div className="space-y-4">
                {registerHistory.map((reg) => {
                  const startDate = new Date(reg.dateStart);
                  const endDate = new Date(reg.dateEnd);
                  const isSameDay = reg.dateStart === reg.dateEnd;
                  
                  return (
                    <div key={reg.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm hover:shadow-md">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          {/* Calendar Icon View */}
                          <div className="flex gap-1">
                            <div className="w-14 rounded-xl bg-white dark:bg-slate-800 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                              <div className="bg-blue-600 dark:bg-blue-700 text-white text-[10px] font-black text-center py-0.5 uppercase tracking-widest">
                                {monthNames[startDate.getMonth()]}
                              </div>
                              <div className="text-center py-1.5 text-lg font-black text-slate-800 dark:text-white">
                                {startDate.getDate()}
                              </div>
                            </div>
                            
                            {!isSameDay && (
                              <>
                                <div className="flex items-center text-slate-400">
                                  <Minus size={12} />
                                </div>
                                <div className="w-14 rounded-xl bg-white dark:bg-slate-800 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                  <div className="bg-indigo-600 dark:bg-indigo-700 text-white text-[10px] font-black text-center py-0.5 uppercase tracking-widest">
                                    {monthNames[endDate.getMonth()]}
                                  </div>
                                  <div className="text-center py-1.5 text-lg font-black text-slate-800 dark:text-white">
                                    {endDate.getDate()}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                              {isSameDay ? 'Turno Diario' : 'Turno Extendido'}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                              <Clock size={12} className="text-blue-500" /> 
                              {isSameDay ? (
                                <span>{reg.open} hs — {reg.close} hs</span>
                              ) : (
                                <span>Inicio: {reg.open}hs — Cierre: {reg.close}hs</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${
                          reg.status.includes('Cerrada') 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                        }`}>
                          {reg.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Apertura</p>
                          <p className="font-bold text-slate-900 dark:text-white">${reg.initial.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Esperado Sist.</p>
                          <p className="font-bold text-slate-900 dark:text-white">${reg.expected.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Total Real</p>
                          <p className="font-black text-blue-600 dark:text-blue-400">${reg.real.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Diferencia</p>
                          <div className={`font-black flex items-center gap-1 ${reg.diff === 0 ? 'text-slate-500' : reg.diff > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {reg.diff > 0 && <Plus size={12} />}
                            {reg.diff < 0 && <Minus size={12} />}
                            {reg.diff === 0 ? 'Exacto' : `$${Math.abs(reg.diff).toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Fin del historial de los últimos 30 días</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;