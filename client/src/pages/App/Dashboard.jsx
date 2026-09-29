import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  TrendingUp, Users, ShoppingCart, AlertCircle, Package, DollarSign, Calendar, 
  ChevronDown, Lock, Medal, Activity, Store, TrendingDown, Box, AlertTriangle,
  History, Plus, Minus, Check, X, CreditCard, Banknote, Clock
} from 'lucide-react';
import { getAppEmployees, getCashMovements, getCurrentBusiness, getCurrentUser, getSalesTransactions, getCashRegisters, getCashRegisterStatus, openCashRegister, closeCashRegister } from '../../services/api';
import api from '../../services/api';

// Normalizers: backend MySQL returns snake_case, frontend expects camelCase
const normalizeSale = (s) => ({
  ...s,
  businessId: String(s.business_id),
  branchId: String(s.branch_id),
  sellerEmployeeId: s.seller_id,
  paymentMethod: s.payment_method,
  occurredAt: s.created_at,
  saleType: s.sale_type || 'mostrador',
  customerId: s.customer_id,
  branchName: s.branch_name,
});
const normalizeCashMovement = (m) => ({
  ...m,
  businessId: String(m.business_id),
  branchId: String(m.branch_id),
  occurredAt: m.created_at,
  createdByUserId: m.created_by_user_id,
  createdByName: m.created_by_name,
  relatedSaleId: m.related_sale_id,
});

// --- COMPONENTES DE GRÁFICOS SVG ---

