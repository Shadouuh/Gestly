import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react';
import logo from '../../../assets/images/landing/Gestly.png';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Mobile toggle
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: Package, label: 'Catálogo Maestro' },
    { path: '/admin/users', icon: Users, label: 'Usuarios' },
    { path: '/admin/settings', icon: Settings, label: 'Configuración' },
  ];

  const handleLogout = () => {
    // Logic for logout
    navigate('/login');
  };

  return (
    <div className="h-screen bg-slate-50 flex font-sans overflow-hidden">
      {/* Sidebar Desktop & Mobile */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-[#0F172A] text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800 flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:relative lg:translate-x-0
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Header */}
        <div className={`h-16 flex-shrink-0 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-5'} border-b border-white/5`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3 animate-fadeIn">
              <img src={logo} alt="G" className="w-6 h-6 object-contain" />
              <span className="font-display font-bold text-base tracking-tight text-white">Gestly <span className="text-slate-500 font-medium">Admin</span></span>
            </div>
          ) : (
            <img src={logo} alt="G" className="w-6 h-6 object-contain" />
          )}
          
          {/* Collapse Button (Desktop Only) */}
          <button 
            onClick={toggleSidebar}
            className={`hidden lg:flex w-6 h-6 rounded-md hover:bg-white/5 items-center justify-center text-slate-500 hover:text-slate-300 transition-all ${isCollapsed ? 'absolute -right-3 top-5 bg-slate-900 border border-slate-700 shadow-sm' : ''}`}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              title={isCollapsed ? item.label : ''}
              className={({ isActive }) => `
                group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative
                ${isActive 
                  ? 'bg-white/10 text-white font-medium' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              {({ isActive }) => (
                <div className={`relative transition-transform duration-200 ${isCollapsed ? 'group-hover:scale-110' : ''}`}>
                  <item.icon size={20} strokeWidth={1.5} />
                  {/* Active Indicator Dot */}
                  {isActive && isCollapsed && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-900"></span>
                  )}
                </div>
              )}
              
              {!isCollapsed && (
                <span className="text-sm tracking-tight">{item.label}</span>
              )}

              {/* Tooltip for Collapsed State */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700/50">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Footer */}
        <div className="p-4 border-t border-slate-800/50 flex-shrink-0">
          <div className={`relative bg-slate-800/30 rounded-2xl p-1 transition-all ${showUserMenu ? 'bg-slate-800' : ''}`}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner border border-slate-700">
                AD
              </div>
              {!isCollapsed && (
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">Admin User</p>
                  <p className="text-[10px] text-slate-400 truncate">admin@gestly.com</p>
                </div>
              )}
              {!isCollapsed && (
                <MoreVertical size={14} className="text-slate-500" />
              )}
            </button>

            {/* Popover Menu */}
            {showUserMenu && (
              <div className={`absolute bottom-full left-0 w-full mb-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-1 animate-fadeIn ${isCollapsed ? 'w-56 left-14' : ''} z-50`}>
                
                {/* User Info Header in Popover (Only visible if collapsed sidebar, or just good to have) */}
                {isCollapsed && (
                  <div className="px-3 py-2 border-b border-slate-700 mb-1">
                    <p className="text-xs font-bold text-white">Admin User</p>
                    <p className="text-[10px] text-slate-400">admin@gestly.com</p>
                  </div>
                )}

                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-xs font-medium"
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                </button>
                
                <div className="h-px bg-slate-700 my-1 mx-2"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-xs font-medium"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50 relative">
        {/* Top Header Mobile */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 lg:hidden p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
               <img src={logo} alt="G" className="w-5 h-5 object-contain brightness-0 invert" />
            </div>
            <span className="font-bold text-slate-900 text-lg">Gestly Admin</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;