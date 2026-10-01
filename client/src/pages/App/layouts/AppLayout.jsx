import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Package,
  Store,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  CreditCard,
  ListTodo,
  BookOpen,
  Moon,
  Sun,
  UserCircle,
  MapPin,
  Check,
  ChevronDown,
  Search,
  ArrowRight,
  DollarSign,
  ArrowDownCircle,
  AlertTriangle,
  Plus,
  Table2
} from 'lucide-react';
import logo from '../../../assets/images/landing/Gestly.png';
import { GUIDE_QUICK_LINKS, GUIDE_STEPS } from '../Guide';
import api, { getCurrentBusiness, getCurrentUser } from '../../../services/api';

const APP_LAYOUT_DEBUG_URL = 'http://127.0.0.1:7778/event';
const APP_LAYOUT_DEBUG_SESSION = 'catalog-branch-load';
const reportAppLayoutDebug = (hypothesisId, msg, data = {}) => fetch(APP_LAYOUT_DEBUG_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: APP_LAYOUT_DEBUG_SESSION,
    runId: 'pre-fix',
    hypothesisId,
    location: 'client/src/pages/App/layouts/AppLayout.jsx',
    msg,
    data,
    ts: Date.now(),
  }),
}).catch(() => {});

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [customSections, setCustomSections] = useState([]);
  
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [branches, setBranches] = useState([{ id: 'all', name: 'Todas las sucursales' }]);
  
  // Theme handling - reads from gestly_theme_config (set by Settings)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('gestly_theme_config');
      if (saved) return JSON.parse(saved).mode || 'light';
    } catch {}
    return 'light';
  });

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      const savedConfig = localStorage.getItem('gestly_theme_config');
      let config = { mode: 'light', primaryColor: 'default' };
      try { if (savedConfig) config = JSON.parse(savedConfig); } catch {}

      root.classList.remove('dark');
      root.removeAttribute('data-theme');
      root.removeAttribute('data-accent');

      const mode = config.mode || 'light';
      if (mode === 'dark' || mode === 'dark-com' || mode === 'mixed') {
        root.classList.add('dark');
      }
      root.setAttribute('data-theme', mode);
      if (config.primaryColor && config.primaryColor !== 'default') {
        root.setAttribute('data-accent', config.primaryColor);
      }
      setTheme(mode);
    };

    applyTheme();

    const onStorage = (e) => {
      if (e.key === 'gestly_theme_config' || e.key === 'theme') {
        applyTheme();
      }
    };
    window.addEventListener('storage', onStorage);

    const interval = setInterval(applyTheme, 500);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, [theme]);

  // Expense registration state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseConcept, setExpenseConcept] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const registerGlobalExpense = () => {
    if (!expenseConcept.trim() || !expenseAmount || expenseAmount <= 0) return;
    const expenses = JSON.parse(localStorage.getItem('gestly_global_expenses') || '[]');
    expenses.push({ id: Date.now(), date: new Date().toISOString(), concept: expenseConcept, amount: Number(expenseAmount) });
    localStorage.setItem('gestly_global_expenses', JSON.stringify(expenses));
    setExpenseConcept('');
    setExpenseAmount('');
    setIsExpenseModalOpen(false);
  };

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!getCurrentBusiness()?.id) return;
    let cancelled = false;
    api.get('/custom-nodes')
      .then(({ data }) => { if (!cancelled) setCustomSections(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setCustomSections([]); });
    return () => { cancelled = true; };
  }, [location.pathname]);

  useEffect(() => {
    const container = document.querySelector('.app-shell-page');
    if (container) container.scrollTop = 0;
  }, [location.pathname]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Inicio', path: '/app' },
    { icon: ShoppingCart, label: 'Nueva Venta', path: '/app/pos' },
    { icon: CreditCard, label: 'Ventas y Fiados', path: '/app/ventas' },
    { icon: Package, label: 'Mi Catálogo', path: '/app/catalogo' },
    { icon: Users, label: 'Clientes', path: '/app/clientes' },
    { icon: UserCircle, label: 'Empleados', path: '/app/empleados' },
    { icon: Store, label: 'Sucursales', path: '/app/sucursales' },
    { icon: ListTodo, label: 'Lista de Compras', path: '/app/compras' },
    { icon: BookOpen, label: 'Guía Inicial', path: '/app/guia' },
    { icon: Settings, label: 'Configuración', path: '/app/configuracion' },
  ];

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [appSearch, setAppSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedSearchIndex, setHighlightedSearchIndex] = useState(0);

  const branchDropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const actualBranches = useMemo(
    () => branches.filter((branch) => branch.id !== 'all'),
    [branches]
  );
  const isMultiBranch = actualBranches.length > 1;
  const currentBranchName =
    branches.find((branch) => branch.id === selectedBranch)?.name ||
    actualBranches[0]?.name ||
    'Sucursal';

  useEffect(() => {
    const business = getCurrentBusiness();
    const currentUser = getCurrentUser();
    reportAppLayoutDebug('E', '[DEBUG] AppLayout bootstrap', {
      businessId: business?.id ?? null,
      userId: currentUser?.id ?? null,
      isOwner: Boolean(currentUser?.isOwner),
      assignedBranchIds: Array.isArray(currentUser?.assignedBranches)
        ? currentUser.assignedBranches.map((branch) => String(branch.id))
        : [],
    });
    if (!business?.id) {
      setBranches([{ id: 'all', name: 'Todas las sucursales' }]);
      setSelectedBranch('all');
      return;
    }

    let cancelled = false;

    api.get(`/businesses/${business.id}/branches`)
      .then((response) => {
        if (cancelled) return;

        const fetchedBranches = Array.isArray(response.data)
          ? response.data
              .filter((branch) => branch?.id !== undefined && branch?.id !== null)
              .map((branch) => ({
                id: String(branch.id),
                name: branch.name || `Sucursal ${branch.id}`,
              }))
          : [];

        const assignedBranchIds = Array.isArray(currentUser?.assignedBranches)
          ? currentUser.assignedBranches.map((branch) => String(branch.id))
          : [];
        const visibleBranches = currentUser?.isOwner || assignedBranchIds.length === 0
          ? fetchedBranches
          : fetchedBranches.filter((branch) => assignedBranchIds.includes(String(branch.id)));

        const branchOptions = [
          { id: 'all', name: 'Todas las sucursales' },
          ...visibleBranches,
        ];
        const fallbackBranch = visibleBranches.length === 1 ? visibleBranches[0].id : 'all';

        reportAppLayoutDebug('E', '[DEBUG] AppLayout branches resolved', {
          fetchedBranchIds: fetchedBranches.map((branch) => String(branch.id)),
          visibleBranchIds: visibleBranches.map((branch) => String(branch.id)),
          fallbackBranch,
        });

        setBranches(branchOptions);
        setSelectedBranch((prev) => {
          const prevValue = String(prev);
          return branchOptions.some((branch) => branch.id === prevValue)
            ? prevValue
            : fallbackBranch;
        });
      })
      .catch(() => {
        if (cancelled) return;
        setBranches([{ id: 'all', name: 'Todas las sucursales' }]);
        setSelectedBranch('all');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    reportAppLayoutDebug('E', '[DEBUG] AppLayout branch state snapshot', {
      selectedBranch,
      branchIds: branches.map((branch) => String(branch.id)),
      actualBranchIds: actualBranches.map((branch) => String(branch.id)),
    });
  }, [selectedBranch, branches, actualBranches]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setIsBranchDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const toggleTheme = () => {
    const newMode = theme === 'light' ? 'dark' : 'light';
    const savedConfig = localStorage.getItem('gestly_theme_config');
    let config = { mode: 'light', primaryColor: 'default' };
    try { if (savedConfig) config = JSON.parse(savedConfig); } catch {}
    config.mode = newMode;
    localStorage.setItem('gestly_theme_config', JSON.stringify(config));
    localStorage.setItem('theme', newMode);
    setTheme(newMode);
    document.documentElement.classList.toggle('dark', newMode !== 'light');
    document.documentElement.setAttribute('data-theme', newMode);
  };

  const searchItems = useMemo(() => {
    const menuDerived = menuItems.map(item => ({
      label: item.label,
      description: `Ir a ${item.label}`,
      path: item.path,
      keywords: [item.label.toLowerCase(), item.path.replace('/app/', ''), 'atajo'],
    }));

    const guideDerived = [
      ...GUIDE_STEPS.map(step => ({
        label: step.title,
        description: step.description,
        path: step.path,
        keywords: [
          'guia',
          'ayuda',
          'tutorial',
          step.short,
          step.title,
          ...(step.tips || []),
        ].map((s) => String(s).toLowerCase()),
      })),
      ...GUIDE_QUICK_LINKS.map(link => ({
        label: link.label,
        description: 'Acceso rápido (Guía inicial)',
        path: link.path,
        keywords: ['guia', 'acceso rapido', 'atajo', link.label].map((s) =>
          String(s).toLowerCase()
        ),
      })),
    ];

    const quickActions = [
      { label: 'Nueva Venta', description: 'Abrir POS y comenzar a vender', path: '/app/pos', keywords: ['venta', 'pos', 'ticket', 'caja', 'cobrar'] },
      { label: 'Crear Compra', description: 'Abrir lista de compras para restock', path: '/app/compras', keywords: ['compras', 'restock', 'proveedor', 'reponer'] },
      { label: 'Ver Flujo de Caja', description: 'Ir al inicio y revisar ingresos/egresos', path: '/app', keywords: ['caja', 'flujo', 'dashboard', 'inicio'] },
      { label: 'Ver Guía Inicial', description: 'Acceder a ayudas, guías y funciones', path: '/app/guia', keywords: ['guia', 'ayuda', 'tutorial', 'como usar'] },
      { label: 'Gestionar Stock', description: 'Entrar al catálogo y editar productos', path: '/app/catalogo', keywords: ['stock', 'catalogo', 'productos', 'inventario'] },
      { label: 'Ver Fiados', description: 'Abrir ventas y fiados directamente', path: '/app/ventas', keywords: ['fiados', 'cobranzas', 'deudas', 'ventas'] },
      { label: 'Registrar Gasto', description: 'Anotar un gasto o egreso general', path: '#gasto', keywords: ['gasto', 'egreso', 'perdida', 'registrar', 'anotar', 'dinero'] },
    ];

    const unique = new Map();
    [...quickActions, ...guideDerived, ...menuDerived].forEach(item => {
      const key = item.label.toLowerCase();
      if (!unique.has(key)) unique.set(key, item);
    });
    return Array.from(unique.values());
  }, [menuItems]);

  const filteredSearchItems = useMemo(() => {
    const q = appSearch.trim().toLowerCase();
    if (!q) return searchItems.slice(0, 8);
    return searchItems
      .filter(item => {
        const haystack = `${item.label} ${item.description} ${item.keywords.join(' ')}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 10);
  }, [appSearch, searchItems]);

  useEffect(() => {
    setHighlightedSearchIndex(0);
  }, [appSearch, isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isTypingInInput =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';

      if (event.key === '/' && !isTypingInInput) {
        event.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
        return;
      }

      if (!isSearchOpen || filteredSearchItems.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedSearchIndex(prev => (prev + 1) % filteredSearchItems.length);
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedSearchIndex(prev => (prev - 1 + filteredSearchItems.length) % filteredSearchItems.length);
      }

      if (event.key === 'Enter' && document.activeElement === searchInputRef.current) {
        event.preventDefault();
        const selectedItem = filteredSearchItems[highlightedSearchIndex];
        if (selectedItem) {
          navigate(selectedItem.path);
          setIsSearchOpen(false);
          setAppSearch('');
        }
      }

      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredSearchItems, highlightedSearchIndex, isSearchOpen, navigate]);

  return (
    <div className="h-screen w-screen overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--content-bg)' }}>
      <div className="h-full w-full overflow-hidden md:w-[111.111%] md:h-[111.111%] md:scale-[0.9] md:origin-top-left">
        <div className="flex h-full overflow-hidden" style={{ color: 'var(--text-primary)' }}>
          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside 
            className={`
              fixed md:static inset-y-0 left-0 z-50 
              flex flex-col border-r
              transition-all duration-300 ease-in-out
              ${isSidebarOpen ? 'w-56' : 'w-[3.5rem]'}
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
            style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
          >
        {/* Sidebar Header */}
        <div className="h-14 flex items-center border-b relative shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
          {isSidebarOpen ? (
            <div className="flex items-center gap-2.5 px-4 w-full">
              <img src={logo} alt="Gestly" className="w-7 h-7 object-contain shrink-0" />
              <span className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>Gestly</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <img src={logo} alt="Gestly" className="w-6 h-6 object-contain shrink-0" />
            </div>
          )}
          
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg transition-colors absolute right-2"
            style={{ color: 'var(--sidebar-text)' }}
          >
            <X size={18} />
          </button>

          {/* Toggle Sidebar Button (Desktop) */}
          <button 
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              setIsUserMenuOpen(false);
            }}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 border rounded-full items-center justify-center shadow-sm z-50 transition-all hover:scale-110"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--sidebar-text)' }}
          >
            {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* Sidebar Navigation (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
          <div className={`space-y-1 ${isSidebarOpen ? 'px-2' : 'px-1.5'}`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/app'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                    ${isSidebarOpen ? 'px-3 py-2.5 justify-start' : 'px-0 py-2.5 justify-center'}
                    ${isActive ? 'font-bold sidebar-nav-item-active' : 'font-medium sidebar-nav-item'}
                    ${isActive && !isSidebarOpen ? 'sidebar-nav-item-active-collapsed' : ''}
                  `}
                  style={isActive ? { 
                    color: 'var(--sidebar-active-text)'
                  } : { 
                    color: 'var(--sidebar-text)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <Icon size={19} className="shrink-0 relative z-10" strokeWidth={isActive ? 2 : 1.5} />
                  {isSidebarOpen && (
                    <span className="whitespace-nowrap transition-all duration-200 text-[13px] relative z-10">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
            <div className="pt-3 mt-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
              {isSidebarOpen && <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Mis secciones</p>}
              {customSections.map((section) => (
                <NavLink
                  key={section.id}
                  to={`/app/secciones/${section.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={!isSidebarOpen ? section.title : undefined}
                  className={({ isActive }) => `flex items-center gap-2.5 rounded-xl py-2.5 transition-colors ${isSidebarOpen ? 'px-3' : 'justify-center'} ${isActive ? 'sidebar-nav-item-active font-bold' : 'sidebar-nav-item font-medium'}`}
                >
                  <Table2 size={19} className="shrink-0" />
                  {isSidebarOpen && <span className="truncate text-[13px]">{section.title}</span>}
                </NavLink>
              ))}
              <NavLink
                to="/app/secciones/nueva"
                onClick={() => setIsMobileMenuOpen(false)}
                title="Crear sección"
                className={({ isActive }) => `flex items-center gap-2.5 rounded-xl py-2.5 transition-colors ${isSidebarOpen ? 'px-3' : 'justify-center'} ${isActive ? 'sidebar-nav-item-active font-bold' : 'sidebar-nav-item font-medium'}`}
              >
                <Plus size={19} className="shrink-0" />
                {isSidebarOpen && <span className="text-[13px]">Agregar sección</span>}
              </NavLink>
            </div>
          </div>
        </div>

        {/* Sidebar Footer (User Profile) */}
        <div className="p-2 border-t shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="relative">
            {/* User Popover Menu */}
            {isUserMenuOpen && (
              <div 
                className="absolute bottom-full left-0 mb-2 w-56 rounded-2xl border shadow-xl p-2 z-50"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <div className="px-3 py-2 mb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Tu Negocio</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Plan Pro</p>
                </div>
                
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-1"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            )}

            {/* User Button */}
            {isSidebarOpen ? (
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0" style={{ backgroundColor: 'var(--sidebar-active)', color: 'var(--sidebar-active-text)' }}>
                  TN
                </div>
                <div className="flex-1 text-left whitespace-nowrap overflow-hidden">
                  <p className="text-[13px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>Tu Negocio</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>Admin</p>
                </div>
                <ChevronRight size={14} className={`shrink-0 transition-transform ${isUserMenuOpen ? 'rotate-90' : ''}`} style={{ color: 'var(--sidebar-text)' }} />
              </button>
            ) : (
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-full flex items-center justify-center py-2 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: 'var(--sidebar-active)', color: 'var(--sidebar-active-text)' }}>
                  TN
                </div>
              </button>
            )}
          </div>
        </div>
          </aside>

          {/* Main Content Area Wrapper */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative" style={{ backgroundColor: 'var(--content-bg)' }}>
        
        {/* Global Header (Top Bar) */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-5 lg:px-6 z-30 shrink-0 border-b" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-5">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu size={24} />
            </button>

            {/* Branch Selector + Global Search */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative shrink-0 mr-1" ref={branchDropdownRef}>
              <button 
                onClick={() => isMultiBranch && setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className={`flex items-center gap-2 text-xs bg-white/80 dark:bg-slate-900/40 backdrop-blur px-2 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors ${isMultiBranch ? 'hover:bg-white dark:hover:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer' : 'cursor-default opacity-90'}`}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-slate-700/70">
                  <MapPin size={15} />
                </div>
                <div className="flex flex-col items-start leading-tight min-w-0">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Sucursal
                  </span>
                  <span className="font-black text-slate-900 dark:text-white truncate max-w-[10.5rem]">
                    {currentBranchName}
                  </span>
                </div>
                {isMultiBranch && (
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isBranchDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Custom Dropdown */}
              {isMultiBranch && isBranchDropdownOpen && (
                <>
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-2 animate-zoom-in">
                    <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">Seleccionar sucursal</p>
                    {branches.map(branch => (
                      <button
                        key={branch.id}
                        onClick={() => {
                          setSelectedBranch(branch.id);
                          setIsBranchDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-sm font-bold transition-colors flex items-center justify-between rounded-xl ${
                          selectedBranch === branch.id 
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {branch.name}
                        {selectedBranch === branch.id && <Check size={16} className="text-indigo-700 dark:text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

              <div className="relative flex-[3] min-w-[16rem] sm:min-w-[24rem] lg:min-w-[28rem] w-full max-w-none" ref={searchRef}>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                  <input
                    ref={searchInputRef}
                    value={appSearch}
                    onChange={(e) => {
                      setAppSearch(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    placeholder="Buscar funciones, guías y atajos…"
                    className="w-full bg-white/80 dark:bg-slate-900/40 backdrop-blur border border-slate-200/80 dark:border-slate-800/80 rounded-xl pl-9 pr-10 py-2 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-400 dark:focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 shadow-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg hidden sm:block">
                    /
                  </div>
                </div>

                {isSearchOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="px-3 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span>Atajos</span>
                      <span className="text-[9px]">↑↓ mover · Enter abrir</span>
                    </div>
                    <div className="max-h-80 overflow-auto custom-scrollbar p-2">
                      {filteredSearchItems.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm font-semibold">
                          No hay resultados
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {filteredSearchItems.map((item, index) => (
                            <button
                              key={item.path + item.label}
                              onClick={() => {
                                if (item.path === '#gasto') {
                                  setIsSearchOpen(false);
                                  setAppSearch('');
                                  setIsExpenseModalOpen(true);
                                } else {
                                  navigate(item.path);
                                  setIsSearchOpen(false);
                                  setAppSearch('');
                                }
                              }}
                              onMouseEnter={() => setHighlightedSearchIndex(index)}
                              className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between gap-3 ${
                                highlightedSearchIndex === index
                                  ? 'bg-indigo-50 dark:bg-indigo-500/10'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              <div className="min-w-0 flex items-center gap-2.5">
                                {item.path === '#gasto' && <DollarSign size={16} className="text-red-500 shrink-0" />}
                                <div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{item.label}</p>
                                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{item.description}</p>
                                </div>
                              </div>
                              <ArrowRight size={16} className={`shrink-0 ${highlightedSearchIndex === index ? 'text-indigo-500' : 'text-slate-400'}`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3" />
        </header>

        {/* Inner Content Container - Distinct Background with Border Radius */}
        <div className="flex-1 overflow-hidden relative p-1 sm:p-1.5 pb-1.5">
          <div className={`app-shell-page h-full w-full rounded-2xl border overflow-auto relative custom-scrollbar ${(theme === 'dark' || theme === 'dark-com') ? 'dark-content' : theme === 'mixed' ? 'mixed-content' : ''}`} style={{ backgroundColor: 'var(--content-bg)', borderColor: 'var(--border-color)' }}>
            <Outlet context={{ isMultiBranch, selectedBranch, branches: actualBranches }} />
          </div>
        </div>
          </main>
        </div>
      </div>

      {/* Global Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl border animate-zoom-in" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Registrar Gasto General</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--sidebar-text)' }}>
                <X size={18} />
              </button>
            </div>

            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Este gasto se guardará y podrás verlo desde el panel de inicio.</p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Concepto</label>
                <input type="text" value={expenseConcept} autoFocus
                  onChange={(e) => setExpenseConcept(e.target.value)}
                  placeholder="Ej: Pago de servicios, reposición..."
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Monto $</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--text-secondary)' }}>$</span>
                  <input type="number" value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0" min="0"
                    className="w-full border rounded-lg pl-8 pr-3 py-2.5 text-sm font-bold outline-none transition-colors"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
              </div>
            </div>

            <button onClick={registerGlobalExpense}
              disabled={!expenseConcept.trim() || !expenseAmount || expenseAmount <= 0}
              className="w-full py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--sidebar-active-text)' }}>
              <ArrowDownCircle size={16} />
              Guardar Gasto — ${Number(expenseAmount || 0).toLocaleString()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