// Gráfico de Línea con Área (Subidas y bajadas) - con drag-to-scroll
const AreaLineChart = ({ data, labels, series, isCashFlow, onPointSelect, dashedKeys, yearBoundaries }) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const maxVal = (() => {
    const values = data.flatMap((d) => series.map((s) => d[s.key] || 0));
    if (values.length === 0) return 1;
    const max = Math.max(...values);
    return (max || 0) * 1.2 || 1;
  })();

  const hasData = data.some(d => series.some(s => (d[s.key] || 0) > 0));

  const height = 150;
  const minWidth = 600;
  const pointSpacing = 70;
  const width = Math.max(minWidth, data.length * pointSpacing);
  const stepX = width / (data.length - 1 || 1);

  const formatCurrency = (val) => `$${Math.round(val).toLocaleString()}`;

  const getPath = (key) => {
    if (data.length === 0) return '';
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

  const buildTooltipPayload = (pointData, index, x, y) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const scrollEl = scrollRef.current;
    const scrollOffset = scrollEl ? scrollEl.scrollLeft : 0;
    const visWidth = rect ? rect.width : width;
    const scale = visWidth / Math.max(width, visWidth);
    const left = rect ? rect.left + (x * scale) - scrollOffset * scale : 0;
    const top = rect ? rect.top + (y / height) * rect.height : 0;
    return { data: pointData, index, x, y, label: labels[index], screenLeft: left, screenTop: top };
  };

  const handlePointClick = (pointData, index, x, y) => {
    const isSame = selectedIndex === index;
    if (isSame) {
      setSelectedIndex(null);
      setActiveTooltip(null);
      onPointSelect?.(null);
      return;
    }
    const payload = buildTooltipPayload(pointData, index, x, y);
    setActiveTooltip(payload);
    setSelectedIndex(index);
    onPointSelect?.(payload);
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('circle')) return;
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing';
  };
  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  if (!hasData) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Activity size={28} className="text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Sin datos para este período</p>
        <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Las ventas aparecerán cuando se registren transacciones</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="w-full overflow-x-auto custom-scrollbar relative select-none"
      style={{ cursor: 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { handleMouseUp(); setActiveTooltip(null); }}
      onMouseMove={handleMouseMove}
    >
      <div ref={containerRef} className="relative h-[185px] pb-6 pt-2" style={{ width: `${width}px`, minWidth: `${minWidth}px` }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line key={i} x1="0" y1={height * ratio} x2={width} y2={height * ratio} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="4 4" />
          ))}
          
          {/* Year boundary lines */}
          {yearBoundaries && yearBoundaries.map((idx) => {
            const x = idx * stepX - stepX / 2;
            return (
              <g key={`yb-${idx}`}>
                <line x1={x} y1="0" x2={x} y2={height} stroke="#6366f1" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
                <text x={x + 4} y="12" fill="#6366f1" fontSize="9" fontWeight="bold" opacity="0.7">Año nuevo</text>
              </g>
            );
          })}
          
          {/* Areas & Lines */}
          {series.slice().reverse().map((s) => (
            <g key={`series-${s.key}`}>
              {!s.dashed && <path d={getArea(s.key)} fill={`url(#gradient-${s.key})`} opacity="0.3" />}
              <path d={getPath(s.key)} fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round"
                strokeDasharray={s.dashed ? "8 6" : "none"} opacity={s.dashed ? 0.8 : 1} />
            </g>
          ))}

          {/* Interactive Data Points */}
          {data.map((d, i) => {
            const x = i * stepX;
            const pointData = series.map(s => ({
              key: s.key, name: s.name, color: s.color,
              val: d[s.key] || 0, qty: d[`${s.key}_qty`]
            }));
            const highestVal = pointData.length ? Math.max(...pointData.map(p => p.val)) : 0;
            const y = height - (highestVal / maxVal) * height;

            return (
              <g key={`points-${i}`}>
                <circle cx={x} cy={y} r="15" fill="transparent"
                  className="cursor-pointer" pointerEvents="all"
                  onMouseEnter={() => setActiveTooltip(buildTooltipPayload(pointData, i, x, y))}
                  onClick={() => handlePointClick(pointData, i, x, y)}
                />
                {pointData.map(p => {
                  const ptY = height - (p.val / maxVal) * height;
                  const isActive = selectedIndex === i || activeTooltip?.index === i;
                  return (
                    <circle key={`pt-${p.key}-${i}`} cx={x} cy={ptY}
                      r={isActive ? "6" : "4"} fill={p.color}
                      className="transition-all pointer-events-none"
                      stroke="white" strokeWidth={isActive ? "2" : "0"}
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
        <div className="absolute bottom-0 left-0 flex text-[10px] font-bold text-slate-400 px-1" style={{ width: `${width}px` }}>
          {labels.map((lbl, i) => (
            <span key={i} className="text-center" style={{ width: `${stepX}px` }}>{lbl}</span>
          ))}
        </div>

        {/* Custom HTML Tooltip */}
        {activeTooltip && createPortal(
          <div className="fixed z-[9999] bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-15px]"
            style={{ left: `${activeTooltip.screenLeft}px`, top: `${activeTooltip.screenTop}px` }}
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-700 pb-2">
              {activeTooltip.label}
            </p>
            <div className="space-y-2.5">
              {activeTooltip.data.map(p => (
                <div key={p.key} className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                    <span className="text-xs font-bold text-slate-300">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-white block">{formatCurrency(p.val)}</span>
                    {p.qty !== undefined && p.qty !== null && (
                      <span className="text-[9px] font-medium text-slate-400 block">{Number(p.qty) || 0} ops</span>
                    )}
                  </div>
                </div>
              ))}
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
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-900/95 dark:bg-slate-800/95 border-b border-r border-slate-700 rotate-45"></div>
          </div>,
          document.body
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
  const { isMultiBranch, selectedBranch, branches = [] } = useOutletContext();
  
  // Estados de Filtro Inteligente
  const [filterMode, setFilterMode] = useState('Hoy'); // Hoy | Dia | 7d | 30d | Rango
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeChart, setActiveChart] = useState('empleados'); // 'empleados' | 'flujo' | 'metodos'
  const [chartDetail, setChartDetail] = useState(null);
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryKind, setRegistryKind] = useState('all'); // all | sales | income | expense
  const [registryPaymentMethod, setRegistryPaymentMethod] = useState('all'); // all | cash | mp | transfer | fiado
  const [registrySaleType, setRegistrySaleType] = useState('all'); // all | mostrador | delivery | online | fiado
  const [registryEmployeeId, setRegistryEmployeeId] = useState('all'); // all | eX
  const [registryOnlyTransfers, setRegistryOnlyTransfers] = useState(false);
  
  const activeBusinessId = useMemo(() => {
    const business = getCurrentBusiness();
    return String(business?.id || 1);
  }, []);
  
  const [employees, setEmployees] = useState([]);
  const [salesTransactions, setSalesTransactionsState] = useState([]);
  const [cashMovements, setCashMovementsState] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);
  
  // Estados de Caja
  const [isCashRegisterOpen, setIsCashRegisterOpen] = useState(false);
  const [initialCash, setInitialCash] = useState(0);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [closeCountedCash, setCloseCountedCash] = useState('');
  const [closeCountedMp, setCloseCountedMp] = useState('');
  const [closeCountedTransfer, setCloseCountedTransfer] = useState('');
  
  const [registerHistory, setRegisterHistory] = useState([]);

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      try {
        setIsLoadingData(true);
        setDataError(null);
        const [emps, txs, moves] = await Promise.all([
          getAppEmployees({ businessId: activeBusinessId }),
          getSalesTransactions({ businessId: activeBusinessId }),
          getCashMovements({ businessId: activeBusinessId }),
        ]);
        if (isCancelled) return;
        setEmployees(Array.isArray(emps) ? emps : []);
        setSalesTransactionsState(Array.isArray(txs) ? txs.map(normalizeSale) : []);
        setCashMovementsState(Array.isArray(moves) ? moves.map(normalizeCashMovement) : []);
      } catch (e) {
        if (isCancelled) return;
        setDataError('No se pudo cargar la información de ventas/caja desde el servidor.');
      } finally {
        if (!isCancelled) setIsLoadingData(false);
      }
    };
    load();
    return () => { isCancelled = true; };
  }, [activeBusinessId]);

  const toYmd = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const addDaysYmd = (ymd, deltaDays) => {
    const d = new Date(`${ymd}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + deltaDays);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayYmd = useMemo(() => toYmd(new Date()), []);

  const activeDateWindow = useMemo(() => {
    if (filterMode === 'Hoy') return { start: todayYmd, end: todayYmd };
    if (filterMode === 'Dia') {
      const day = dateRange.start || todayYmd;
      return { start: day, end: day };
    }
    if (filterMode === '7d') return { start: addDaysYmd(todayYmd, -6), end: todayYmd };
    if (filterMode === '30d') return { start: addDaysYmd(todayYmd, -29), end: todayYmd };

    const start = dateRange.start || todayYmd;
    const end = dateRange.end || start;
    return start <= end ? { start, end } : { start: end, end: start };
  }, [dateRange.end, dateRange.start, filterMode, todayYmd]);

  const formatYmd = (ymd) => {
    const [y, m, d] = String(ymd || '').split('-');
    if (!y || !m || !d) return String(ymd || '');
    return `${d}/${m}/${y}`;
  };

  const activePeriodText = useMemo(() => {
    if (filterMode === 'Hoy') return `Hoy · ${formatYmd(activeDateWindow.start)}`;
    if (filterMode === 'Dia') return `Día · ${formatYmd(activeDateWindow.start)}`;
    if (filterMode === '7d') return `Últimos 7 días · ${formatYmd(activeDateWindow.start)} — ${formatYmd(activeDateWindow.end)}`;
    if (filterMode === '30d') return `Últimos 30 días · ${formatYmd(activeDateWindow.start)} — ${formatYmd(activeDateWindow.end)}`;
    return `Rango · ${formatYmd(activeDateWindow.start)} — ${formatYmd(activeDateWindow.end)}`;
  }, [activeDateWindow.end, activeDateWindow.start, filterMode]);

  const daysCount = useMemo(() => {
    const start = new Date(`${activeDateWindow.start}T00:00:00.000Z`);
    const end = new Date(`${activeDateWindow.end}T00:00:00.000Z`);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  }, [activeDateWindow.end, activeDateWindow.start]);

  const isMonthView = daysCount > 60;
  const [productCount, setProductCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [historicalInitialAmount, setHistoricalInitialAmount] = useState(0);

  useEffect(() => {
    const business = getCurrentBusiness();
    if (!business) return;
    api.get(`/businesses/${business.id}/products`).then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setProductCount(data.length);
      setProducts(data);
    }).catch(() => {});
    api.get('/inventory', { params: { lowStock: 'true' } }).then(r => {
      setLowStockCount(Array.isArray(r.data) ? r.data.length : 0);
    }).catch(() => {});
    getCashRegisters({ business_id: business.id }).then(registers => {
      const regs = Array.isArray(registers) ? registers : [];
      const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      const normalized = regs.map(r => {
        const opened = r.opened_at ? new Date(r.opened_at) : null;
        const closed = r.closed_at ? new Date(r.closed_at) : null;
        const openedDate = opened ? `${opened.getFullYear()}-${String(opened.getMonth()+1).padStart(2,'0')}-${String(opened.getDate()).padStart(2,'0')}` : '';
        const closedDate = closed ? `${closed.getFullYear()}-${String(closed.getMonth()+1).padStart(2,'0')}-${String(closed.getDate()).padStart(2,'0')}` : openedDate;
        const openTime = opened ? `${String(opened.getHours()).padStart(2,'0')}:${String(opened.getMinutes()).padStart(2,'0')}` : '--:--';
        const closeTime = closed ? `${String(closed.getHours()).padStart(2,'0')}:${String(closed.getMinutes()).padStart(2,'0')}` : '--:--';
        return {
          ...r,
          dateStart: openedDate,
          dateEnd: closedDate,
          open: openTime,
          close: closeTime,
          status: r.status === 'CLOSED' ? 'Cerrada' : 'Abierta',
          initial: Number(r.initial_amount) || 0,
          expected: Number(r.expected_close) || 0,
          real: Number(r.real_close) || 0,
          diff: (Number(r.real_close) || 0) - (Number(r.expected_close) || 0),
        };
      });
      setRegisterHistory(normalized);
      const latest = regs[0];
      if (latest?.initial_amount) {
        setHistoricalInitialAmount(Number(latest.initial_amount));
      }
    }).catch(() => {});
    getCashRegisterStatus({ businessId: business.id }).then(status => {
      if (status) {
        setIsCashRegisterOpen(true);
        setInitialCash(Number(status.initial_amount) || 0);
      } else {
        setIsCashRegisterOpen(false);
      }
    }).catch(() => {});
  }, [activeBusinessId]);

  const loadedProducts = productCount;
  const stockItems = loadedProducts * 3;
  const missingStock = lowStockCount;

  const filteredTransactions = useMemo(() => {
    return salesTransactions.filter((tx) => {
      if (tx.businessId !== activeBusinessId) return false;
      if (selectedBranch !== 'all' && tx.branchId !== selectedBranch) return false;
      const ymd = String(tx.occurredAt || '').slice(0, 10);
      if (!ymd) return false;
      return ymd >= activeDateWindow.start && ymd <= activeDateWindow.end;
    });
  }, [activeBusinessId, activeDateWindow.end, activeDateWindow.start, salesTransactions, selectedBranch]);

  const filteredCashMovements = useMemo(() => {
    return cashMovements.filter((m) => {
      if (m.businessId !== activeBusinessId) return false;
      if (selectedBranch !== 'all' && m.branchId !== selectedBranch) return false;
      const ymd = String(m.occurredAt || '').slice(0, 10);
      if (!ymd) return false;
      return ymd >= activeDateWindow.start && ymd <= activeDateWindow.end;
    });
  }, [activeBusinessId, activeDateWindow.end, activeDateWindow.start, cashMovements, selectedBranch]);

  const employeeById = useMemo(() => {
    return new Map((employees || []).map((e) => [e.id, e]));
  }, [employees]);

  const topEmployees = useMemo(() => {
    const totals = new Map();
    const counts = new Map();

    filteredTransactions.forEach((tx) => {
      const empId = tx.sellerEmployeeId || '__admin__';
      totals.set(empId, (totals.get(empId) || 0) + (Number(tx.total) || 0));
      counts.set(empId, (counts.get(empId) || 0) + 1);
    });

    const sorted = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id]) => id);

    return sorted.map((id) => {
      if (id === '__admin__') {
        return {
          id: '__admin__',
          name: 'Admin',
          sales: totals.get(id) || 0,
          count: counts.get(id) || 0,
          avatar: 'A',
          color: '#6366f1',
        };
      }
      const emp = employeeById.get(id);
      const name = emp?.name || id;
      return {
        id,
        name: name.split(' ')[0] || name,
        sales: totals.get(id) || 0,
        count: counts.get(id) || 0,
        avatar: emp?.avatar || (name?.[0] || '?'),
        color: emp?.color || '#94a3b8',
      };
    });
  }, [employeeById, filteredTransactions]);

  const paymentTotals = useMemo(() => {
    const acc = {
      cash: 0,
      mp: 0,
      transfer: 0,
      fiadoOpen: 0,
      fiadoPaid: 0,
      paidSalesTotal: 0,
      pendingTotal: 0,
      salesTotal: 0,
      txCount: 0,
      cashCount: 0,
      mpCount: 0,
      transferCount: 0,
      fiadoCount: 0,
    };

    filteredTransactions.forEach((tx) => {
      const total = Number(tx.total) || 0;
      const isPending = tx.status === 'pending';
      acc.salesTotal += total;
      acc.txCount += 1;

      if (isPending) {
        acc.pendingTotal += total;
      } else {
        acc.paidSalesTotal += total;
      }

      if (tx.paymentMethod === 'cash') {
        if (!isPending) acc.cash += total;
        acc.cashCount += 1;
      }
      if (tx.paymentMethod === 'mp') {
        if (!isPending) acc.mp += total;
        acc.mpCount += 1;
      }
      if (tx.paymentMethod === 'transfer') {
        if (!isPending) acc.transfer += total;
        acc.transferCount += 1;
      }
      if (tx.paymentMethod === 'fiado') {
        if (isPending) {
          acc.fiadoOpen += total;
        } else {
          acc.fiadoPaid += total;
        }
        acc.fiadoCount += 1;
      }
    });

    return acc;
  }, [filteredTransactions]);

  const salesCash = paymentTotals.cash;
  const salesMP = paymentTotals.mp;
  const salesTransfer = paymentTotals.transfer;
  const totalSales = paymentTotals.salesTotal;
  const qtySales = paymentTotals.txCount;
  const toCollect = paymentTotals.fiadoOpen;
  const collectedFiados = paymentTotals.fiadoPaid;

  const closeValidation = useMemo(() => {
    const countedCash = Number(closeCountedCash) || 0;
    const countedMp = Number(closeCountedMp) || 0;
    const countedTransfer = Number(closeCountedTransfer) || 0;
    const total = countedCash + countedMp + countedTransfer;
    return {
      countedCash, countedMp, countedTransfer, total,
      diffCash: countedCash - salesCash,
      diffMp: countedMp - salesMP,
      diffTransfer: countedTransfer - salesTransfer,
      totalDiff: total - (salesCash + salesMP + salesTransfer),
      isReady: closeCountedCash !== '' && closeCountedMp !== '' && closeCountedTransfer !== '',
    };
  }, [closeCountedCash, closeCountedMp, closeCountedTransfer, salesCash, salesMP, salesTransfer]);

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const buckets = useMemo(() => {
    if (filterMode === 'Hoy') {
      const hours = Array.from({ length: 12 }, (_, i) => 9 + i);
      return {
        kind: 'hour',
        labels: hours.map((h) => `${h}h`),
        meta: hours.map((h) => ({ ymd: activeDateWindow.end, hour: h })),
      };
    }

    if (isMonthView) {
      const start = activeDateWindow.start.slice(0, 7);
      const end = activeDateWindow.end.slice(0, 7);
      const months = [];
      let current = start;
      while (current <= end) {
        months.push(current);
        const [y, m] = current.split('-').map(Number);
        const next = new Date(Date.UTC(y, m - 1, 1));
        next.setUTCMonth(next.getUTCMonth() + 1);
        const ny = next.getUTCFullYear();
        const nm = String(next.getUTCMonth() + 1).padStart(2, '0');
        current = `${ny}-${nm}`;
      }
      return {
        kind: 'month',
        labels: months.map((ym) => {
          const [y, m] = ym.split('-');
          const monthLabel = monthNames[Number(m) - 1];
          const isFirstJan = m === '01' && (months.indexOf(ym) === 0 || months[months.indexOf(ym) - 1]?.split('-')[0] !== y);
          return isFirstJan ? `${monthLabel} '${y.slice(2)}` : monthLabel;
        }),
        meta: months.map((ym) => ({ ym })),
        yearBoundaries: months.reduce((acc, ym, i) => {
          if (i > 0 && ym.split('-')[0] !== months[i - 1].split('-')[0]) acc.push(i);
          return acc;
        }, []),
      };
    }

    const days = [];
    let cursor = activeDateWindow.start;
    while (cursor <= activeDateWindow.end) {
      days.push(cursor);
      cursor = addDaysYmd(cursor, 1);
    }
    return {
      kind: 'day',
      labels: days.map((ymd) => {
        const [y, m, d] = ymd.split('-');
        const dt = new Date(`${ymd}T12:00:00`);
        const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dt.getDay()];
        if (daysCount <= 7) return `${dayName} ${d}`;
        return `${d}/${m}`;
      }),
      meta: days.map((ymd) => ({ ymd })),
    };
  }, [activeDateWindow.end, activeDateWindow.start, filterMode, isMonthView, monthNames]);

  const employeeChartData = useMemo(() => {
    const seriesIds = topEmployees.map((e) => e.id);
    const base = buckets.meta.map(() => {
      const o = {};
      seriesIds.forEach((id) => {
        o[id] = 0;
        o[`${id}_qty`] = 0;
      });
      return o;
    });

    const metaIndex = new Map();
    if (buckets.kind === 'hour') {
      buckets.meta.forEach((m, i) => metaIndex.set(`${m.ymd}-${m.hour}`, i));
    } else if (buckets.kind === 'day') {
      buckets.meta.forEach((m, i) => metaIndex.set(m.ymd, i));
    } else {
      buckets.meta.forEach((m, i) => metaIndex.set(m.ym, i));
    }

    filteredTransactions.forEach((tx) => {
      const empId = tx.sellerEmployeeId || '__admin__';
      if (!seriesIds.includes(empId)) return;
      const total = Number(tx.total) || 0;
      const ymd = String(tx.occurredAt || '').slice(0, 10);

      let idx = -1;
      if (buckets.kind === 'hour') {
        const hour = Number(String(tx.occurredAt || '').slice(11, 13));
        idx = metaIndex.get(`${ymd}-${hour}`) ?? -1;
      } else if (buckets.kind === 'day') {
        idx = metaIndex.get(ymd) ?? -1;
      } else {
        idx = metaIndex.get(ymd.slice(0, 7)) ?? -1;
      }

      if (idx < 0) return;
      base[idx][empId] += total;
      base[idx][`${empId}_qty`] += 1;
    });

    return base;
  }, [buckets.kind, buckets.meta, filteredTransactions, topEmployees]);

  const cashChartData = useMemo(() => {
    const base = buckets.meta.map(() => ({ ingresos: 0, ingresos_qty: 0, egresos: 0, egresos_qty: 0 }));

    const metaIndex = new Map();
    if (buckets.kind === 'hour') {
      buckets.meta.forEach((m, i) => metaIndex.set(`${m.ymd}-${m.hour}`, i));
    } else if (buckets.kind === 'day') {
      buckets.meta.forEach((m, i) => metaIndex.set(m.ymd, i));
    } else {
      buckets.meta.forEach((m, i) => metaIndex.set(m.ym, i));
    }

    filteredTransactions.forEach((tx) => {
      const total = Number(tx.total) || 0;
      const ymd = String(tx.occurredAt || '').slice(0, 10);

      let idx = -1;
      if (buckets.kind === 'hour') {
        const hour = Number(String(tx.occurredAt || '').slice(11, 13));
        idx = metaIndex.get(`${ymd}-${hour}`) ?? -1;
      } else if (buckets.kind === 'day') {
        idx = metaIndex.get(ymd) ?? -1;
      } else {
        idx = metaIndex.get(ymd.slice(0, 7)) ?? -1;
      }

      if (idx < 0) return;
      base[idx].ingresos += total;
      base[idx].ingresos_qty += 1;
    });

    filteredCashMovements.forEach((m) => {
      const amount = Number(m.amount) || 0;
      const ymd = String(m.occurredAt || '').slice(0, 10);

      let idx = -1;
      if (buckets.kind === 'hour') {
        const hour = Number(String(m.occurredAt || '').slice(11, 13));
        idx = metaIndex.get(`${ymd}-${hour}`) ?? -1;
      } else if (buckets.kind === 'day') {
        idx = metaIndex.get(ymd) ?? -1;
      } else {
        idx = metaIndex.get(ymd.slice(0, 7)) ?? -1;
      }

      if (idx < 0) return;
      if (m.type === 'income') {
        base[idx].ingresos += amount;
        base[idx].ingresos_qty += 1;
      }
      if (m.type === 'expense') {
        base[idx].egresos += amount;
        base[idx].egresos_qty += 1;
      }
    });

    return base;
  }, [buckets.kind, buckets.meta, filteredCashMovements, filteredTransactions]);

  const paymentMethodChartData = useMemo(() => {
    const base = buckets.meta.map(() => ({
      cash: 0,
      cash_qty: 0,
      mp: 0,
      mp_qty: 0,
      transfer: 0,
      transfer_qty: 0,
      fiado: 0,
      fiado_qty: 0,
    }));

    const metaIndex = new Map();
    if (buckets.kind === 'hour') {
      buckets.meta.forEach((m, i) => metaIndex.set(`${m.ymd}-${m.hour}`, i));
    } else if (buckets.kind === 'day') {
      buckets.meta.forEach((m, i) => metaIndex.set(m.ymd, i));
    } else {
      buckets.meta.forEach((m, i) => metaIndex.set(m.ym, i));
    }

    filteredTransactions.forEach((tx) => {
      const method = tx.paymentMethod;
      if (method !== 'cash' && method !== 'mp' && method !== 'transfer' && method !== 'fiado') return;
      const total = Number(tx.total) || 0;
      const ymd = String(tx.occurredAt || '').slice(0, 10);

      let idx = -1;
      if (buckets.kind === 'hour') {
        const hour = Number(String(tx.occurredAt || '').slice(11, 13));
        idx = metaIndex.get(`${ymd}-${hour}`) ?? -1;
      } else if (buckets.kind === 'day') {
        idx = metaIndex.get(ymd) ?? -1;
      } else {
        idx = metaIndex.get(ymd.slice(0, 7)) ?? -1;
      }

      if (idx < 0) return;
      base[idx][method] += total;
      base[idx][`${method}_qty`] += 1;
    });

    return base;
  }, [buckets.kind, buckets.meta, filteredTransactions]);

  const chartLabels = buckets.labels;

  const currentTotalIncome = cashChartData.reduce((acc, d) => acc + (d.ingresos || 0), 0);
  const currentTotalExpense = cashChartData.reduce((acc, d) => acc + (d.egresos || 0), 0);
  const currentNetFlow = currentTotalIncome - currentTotalExpense;
  const currentTotalAmount = historicalInitialAmount + currentNetFlow;

  const previousPeriodWindow = useMemo(() => {
    if (filterMode === 'Hoy') return null;
    const startPrev = addDaysYmd(activeDateWindow.start, -daysCount);
    const endPrev = addDaysYmd(activeDateWindow.start, -1);
    return { start: startPrev, end: endPrev };
  }, [activeDateWindow.start, addDaysYmd, daysCount, filterMode]);

  const previousNetFlow = useMemo(() => {
    if (!previousPeriodWindow) return null;
    const prevPaidSales = salesTransactions.filter((tx) => {
      if (tx.businessId !== activeBusinessId) return false;
      if (selectedBranch !== 'all' && tx.branchId !== selectedBranch) return false;
      const ymd = String(tx.occurredAt || '').slice(0, 10);
      return ymd >= previousPeriodWindow.start && ymd <= previousPeriodWindow.end;
    });
    const prevMoves = cashMovements.filter((m) => {
      if (m.businessId !== activeBusinessId) return false;
      if (selectedBranch !== 'all' && m.branchId !== selectedBranch) return false;
      const ymd = String(m.occurredAt || '').slice(0, 10);
      return ymd >= previousPeriodWindow.start && ymd <= previousPeriodWindow.end;
    });

    const prevIncome = prevPaidSales.reduce((acc, tx) => acc + (Number(tx.total) || 0), 0) +
      prevMoves.filter((m) => m.type === 'income').reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
    const prevExpense = prevMoves.filter((m) => m.type === 'expense').reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
    return prevIncome - prevExpense;
  }, [activeBusinessId, cashMovements, previousPeriodWindow, salesTransactions, selectedBranch]);

  const isTrendingUp = previousNetFlow == null ? true : currentNetFlow >= previousNetFlow;
  const trendPct = useMemo(() => {
    if (previousNetFlow == null) return null;
    if (previousNetFlow === 0) return null;
    return ((currentNetFlow - previousNetFlow) / Math.abs(previousNetFlow)) * 100;
  }, [currentNetFlow, previousNetFlow]);

  const incomeDistribution = [
    { name: 'Efectivo', value: salesCash, count: paymentTotals.cashCount, color: '#3b82f6' },
    { name: 'MercadoPago', value: salesMP, count: paymentTotals.mpCount, color: '#0ea5e9' },
    { name: 'Transferencia', value: salesTransfer, count: paymentTotals.transferCount, color: '#6366f1' },
    { name: 'Fiados (pend.)', value: toCollect, count: paymentTotals.fiadoCount, color: '#0f172a' }
  ];

  const transferSummary = useMemo(() => {
    const txs = filteredTransactions.filter((tx) => tx.paymentMethod === 'transfer');
    const count = txs.length;
    const amount = txs.reduce((acc, tx) => acc + (Number(tx.total) || 0), 0);
    return { count, amount };
  }, [filteredTransactions]);

  const categoryDistribution = useMemo(() => {
    if (!products || products.length === 0) {
      return [
        { name: 'Sin datos', value: 1, color: '#64748b' }
      ];
    }
    const categoryMap = {};
    products.forEach(p => {
      const catName = p.categoryName || 'Otros';
      categoryMap[catName] = (categoryMap[catName] || 0) + 1;
    });
    const colors = ['#2563eb', '#0284c7', '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
    return Object.entries(categoryMap).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    }));
  }, [products]);

  const branchData = useMemo(() => {
    const statsByBranch = new Map();
    filteredTransactions.forEach((tx) => {
      const branchId = tx.branchId || 'unknown';
      const current = statsByBranch.get(branchId) || { total: 0, count: 0 };
      current.total += Number(tx.total) || 0;
      current.count += 1;
      statsByBranch.set(branchId, current);
    });
    
    const totalSales = Array.from(statsByBranch.values()).reduce((acc, v) => acc + v.total, 0) || 1;
    const totalCount = Array.from(statsByBranch.values()).reduce((acc, v) => acc + v.count, 0) || 1;
    
    const rows = Array.from(statsByBranch.entries()).map(([branchId, stats]) => {
      const branch = branches.find(b => String(b.id) === String(branchId));
      const name = branch?.name || branchId;
      return {
        id: branchId,
        name,
        total: stats.total,
        count: stats.count,
        percentage: Math.round((stats.total / totalSales) * 100),
        avgTicket: stats.count > 0 ? Math.round(stats.total / stats.count) : 0,
        salesPerTransaction: stats.count > 0 ? (stats.total / stats.count).toLocaleString(undefined, {maximumFractionDigits: 0}) : '0',
      };
    });
    return rows.sort((a, b) => b.total - a.total);
  }, [filteredTransactions, branches]);

  // Manejadores de Caja
  const handleCloseRegister = () => {
    setShowCloseModal(true);
  };

  const confirmCloseRegister = async () => {
    const business = getCurrentBusiness();
    if (!business) return;
    const realClose = closeValidation.isReady
      ? closeValidation.total + initialCash + (paymentTotals.fiadoOpen || 0)
      : (salesCash + salesMP + salesTransfer) + initialCash + (paymentTotals.fiadoOpen || 0);
    try {
      await closeCashRegister({
        business_id: business.id,
        branch_id: selectedBranch !== 'all' ? selectedBranch : null,
        real_close: realClose,
        notes: closeValidation.isReady ? `E:$${closeValidation.countedCash} MP:$${closeValidation.countedMp} T:$${closeValidation.countedTransfer}` : '',
        closed_by_user_id: getCurrentUser()?.id || null,
      });
      setIsCashRegisterOpen(false);
      setShowCloseModal(false);
      setInitialCash(0);
      setCloseCountedCash(''); setCloseCountedMp(''); setCloseCountedTransfer('');
    } catch (e) {
      console.error('Error closing cash register:', e);
    }
  };

  const handleOpenRegister = async () => {
    const business = getCurrentBusiness();
    if (!business) return;
    try {
      await openCashRegister({
        business_id: business.id,
        branch_id: selectedBranch !== 'all' ? selectedBranch : null,
        initial_amount: initialCash,
        opened_by_user_id: getCurrentUser()?.id || null,
      });
      setIsCashRegisterOpen(true);
    } catch (e) {
      console.error('Error opening cash register:', e);
    }
  };

  const chartDetailData = useMemo(() => {
    if (!chartDetail) return null;

    const matchesBucket = (occurredAt) => {
      const ymd = String(occurredAt || '').slice(0, 10);
      if (!ymd) return false;
      if (chartDetail.kind === 'hour') {
        const hour = Number(String(occurredAt || '').slice(11, 13));
        return ymd === chartDetail.bucket?.ymd && hour === chartDetail.bucket?.hour;
      }
      if (chartDetail.kind === 'day') {
        return ymd === chartDetail.bucket?.ymd;
      }
      return ymd.slice(0, 7) === chartDetail.bucket?.ym;
    };

    const fmtYmd = (ymd) => {
      const [y, m, d] = String(ymd || '').split('-');
      if (!y || !m || !d) return String(ymd || '');
      return `${d}/${m}/${y}`;
    };

    const title =
      chartDetail.kind === 'hour'
        ? `${fmtYmd(chartDetail.bucket?.ymd)} · ${String(chartDetail.bucket?.hour).padStart(2, '0')}:00`
        : chartDetail.kind === 'day'
          ? fmtYmd(chartDetail.bucket?.ymd)
          : chartDetail.bucket?.ym || '';

    if (chartDetail.chart === 'empleados') {
      const txs = filteredTransactions
        .filter((tx) => matchesBucket(tx.occurredAt))
        .sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)));

      const totals = new Map();
      txs.forEach((tx) => {
        const empId = tx.sellerEmployeeId || 'unknown';
        totals.set(empId, (totals.get(empId) || 0) + (Number(tx.total) || 0));
      });

      const summary = Array.from(totals.entries())
        .map(([empId, total]) => {
          const emp = employeeById.get(empId);
          return {
            empId,
            name: emp?.name || empId,
            total,
            color: emp?.color || '#94a3b8',
            avatar: emp?.avatar || (emp?.name?.[0] || '?'),
          };
        })
        .sort((a, b) => b.total - a.total);

      return { title, type: 'empleados', transactions: txs, summary };
    }

    if (chartDetail.chart === 'metodos') {
      const txs = filteredTransactions
        .filter((tx) => matchesBucket(tx.occurredAt))
        .sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)));

      const methodMeta = {
        cash: { name: 'Efectivo', color: '#3b82f6' },
        mp: { name: 'MercadoPago', color: '#0ea5e9' },
        transfer: { name: 'Transferencia', color: '#6366f1' },
        fiado: { name: 'Fiado', color: '#0f172a' },
      };

      const totals = new Map();
      const counts = new Map();
      txs.forEach((tx) => {
        const method = tx.paymentMethod;
        if (!methodMeta[method]) return;
        totals.set(method, (totals.get(method) || 0) + (Number(tx.total) || 0));
        counts.set(method, (counts.get(method) || 0) + 1);
      });

      const order = ['cash', 'mp', 'transfer', 'fiado'];
      const summary = order
        .filter((m) => methodMeta[m])
        .map((m) => ({
          method: m,
          name: methodMeta[m].name,
          color: methodMeta[m].color,
          total: totals.get(m) || 0,
          count: counts.get(m) || 0,
        }));

      return { title, type: 'metodos', transactions: txs, summary };
    }

    const paidSales = filteredTransactions
      .filter((tx) => matchesBucket(tx.occurredAt))
      .sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)));

    const incomes = filteredCashMovements
      .filter((m) => m.type === 'income' && matchesBucket(m.occurredAt))
      .sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)));

    const expenses = filteredCashMovements
      .filter((m) => m.type === 'expense' && matchesBucket(m.occurredAt))
      .sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)));

    const totals = {
      ingresos: paidSales.reduce((acc, tx) => acc + (Number(tx.total) || 0), 0) + incomes.reduce((acc, m) => acc + (Number(m.amount) || 0), 0),
      egresos: expenses.reduce((acc, m) => acc + (Number(m.amount) || 0), 0),
    };

    return { title, type: 'flujo', paidSales, incomes, expenses, totals };
  }, [chartDetail, employeeById, filteredCashMovements, filteredTransactions]);

  return (
    <div className="app-enter p-3 md:p-4 h-full flex flex-col mx-auto w-full max-w-[1600px] overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-[#0b1120] relative">
      {/* Fondo estilizado con degradado y ondas en la parte inferior */}
      <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-gradient-to-t from-blue-500/10 dark:from-blue-900/10 to-transparent pointer-events-none z-0"></div>
      <svg className="absolute bottom-0 left-0 w-full h-32 opacity-[0.03] dark:opacity-[0.02] pointer-events-none z-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="currentColor" className="text-blue-900 dark:text-blue-400" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,213.3C672,203,768,149,864,133.3C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
      
      {/* HEADER & FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-50">
        <div>
          <h1 className="app-page-title tracking-tight">
            Panel Principal
          </h1>
          <p className="app-page-subtitle font-medium">
            Resumen de actividad {selectedBranch !== 'all' ? `en Sucursal ${selectedBranch === 'centro' ? 'Centro' : 'Norte'}` : 'global'}
          </p>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            {activePeriodText}
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
              {filterMode === 'Hoy'
                ? 'Hoy'
                : filterMode === 'Dia'
                  ? `Día (${formatYmd(activeDateWindow.start)})`
                : filterMode === '7d'
                  ? 'Últimos 7 días'
                  : filterMode === '30d'
                    ? 'Últimos 30 días'
                    : filterMode === '90d'
                      ? 'Últimos 90 días'
                      : filterMode === '365d'
                        ? 'Último año'
                        : `Rango (${formatYmd(activeDateWindow.start)} — ${formatYmd(activeDateWindow.end)})`}
              <ChevronDown size={14} />
            </button>
            
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 animate-fadeIn">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button 
                    onClick={() => {
                      setFilterMode('Hoy');
                      setDateRange({ start: todayYmd, end: todayYmd });
                      setIsFilterOpen(false);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${filterMode === 'Hoy' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    Hoy
                  </button>
                  <button 
                    onClick={() => {
                      setFilterMode('Dia');
                      setDateRange({ start: dateRange.start || todayYmd, end: dateRange.start || todayYmd });
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${filterMode === 'Dia' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    Día
                  </button>
                  <button 
                    onClick={() => {
                      setFilterMode('7d');
                      setDateRange({ start: addDaysYmd(todayYmd, -6), end: todayYmd });
                      setIsFilterOpen(false);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${filterMode === '7d' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    7 días
                  </button>
                  <button 
                    onClick={() => {
                      setFilterMode('30d');
                      setDateRange({ start: addDaysYmd(todayYmd, -29), end: todayYmd });
                      setIsFilterOpen(false);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${filterMode === '30d' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    30 días
                  </button>
                  <button 
                    onClick={() => {
                      setFilterMode('90d');
                      setDateRange({ start: addDaysYmd(todayYmd, -89), end: todayYmd });
                      setIsFilterOpen(false);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${filterMode === '90d' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    Mes
                  </button>
                  <button 
                    onClick={() => {
                      setFilterMode('365d');
                      setDateRange({ start: addDaysYmd(todayYmd, -364), end: todayYmd });
                      setIsFilterOpen(false);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${filterMode === '365d' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    Año
                  </button>
                  <button 
                    onClick={() => setFilterMode('Rango')}
                    className={`col-span-3 flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${filterMode === 'Rango' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    Rango personalizado
                  </button>
                </div>
                
                {filterMode === 'Dia' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Fecha</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ start: e.target.value, end: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full mt-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Aplicar Día
                    </button>
                  </div>
                )}

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

      {(isLoadingData || dataError) && (
        <div className="mb-5 relative z-40">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-bold flex items-start gap-3 ${
              dataError
                ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300'
                : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-200'
            }`}
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="min-w-0">
              {dataError ? (
                <>
                  <div className="truncate">{dataError}</div>
                  <div className="text-xs font-semibold opacity-80 mt-0.5">
                    Asegurate de que el backend esté corriendo con <strong>npm run dev</strong> (puerto 3001).
                  </div>
                </>
              ) : (
                <div className="truncate">Cargando datos de ventas y caja…</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* GRID PRINCIPAL: 4 Columnas (3 para contenido principal, 1 para sidebar de caja/rankings) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-5 relative z-20">
        
        {/* COLUMNA PRINCIPAL (3/4 width en pantallas grandes) */}
        <div className="xl:col-span-3 space-y-4">
          
          {/* QUICK STATS CARDS - Diseño renovado con texturas y colores azulados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Tarjeta 1: Ingresos Cobrados (Blue Theme) */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-3 rounded-xl shadow-xl shadow-blue-900/20 relative overflow-hidden text-white border border-blue-500/30 group">
              {/* Textura Ondas */}
              <svg className="absolute bottom-0 left-0 w-full h-24 opacity-20 pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="currentColor" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,218.7C960,224,1056,192,1152,165.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
              
              <div className="flex justify-between items-start mb-2.5 relative z-10">
                <div>
                  <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1">Ingresos</p>
                  <p className="text-xl font-display font-black tracking-tight">${(paymentTotals.paidSalesTotal || totalSales).toLocaleString()}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner border border-white/20">
                  <DollarSign size={15} className="text-white" />
                </div>
              </div>
              <p className="text-[11px] font-bold text-blue-100/90 relative z-10">
                Período: {filterMode === 'Hoy' ? 'Hoy' : `${daysCount} días`}
              </p>
            </div>

            {/* Tarjeta 2: Ventas Realizadas (Sky/Cyan Theme) */}
            <div className="bg-gradient-to-br from-sky-500 to-cyan-700 p-3 rounded-xl shadow-xl shadow-sky-900/20 relative overflow-hidden text-white border border-sky-400/30 group">
              {/* Textura Puntos */}
              <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMSkiLz48L3N2Zz4=')]"></div>
              
              <div className="flex justify-between items-start mb-2.5 relative z-10">
                <div>
                  <p className="text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">Ventas Realizadas</p>
                  <p className="text-xl font-display font-black tracking-tight">{qtySales}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner border border-white/20">
                  <ShoppingCart size={15} className="text-white" />
                </div>
              </div>
              <p className="text-[11px] font-bold text-sky-100/90 relative z-10">
                Período: {filterMode === 'Hoy' ? 'Hoy' : `${daysCount} días`}
              </p>
            </div>

            {/* Tarjeta 3: Pendiente Cobro (Amber Theme) */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-3 rounded-xl shadow-xl shadow-amber-900/20 relative overflow-hidden text-white border border-amber-400/30 group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="flex justify-between items-start mb-2.5 relative z-10">
                <div>
                  <p className="text-[11px] font-bold text-amber-200 uppercase tracking-wider mb-1">Pendiente Cobro</p>
                  <p className="text-xl font-display font-black tracking-tight text-white">${paymentTotals.fiadoOpen.toLocaleString()}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-amber-400/30">
                  <Clock size={15} className="text-amber-200" />
                </div>
              </div>
              <p className="text-[11px] font-bold text-amber-100/80 relative z-10">
                {paymentTotals.fiadoCount} fiados pendientes
              </p>
            </div>

            {/* Tarjeta 4: Alertas Stock (Indigo Theme) */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 p-3 rounded-xl shadow-xl shadow-indigo-900/5 dark:shadow-none relative overflow-hidden group border border-indigo-200 dark:border-slate-700 flex flex-col justify-between">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-indigo-900 dark:text-white pointer-events-none">
                <Box size={100} />
              </div>

              <div className="flex justify-between items-start mb-2.5 relative z-10">
                <div>
                  <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Inventario</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight">{stockItems}</p>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ítems</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100 dark:border-slate-700">
                  <Box size={15} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 relative z-10 mt-auto pt-2.5 border-t border-indigo-200/50 dark:border-slate-700">
                Faltantes: <span className="text-orange-700 dark:text-orange-400">{missingStock}</span>
              </p>
            </div>

          </div>

          {/* GRÁFICO DE ACTIVIDAD Y FLUJO DE CAJA */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none p-5 sm:p-6 overflow-visible relative z-30">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity
                      size={16}
                      className={
                        activeChart === 'empleados'
                          ? 'text-blue-500'
                          : activeChart === 'flujo'
                            ? 'text-emerald-500'
                            : 'text-indigo-500'
                      }
                    />
                    {activeChart === 'empleados'
                      ? 'Evolución de Ventas por Empleado'
                      : activeChart === 'flujo'
                        ? 'Flujo de Caja'
                        : 'Métodos de Pago (Monto + Ops)'}
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
                      {trendPct == null ? '—' : `${isTrendingUp ? '+' : ''}${trendPct.toFixed(1)}%`}
                    </span>
                  </div>

                  {activeChart === 'flujo' && (
                    <div className="border-l border-slate-200 dark:border-slate-800 pl-4 ml-auto hidden md:flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Flujo Neto:</span>
                      <span className={`text-sm font-black ${currentNetFlow >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {currentNetFlow >= 0 ? '+' : ''}${currentNetFlow.toLocaleString()}
                      </span>
                      {isCashRegisterOpen && (
                        <span className="text-[9px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/30">
                          Abierto
                        </span>
                      )}
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
                  <button 
                    onClick={() => setActiveChart('metodos')} 
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeChart === 'metodos' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    Métodos
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
                  ) : activeChart === 'flujo' ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${isCashRegisterOpen ? 'border-2 border-dashed border-emerald-500 bg-transparent' : 'bg-emerald-500'}`}></div>
                        {isCashRegisterOpen ? 'Ingresos (Provisional)' : 'Ingresos'}
                      </div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div> Egresos</div>
                      {isCashRegisterOpen && <span className="text-[9px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/30">Caja Abierta</span>}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div> Efectivo</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm"></div> MP</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm"></div> Transfer</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-sm"></div> Fiado</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <AreaLineChart 
              data={
                activeChart === 'empleados'
                  ? employeeChartData
                  : activeChart === 'flujo'
                    ? cashChartData
                    : paymentMethodChartData
              } 
              labels={chartLabels} 
              series={activeChart === 'empleados' 
                ? topEmployees.map(emp => ({ key: emp.id, color: emp.color, name: emp.name }))
                : activeChart === 'flujo' ? [
                    { key: 'ingresos', color: '#10b981', name: 'Ingresos (Provisional)', dashed: isCashRegisterOpen },
                    { key: 'egresos', color: '#ef4444', name: 'Egresos' }
                  ]
                  : [
                      { key: 'cash', color: '#3b82f6', name: 'Efectivo' },
                      { key: 'mp', color: '#0ea5e9', name: 'MercadoPago' },
                      { key: 'transfer', color: '#6366f1', name: 'Transferencia' },
                      { key: 'fiado', color: '#0f172a', name: 'Fiado' }
                    ]
              }
              isCashFlow={activeChart === 'flujo'}
              yearBoundaries={buckets.yearBoundaries}
              onPointSelect={(payload) => {
                if (!payload) {
                  setChartDetail(null);
                  return;
                }
                setChartDetail({
                  ...payload,
                  kind: buckets.kind,
                  bucket: buckets.meta[payload.index],
                  chart: activeChart,
                });
              }}
            />
            {isCashRegisterOpen && activeChart === 'flujo' && (
              <div className="px-4 pb-3 flex items-center gap-1.5">
                <AlertCircle size={11} className="text-amber-500 shrink-0" />
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  Valores provisionales hasta confirmación de cierre de caja
                </span>
              </div>
            )}
          </div>

          {/* SECCIÓN DE TORTAS Y SUCURSALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Torta: Distribución de Ingresos */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none p-6 flex flex-col items-center">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-6 w-full text-left flex items-center gap-2">
                <Banknote size={16} className="text-blue-500" />
                Composición de Ingresos
              </h2>
              {totalSales === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <Banknote size={24} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Sin ingresos registrados</p>
                  <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">Las ventas aparecerán aquí</p>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Torta: Ventas por Categoría */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none p-6 flex flex-col items-center">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-6 w-full text-left flex items-center gap-2">
                <Package size={16} className="text-sky-500" />
                Ventas por Categoría
              </h2>
              {categoryDistribution.length <= 1 && categoryDistribution[0]?.name === 'Sin datos' ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <Package size={24} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Sin categorías configuradas</p>
                  <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">Asigná categorías a tus productos</p>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Comparativa Sucursales */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none p-6 lg:col-span-1 md:col-span-2">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Store size={16} className="text-indigo-500" />
                Comparativa Sucursales
              </h2>
              
              {!isMultiBranch || selectedBranch !== 'all' ? (
                <div className="flex flex-col items-center justify-center h-40 text-center text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Store size={32} className="mb-2 opacity-50" />
                  <p className="text-xs font-bold px-4">Selecciona "Todas las sucursales" para ver la comparativa global.</p>
                </div>
              ) : branchData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Store size={32} className="mb-2 opacity-50" />
                  <p className="text-xs font-bold px-4">No hay datos de ventas para este periodo.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {branchData.map((branch, index) => (
                    <div key={branch.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                              #{index + 1}
                            </span>
                            <span className="font-black text-base text-slate-900 dark:text-white">{branch.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                            <span>{branch.count} ventas</span>
                            <span>·</span>
                            <span>Promedio ${branch.avgTicket.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-lg text-blue-600 dark:text-blue-400">${branch.total.toLocaleString()}</span>
                          <span className="text-xs font-bold text-slate-500 block">{branch.percentage}% del total</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                            index === 1 ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' : 
                            'bg-gradient-to-r from-slate-400 to-slate-500'
                          }`} 
                          style={{ width: `${branch.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className="text-[10px] font-bold text-center text-slate-400 mt-2">
                    Datos calculados según el periodo (
                    {isMonthView
                      ? 'Mensual'
                      : filterMode === 'Hoy'
                        ? 'Hoy'
                        : filterMode === '7d'
                          ? 'Últimos 7 días'
                          : filterMode === '30d'
                            ? 'Últimos 30 días'
                            : 'Rango'}
                    )
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
                  {/* Show expected vs last confirmed when caja is closed */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                        <Activity size={12} className="text-blue-500" /> Esperado (Sistema)
                      </span>
                      <span className="font-black text-blue-600 dark:text-blue-400">${totalSales.toLocaleString()}</span>
                    </div>
                    {registerHistory.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                          <Check size={12} className="text-emerald-500" /> Último Cierre Confirmado
                        </span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          ${registerHistory[0]?.real_close != null ? Number(registerHistory[0].real_close).toLocaleString() : '—'}
                        </span>
                      </div>
                    )}
                    <div className="w-full h-px bg-slate-200 dark:bg-slate-800"></div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Monto Inicial Efectivo</label>
                      <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="number"
                          value={initialCash}
                          onChange={(e) => setInitialCash(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-3 font-black text-lg text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleOpenRegister}
                    className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2"
                  >
                    Abrir Turno
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                        <Banknote size={12} className="text-blue-400" /> Efectivo
                      </span>
                      <span className="font-black text-white">${salesCash.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                        <CreditCard size={12} className="text-sky-400" /> MercadoPago
                      </span>
                      <span className="font-black text-sky-300">${salesMP.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                        <DollarSign size={12} className="text-indigo-400" /> Transferencia
                      </span>
                      <span className="font-black text-indigo-300">${salesTransfer.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                        <Package size={12} className="text-slate-400" /> Fiado
                      </span>
                      <span className="font-black text-slate-300">${(paymentTotals.fiadoOpen || 0).toLocaleString()}</span>
                    </div>
                    
                    <div className="w-full h-px bg-slate-700"></div>
                    
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
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none p-6">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Medal size={16} className="text-blue-500" />
              Rendimiento de Equipo
            </h2>
            
            {topEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Medal size={24} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Sin ventas registradas</p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">El ranking aparecerá cuando haya ventas</p>
              </div>
            ) : (
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
            )}
          </div>

        </div>
      </div>

      {chartDetailData && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setChartDetail(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Detalle · {chartDetailData.type === 'empleados' ? 'Ventas por empleado' : 'Flujo de caja'}
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {chartDetailData.title}
                </p>
              </div>
              <button
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setChartDetail(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {chartDetailData.type === 'empleados' ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {chartDetailData.summary.map((s) => (
                      <div
                        key={s.empId}
                        className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-md shrink-0"
                          style={{ backgroundColor: s.color }}
                        >
                          {s.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 dark:text-white truncate">{s.name}</div>
                          <div className="text-sm font-black text-slate-900 dark:text-white">${s.total.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <div className="col-span-2">Hora</div>
                      <div className="col-span-2">Sucursal</div>
                      <div className="col-span-4">Vendedor</div>
                      <div className="col-span-2">Método</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>
                    <div className="max-h-[360px] overflow-auto custom-scrollbar divide-y divide-slate-200 dark:divide-slate-800">
                      {chartDetailData.transactions.length === 0 ? (
                        <div className="p-8 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                          No hay ventas para este punto.
                        </div>
                      ) : (
                        chartDetailData.transactions.map((tx) => {
                          const emp = employeeById.get(tx.sellerEmployeeId);
                          const sellerName = tx.sellerEmployeeId ? (emp?.name || tx.sellerEmployeeId || '—') : 'Admin';
                          const branchName = tx.branchId === 'centro' ? 'Centro' : tx.branchId === 'norte' ? 'Norte' : tx.branchId;
                          const time = String(tx.occurredAt || '').slice(11, 16) || '—';
                          const method =
                            tx.paymentMethod === 'cash'
                              ? 'Efectivo'
                              : tx.paymentMethod === 'mp'
                                ? 'MercadoPago'
                                : tx.paymentMethod === 'transfer'
                                  ? 'Transferencia'
                                  : tx.paymentMethod === 'fiado'
                                    ? 'Fiado'
                                    : String(tx.paymentMethod || '—');

                          return (
                            <div key={tx.id} className="grid grid-cols-12 px-4 py-3 text-sm">
                              <div className="col-span-2 font-bold text-slate-700 dark:text-slate-200">{time}</div>
                              <div className="col-span-2 font-bold text-slate-600 dark:text-slate-300">{branchName}</div>
                              <div className="col-span-4 font-black text-slate-900 dark:text-white truncate">{sellerName}</div>
                              <div className="col-span-2 font-bold text-slate-600 dark:text-slate-300">{method}</div>
                              <div className="col-span-2 text-right font-black text-slate-900 dark:text-white">
                                ${Number(tx.total || 0).toLocaleString()}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 p-4">
                      <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        Ingresos
                      </div>
                      <div className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                        ${chartDetailData.totals.ingresos.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/20 p-4">
                      <div className="text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-300">
                        Egresos
                      </div>
                      <div className="text-xl font-black text-red-900 dark:text-red-200">
                        ${chartDetailData.totals.egresos.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Neto
                      </div>
                      <div className={`text-xl font-black ${chartDetailData.totals.ingresos - chartDetailData.totals.egresos >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                        {chartDetailData.totals.ingresos - chartDetailData.totals.egresos >= 0 ? '+' : ''}
                        ${(chartDetailData.totals.ingresos - chartDetailData.totals.egresos).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Ingresos (ventas pagadas + ingresos extra)
                      </div>
                      <div className="max-h-[320px] overflow-auto custom-scrollbar divide-y divide-slate-200 dark:divide-slate-800">
                        {chartDetailData.paidSales.map((tx) => (
                          <div key={`sale-${tx.id}`} className="px-4 py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-black text-slate-900 dark:text-white truncate">Venta #{tx.id}</div>
                              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {String(tx.occurredAt || '').slice(11, 16)} · {tx.branchId === 'centro' ? 'Centro' : tx.branchId === 'norte' ? 'Norte' : tx.branchId}
                              </div>
                            </div>
                            <div className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                              ${Number(tx.total || 0).toLocaleString()}
                            </div>
                          </div>
                        ))}
                        {chartDetailData.incomes.map((m) => {
                          const emp = employeeById.get(m.createdByEmployeeId);
                          return (
                            <div key={`inc-${m.id}`} className="px-4 py-3 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                                  {m.category || 'Ingreso'}
                                </div>
                                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                                  {String(m.occurredAt || '').slice(11, 16)} · {emp?.name || m.createdByEmployeeId || '—'} · {m.description || ''}
                                </div>
                              </div>
                              <div className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                                ${Number(m.amount || 0).toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                        {chartDetailData.paidSales.length === 0 && chartDetailData.incomes.length === 0 && (
                          <div className="p-8 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                            Sin ingresos para este punto.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Egresos
                      </div>
                      <div className="max-h-[320px] overflow-auto custom-scrollbar divide-y divide-slate-200 dark:divide-slate-800">
                        {chartDetailData.expenses.map((m) => {
                          const emp = employeeById.get(m.createdByEmployeeId);
                          return (
                            <div key={`exp-${m.id}`} className="px-4 py-3 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                                  {m.category || 'Egreso'}
                                </div>
                                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                                  {String(m.occurredAt || '').slice(11, 16)} · {emp?.name || m.createdByEmployeeId || '—'} · {m.description || ''}
                                </div>
                              </div>
                              <div className="text-sm font-black text-red-700 dark:text-red-300">
                                ${Number(m.amount || 0).toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                        {chartDetailData.expenses.length === 0 && (
                          <div className="p-8 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                            Sin egresos para este punto.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CIERRE DE CAJA AVANZADO - FULLSCREEN */}
      {showCloseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-slate-950 animate-fadeIn">
          <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 dark:bg-slate-950 px-6 py-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Lock size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Cierre de Caja</h3>
                  <p className="text-[11px] font-bold text-slate-400">Verificación por método de pago</p>
                </div>
              </div>
              <button onClick={() => setShowCloseModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto custom-scrollbar flex-1 p-6 sm:p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                  {/* Left: Expected from system */}
                  <div className="flex-1">
                    <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Esperado (Sistema)</h3>
                    <div className="space-y-2.5">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Banknote size={16} className="text-blue-500" />
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Efectivo</span>
                        </div>
                        <span className="text-base font-black text-slate-900 dark:text-white">${salesCash.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CreditCard size={16} className="text-sky-500" />
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">MercadoPago</span>
                        </div>
                        <span className="text-base font-black text-slate-900 dark:text-white">${salesMP.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <DollarSign size={16} className="text-indigo-500" />
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Transferencia</span>
                        </div>
                        <span className="text-base font-black text-slate-900 dark:text-white">${salesTransfer.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Package size={16} className="text-slate-500" />
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Fiado (Pendiente)</span>
                        </div>
                        <span className="text-base font-black text-slate-900 dark:text-white">${(paymentTotals.fiadoOpen || 0).toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <DollarSign size={16} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Monto Inicial</span>
                        </div>
                        <span className="text-base font-black text-slate-900 dark:text-white">${initialCash.toLocaleString()}</span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/30 flex items-center justify-between">
                        <span className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase">Total Esperado</span>
                        <span className="text-xl font-black text-blue-600 dark:text-blue-400">${(totalSales + initialCash).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Counted inputs */}
                  <div className="flex-1">
                    <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Contado (Real)</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Banknote size={13} className="text-blue-500" /> Efectivo
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                          <input type="number" value={closeCountedCash} onChange={(e) => setCloseCountedCash(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-3 font-bold text-base text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                            placeholder="0" />
                        </div>
                        {closeCountedCash !== '' && (
                          <p className={`text-[11px] font-bold mt-1.5 ${closeValidation.diffCash === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {closeValidation.diffCash === 0 ? 'Exacto' : `${closeValidation.diffCash > 0 ? '+' : ''}${closeValidation.diffCash.toLocaleString()} diferencia`}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <CreditCard size={13} className="text-sky-500" /> MercadoPago
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                          <input type="number" value={closeCountedMp} onChange={(e) => setCloseCountedMp(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-3 font-bold text-base text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                            placeholder="0" />
                        </div>
                        {closeCountedMp !== '' && (
                          <p className={`text-[11px] font-bold mt-1.5 ${closeValidation.diffMp === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {closeValidation.diffMp === 0 ? 'Exacto' : `${closeValidation.diffMp > 0 ? '+' : ''}${closeValidation.diffMp.toLocaleString()} diferencia`}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <DollarSign size={13} className="text-indigo-500" /> Transferencia
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                          <input type="number" value={closeCountedTransfer} onChange={(e) => setCloseCountedTransfer(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-3 font-bold text-base text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                            placeholder="0" />
                        </div>
                        {closeCountedTransfer !== '' && (
                          <p className={`text-[11px] font-bold mt-1.5 ${closeValidation.diffTransfer === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {closeValidation.diffTransfer === 0 ? 'Exacto' : `${closeValidation.diffTransfer > 0 ? '+' : ''}${closeValidation.diffTransfer.toLocaleString()} diferencia`}
                          </p>
                        )}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-sm font-black text-slate-500 uppercase">Total Contado</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">${closeValidation.total.toLocaleString()}</span>
                      </div>
                      {closeValidation.isReady && (
                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                          closeValidation.totalDiff === 0
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30'
                            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30'
                        }`}>
                          {closeValidation.totalDiff === 0 ? <Check size={20} className="text-emerald-500" /> : <AlertTriangle size={20} className="text-amber-500" />}
                          <span className={`text-sm font-bold ${closeValidation.totalDiff === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                            {closeValidation.totalDiff === 0 ? 'Todo cuadra perfecto' : `Diferencia total: ${closeValidation.totalDiff > 0 ? '+' : ''}$${closeValidation.totalDiff.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-5 flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="max-w-4xl mx-auto w-full flex gap-3">
                <button onClick={() => setShowCloseModal(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Seguir con caja abierta
                </button>
                <button onClick={confirmCloseRegister}
                  className="flex-1 py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                  <Check size={18} /> Confirmar Cierre
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
                <X size={16} className="text-slate-500" />
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
