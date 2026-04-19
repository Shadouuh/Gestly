import React, { useState, useEffect } from 'react';
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
  ChevronDown
} from 'lucide-react';
import logo from '../../../assets/images/landing/Gestly.png';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // App Global Context State
  const [isMultiBranch, setIsMultiBranch] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('all');
  
  // Theme handling
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const navigate = useNavigate();
  const location = useLocation();

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

  const branches = [
    { id: 'all', name: 'Todas las sucursales' },
    { id: 'centro', name: 'Sucursal Centro' },
    { id: 'norte', name: 'Sucursal Norte' }
  ];

  const currentBranchName = branches.find(b => b.id === selectedBranch)?.name || 'Sucursal';

  const handleLogout = () => {
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
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
          flex flex-col bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800/50
          transition-all duration-300 ease-in-out shadow-xl md:shadow-none
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/50 relative shrink-0">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <img src={logo} alt="Gestly" className="w-8 h-8 object-contain shrink-0" />
            <span className={`font-display font-bold text-xl transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
              Gestly
            </span>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>

          {/* Toggle Sidebar Button (Desktop) */}
          <button 
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              setIsUserMenuOpen(false);
            }}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm z-50 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* Sidebar Navigation (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/app'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 font-bold dark:bg-white dark:text-slate-900 dark:shadow-white/10' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white font-medium'
                    }
                  `}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <Icon size={18} className="shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-sm whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer (User Profile) */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/50 shrink-0">
          <div className="relative">
            {/* User Popover Menu */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2 z-50">
                <div className="px-3 py-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">Tu Negocio</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Plan Pro</p>
                </div>
                
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`
                w-full flex items-center gap-3 p-2 rounded-xl transition-colors
                ${isUserMenuOpen 
                  ? 'bg-slate-100 dark:bg-slate-800' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }
              `}
            >
              <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                TN
              </div>
              <div className={`flex-1 text-left whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                <p className="text-sm font-bold truncate text-slate-900 dark:text-white">
                  Tu Negocio
                </p>
                <p className="text-xs truncate text-slate-500 dark:text-slate-400">
                  Admin
                </p>
              </div>
              {isSidebarOpen && (
                <ChevronRight size={14} className={`shrink-0 transition-transform ${isUserMenuOpen ? 'rotate-90' : ''} text-slate-400`} />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area Wrapper */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-white dark:bg-slate-950">
        
        {/* Global Header (Top Bar) - Matches Sidebar Background */}
        <header className="h-16 bg-white dark:bg-slate-950 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu size={24} />
            </button>

            {/* Branch Selector Custom Component */}
            <div className="relative">
              <button 
                onClick={() => isMultiBranch && setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className={`flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 transition-colors ${isMultiBranch ? 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer' : 'cursor-default'}`}
              >
                <div className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin size={14} />
                </div>
                <span className="font-bold text-slate-900 dark:text-white px-1">
                  {isMultiBranch ? currentBranchName : 'Sucursal Única'}
                </span>
                {isMultiBranch && (
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isBranchDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Custom Dropdown */}
              {isMultiBranch && isBranchDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsBranchDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-2 animate-zoom-in">
                    <p className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Seleccionar Sucursal</p>
                    {branches.map(branch => (
                      <button
                        key={branch.id}
                        onClick={() => {
                          setSelectedBranch(branch.id);
                          setIsBranchDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${
                          selectedBranch === branch.id 
                            ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:text-white'
                        }`}
                      >
                        {branch.name}
                        {selectedBranch === branch.id && <Check size={16} className="text-slate-900 dark:text-white" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Multi-branch Toggle (Demo purpose) */}
            <button 
              onClick={() => {
                setIsMultiBranch(!isMultiBranch);
                if (isMultiBranch) setSelectedBranch('all');
              }}
              className={`hidden sm:flex text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                isMultiBranch 
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800'
              }`}
              title="Alternar vista de múltiples sucursales"
            >
              Multi-Sucursal: {isMultiBranch ? 'ON' : 'OFF'}
            </button>
          </div>
        </header>

        {/* Inner Content Container - Distinct Background with Border Radius */}
        <div className="flex-1 overflow-hidden relative p-1 sm:p-2 pb-2">
          <div className="h-full w-full bg-slate-50/80 dark:bg-[#0B1120] rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] overflow-auto relative custom-scrollbar">
            <Outlet context={{ isMultiBranch, selectedBranch }} />
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default AppLayout;