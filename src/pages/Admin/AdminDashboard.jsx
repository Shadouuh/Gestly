import React from 'react';
import { 
  Users, 
  Package, 
  Store, 
  TrendingUp, 
  Activity,
  AlertCircle
} from 'lucide-react';

const StatCard = ({ title, value, trend, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          <TrendingUp size={14} />
          {trend}%
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
    <div className="text-3xl font-display font-bold text-slate-900">{value}</div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Panel de Control</h1>
        <p className="text-slate-500">Bienvenido al centro de administración de Gestly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Usuarios Totales" 
          value="1,234" 
          trend={12} 
          icon={Users} 
          color={{ bg: 'bg-blue-50', text: 'text-blue-600' }} 
        />
        <StatCard 
          title="Plantillas Activas" 
          value="45" 
          trend={5} 
          icon={Package} 
          color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }} 
        />
        <StatCard 
          title="Rubros" 
          value="15" 
          icon={Store} 
          color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} 
        />
        <StatCard 
          title="Reportes" 
          value="8" 
          trend={-2} 
          icon={AlertCircle} 
          color={{ bg: 'bg-orange-50', text: 'text-orange-600' }} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-indigo-500" />
            Estado del Sistema
          </h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">Base de Datos Operativa</h4>
                <p className="text-xs text-slate-500">Sin incidentes reportados en las últimas 24hs</p>
              </div>
              <span className="text-green-600 text-xs font-bold bg-green-100 px-3 py-1 rounded-full">Online</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">API Gateway</h4>
                <p className="text-xs text-slate-500">Latencia promedio: 45ms</p>
              </div>
              <span className="text-green-600 text-xs font-bold bg-green-100 px-3 py-1 rounded-full">Online</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl">
          <h3 className="text-xl font-bold mb-4">¿Qué puedes hacer aquí?</h3>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Este panel está diseñado para que los desarrolladores y administradores gestionen las configuraciones globales de la plataforma.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Package size={16} />
              </div>
              <span className="font-medium text-sm">Gestionar plantillas de productos por rubro</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Users size={16} />
              </div>
              <span className="font-medium text-sm">Administrar usuarios y permisos</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Store size={16} />
              </div>
              <span className="font-medium text-sm">Configurar nuevos tipos de negocio</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;