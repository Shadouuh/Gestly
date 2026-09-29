import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  ShieldCheck,
  Store,
  Building2,
  DollarSign,
  Percent
} from 'lucide-react';
import logo from '../../../assets/images/landing/Gestly.png';
import { DataStatusPanel } from '../../../shared/components/DataStatus';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/businesses', icon: Building2, label: 'Negocios' },
    { path: '/admin/accounting', icon: DollarSign, label: 'Contabilidad' },
    { path: '/admin/affiliates', icon: Percent, label: 'Vendedores' },
    { path: '/admin/users', icon: Users, label: 'Usuarios' },
    { path: '/admin/settings', icon: Settings, label: 'Configuración' },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="h-full w-full overflow-hidden md:w-[111.111%] md:h-[111.111%] md:scale-[0.9] md:origin-top-left">
        <div className="flex h-full overflow-hidden text-slate-900 dark:text-slate-100">
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
              ${isSidebarOpen ? 'w-56' : 'w-[4.25rem]'}
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
          >
            {/* Sidebar Header */}
            <div className="h-14 flex items-center justify-between px-3 border-b border-slate-100 dark:border-slate-800/50 relative shrink-0">
              <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                <img src={logo} alt="Gestly" className="w-8 h-8 object-contain shrink-0" />
                <span className={`font-display font-bold text-lg transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                  Gestly <span className="text-slate-400 font-medium">Admin</span>
                </span>
              </div>
              
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>

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

            {/* Sidebar Navigation */}
            <div className="flex-1 overflow-y-auto py-3 px-2 custom-scrollbar">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 group
                        ${isActive 
                          ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 font-bold dark:bg-white dark:text-slate-900 dark:shadow-white/10' 
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white font-medium'
                        }
                      `}
                      title={!isSidebarOpen ? item.label : undefined}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span className={`text-xs whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                        {item.label}
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800/50 shrink-0">
              <div className="relative">
                {isUserMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2 z-50">
                    <div className="px-3 py-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">Admin</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">admin@gestly.com</p>
                    </div>
                    
                    <button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
                      {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-1"
                    >
                      <LogOut size={15} />
                      Cerrar Sesión
                    </button>
                  </div>
                )}

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
                  <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    AD
                  </div>
                  <div className={`flex-1 text-left whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                    <p className="text-sm font-bold truncate text-slate-900 dark:text-white">
                      Admin
                    </p>
                    <p className="text-xs truncate text-slate-500 dark:text-slate-400">
                      admin@gestly.com
                    </p>
                  </div>
                  {isSidebarOpen && (
                    <ChevronRight size={14} className={`shrink-0 transition-transform ${isUserMenuOpen ? 'rotate-90' : ''} text-slate-400`} />
                  )}
                </button>
              </div>
              {isSidebarOpen && (
                <div className="px-3 pb-3">
                  <DataStatusPanel pathname={location.pathname} />
                </div>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-white dark:bg-slate-950">
            
            {/* Top Header */}
            <header className="h-14 bg-white dark:bg-slate-950 flex items-center justify-between px-4 sm:px-5 lg:px-6 z-30 shrink-0 border-b border-slate-100/80 dark:border-slate-900">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Menu size={24} />
                </button>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:block">
                  Panel de Administración
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Admin</span>
                </div>
              </div>
            </header>

            {/* Inner Content */}
            <div className="flex-1 overflow-hidden relative p-1 sm:p-1.5 pb-1.5">
              <div className="app-shell-page h-full w-full bg-slate-50/80 dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[inset_0_0_16px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_0_16px_rgba(0,0,0,0.2)] overflow-auto relative custom-scrollbar">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
