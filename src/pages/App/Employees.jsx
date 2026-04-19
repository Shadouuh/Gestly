import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserCircle, Plus, Search, Mail, Phone, Store, MapPin, MoreVertical, ArrowLeft, Calendar, DollarSign, Clock, Briefcase, Activity, Target, Check, Users, Shield, Award, Lock, Eye, X } from 'lucide-react';

const Employees = () => {
  const { selectedBranch } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dateRange, setDateRange] = useState('Este Mes');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // list, branches

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    roles: ['Vendedor'],
    branches: ['centro'],
    phone: '',
    email: '',
    password: '',
    baseSalary: '',
    commission: '',
    hoursPerWeek: 40,
    schedule: 'Lunes a Viernes 09:00 - 17:00'
  });
  
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Martín López', roles: ['Vendedor'], branches: ['centro'], phone: '+54 11 1111-2222', email: 'martin@email.com', password: 'password123', sales: 318500, active: true, baseSalary: 120000, commission: 2, hoursPerWeek: 40, schedule: 'Lunes a Viernes 09:00 - 17:00' },
    { id: 2, name: 'Laura García', roles: ['Encargado', 'Repositor'], branches: ['centro'], phone: '+54 11 3333-4444', email: 'laura@email.com', password: 'password123', sales: 285200, active: true, baseSalary: 150000, commission: 1.5, hoursPerWeek: 45, schedule: 'Lunes a Sábado 09:00 - 16:30' },
    { id: 3, name: 'Juan Silva', roles: ['Vendedor'], branches: ['norte'], phone: '+54 11 5555-6666', email: 'juan@email.com', password: 'password123', sales: 197500, active: true, baseSalary: 120000, commission: 2, hoursPerWeek: 30, schedule: 'Martes a Sábado 10:00 - 16:00' },
    { id: 4, name: 'Ana Paz', roles: ['Vendedor'], branches: ['norte'], phone: '+54 11 7777-8888', email: 'ana@email.com', password: 'password123', sales: 8700, active: false, baseSalary: 120000, commission: 2, hoursPerWeek: 20, schedule: 'Fines de semana' },
    { id: 5, name: 'Carlos Ruiz', roles: ['Administrador'], branches: ['centro', 'norte'], phone: '+54 11 9999-0000', email: 'carlos@email.com', password: 'password123', sales: 0, active: true, baseSalary: 250000, commission: 0, hoursPerWeek: 40, schedule: 'Lunes a Viernes 09:00 - 17:00', isOwner: true },
  ]);

  const availableRoles = [
    { id: 'Administrador', label: 'Administrador', desc: 'Acceso total al sistema' },
    { id: 'Vendedor', label: 'Vendedor', desc: 'Punto de venta y caja' },
    { id: 'Repositor', label: 'Repositor', desc: 'Catálogo e inventario' },
    { id: 'Estadísticas', label: 'Estadísticas', desc: 'Ver dashboard y reportes' },
  ];

  const availableBranches = [
    { id: 'centro', name: 'Sucursal Centro' },
    { id: 'norte', name: 'Sucursal Norte' }
  ];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'all' || emp.branches.includes(selectedBranch) || emp.branches.includes('all');
    return matchesSearch && matchesBranch;
  });

  const handleUpdateEmployee = (id, field, value) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== id) return emp;
      
      const updatedEmp = { ...emp, [field]: value };
      
      // Enforce Admin rule: If they are admin, they must have access to all branches
      if (field === 'roles' && value.includes('Administrador')) {
        updatedEmp.branches = availableBranches.map(b => b.id);
      }
      
      return updatedEmp;
    }));
  };

  if (selectedEmployee) {
    const emp = employees.find(e => e.id === selectedEmployee);
    if (!emp) return null;

    const isMonth = dateRange === 'Este Mes';
    const activeSales = isMonth ? emp.sales : Math.round(emp.sales / 30);
    const avgPerDay = Math.round(emp.sales / 22); // Assuming 22 working days
    const avgPerHour = Math.round(avgPerDay / (emp.hoursPerWeek / 5));
    const estimatedCommision = Math.round(emp.sales * (emp.commission / 100));
    const totalSalary = emp.baseSalary + estimatedCommision;
    const netProfit = emp.sales - totalSalary;

    return (
      <div className="p-6 flex flex-col max-w-7xl mx-auto w-full animate-fadeIn">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
            <button 
              onClick={() => { setSelectedEmployee(null); setIsPaid(false); }}
              className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm shrink-0"
            >
              <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-inner shrink-0">
                {emp.name.substring(0, 2)}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white flex items-center gap-3">
                  {emp.name}
                  <span className={`text-[10px] uppercase tracking-wider font-black px-3 py-1 rounded-lg shrink-0 ${emp.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {emp.active ? 'Activo' : 'Inactivo'}
                  </span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1 flex flex-wrap items-center gap-2">
                  <Briefcase size={14}/> {emp.roles.join(', ')}
                </p>
              </div>
            </div>
          </div>
          
          {emp.isOwner && (
            <div className="relative z-10 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-2 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
              <Shield size={16} /> Dueño del Negocio
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Info & Settings */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Roles & Security */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield size={18} className="text-indigo-500" /> Accesos y Seguridad
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Roles Asignados</label>
                  <div className="space-y-2">
                    {availableRoles.map(role => {
                      const isAssigned = emp.roles.includes(role.id);
                      const disabled = emp.isOwner; // Cannot change owner roles
                      
                      return (
                        <div 
                          key={role.id}
                          onClick={() => {
                            if (disabled) return;
                            let newRoles;
                            if (isAssigned) {
                              newRoles = emp.roles.filter(r => r !== role.id);
                              if (newRoles.length === 0) newRoles = ['Vendedor']; // Always at least one
                            } else {
                              newRoles = [...emp.roles, role.id];
                            }
                            handleUpdateEmployee(emp.id, 'roles', newRoles);
                          }}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${isAssigned ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${isAssigned ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                            {isAssigned && <Check size={12} />}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${isAssigned ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{role.label}</p>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{role.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Sucursales Asignadas</label>
                  {emp.roles.includes('Administrador') ? (
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-3 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center gap-2">
                      <Store size={16} /> Todas las sucursales (Admin)
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableBranches.map(branch => {
                        const isAssigned = emp.branches.includes(branch.id);
                        return (
                          <div 
                            key={branch.id}
                            onClick={() => {
                              let newBranches;
                              if (isAssigned) {
                                newBranches = emp.branches.filter(b => b !== branch.id);
                                if (newBranches.length === 0) newBranches = [availableBranches[0].id];
                              } else {
                                newBranches = [...emp.branches, branch.id];
                              }
                              handleUpdateEmployee(emp.id, 'branches', newBranches);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isAssigned ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${isAssigned ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                              {isAssigned && <Check size={12} />}
                            </div>
                            <p className={`text-sm font-bold ${isAssigned ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{branch.name}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Correo Electrónico (Acceso)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="email" 
                        value={emp.email}
                        onChange={(e) => handleUpdateEmployee(emp.id, 'email', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm font-medium outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={emp.password}
                        onChange={(e) => handleUpdateEmployee(emp.id, 'password', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm font-medium outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors dark:text-white"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Contact & Schedule */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Datos Personales</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      value={emp.phone}
                      onChange={(e) => handleUpdateEmployee(emp.id, 'phone', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Horario Predefinido</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      value={emp.schedule}
                      onChange={(e) => handleUpdateEmployee(emp.id, 'schedule', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Salario Base</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="number" 
                        value={emp.baseSalary}
                        onChange={(e) => handleUpdateEmployee(emp.id, 'baseSalary', Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm font-bold outline-none focus:border-indigo-500 transition-colors dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Comisión (%)</label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="number" 
                        value={emp.commission}
                        onChange={(e) => handleUpdateEmployee(emp.id, 'commission', Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm font-bold outline-none focus:border-indigo-500 transition-colors dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Analytics */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={20} className="text-blue-500" />
                Rendimiento de Ventas
              </h2>
              <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Calendar size={14} />
                  {dateRange}
                </button>
                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 py-1">
                    <button onClick={() => { setDateRange('Hoy'); setIsFilterOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors">Hoy</button>
                    <button onClick={() => { setDateRange('Esta Semana'); setIsFilterOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors">Esta Semana</button>
                    <button onClick={() => { setDateRange('Este Mes'); setIsFilterOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors">Este Mes</button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Facturado ({dateRange})</p>
                <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">${activeSales.toLocaleString()}</p>
                <div className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 inline-block px-2 py-0.5 rounded-md">
                  +12% vs anterior
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Promedio por Día</p>
                <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">${avgPerDay.toLocaleString()}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Promedio por Hora</p>
                <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">${avgPerHour.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl shadow-xl p-6 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-150"></div>
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
                <Briefcase size={20} className="text-indigo-400" />
                Cálculo de Sueldo ({dateRange})
              </h3>
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-sm font-medium text-slate-400">Ventas Generadas</span>
                  <span className="font-bold text-emerald-400">${emp.sales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-sm font-medium text-slate-400">Salario Base</span>
                  <span className="font-bold">${emp.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-sm font-medium text-slate-400">Comisiones ({emp.commission}%)</span>
                  <span className="font-bold text-emerald-400">+ ${estimatedCommision.toLocaleString()}</span>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total a Pagar</span>
                    <span className="text-4xl font-display font-black text-white">${totalSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold bg-indigo-950/50 border border-indigo-500/30 p-3 rounded-xl mt-4">
                    <span className="text-indigo-300">Beneficio Neto para el Local:</span>
                    <span className="text-indigo-400 text-sm">${netProfit.toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsPaid(true)}
                  disabled={isPaid}
                  className={`w-full mt-4 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isPaid 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:shadow-indigo-500/40 active:scale-95'
                  }`}
                >
                  {isPaid ? <><Check size={18} /> Sueldo Pagado y Registrado</> : <><DollarSign size={18} /> Pagar Sueldo (Generar Egreso)</>}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-full flex flex-col max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Equipo y Personal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gestiona tus empleados {selectedBranch !== 'all' ? `en Sucursal ${selectedBranch === 'centro' ? 'Centro' : 'Norte'}` : 'globalmente'}
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Añadir Empleado
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-5 rounded-3xl shadow-xl shadow-indigo-900/20 relative overflow-hidden text-white border border-indigo-500/30 group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Plantilla</p>
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-black tracking-tight mb-1">{employees.length}</p>
              <p className="text-xs text-indigo-200 font-medium">{employees.filter(e => e.active).length} Activos</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-5 rounded-3xl shadow-xl shadow-emerald-900/20 relative overflow-hidden text-white border border-emerald-500/30 group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Ventas de Equipo</p>
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Award size={16} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-black tracking-tight mb-1">${employees.reduce((sum, e) => sum + e.sales, 0).toLocaleString()}</p>
              <p className="text-xs text-emerald-200 font-medium">Este mes</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden text-white border border-slate-700 group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Costo Laboral</p>
              <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Shield size={16} className="text-slate-300"/>
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-black tracking-tight mb-1 text-slate-300">${employees.reduce((sum, e) => sum + e.baseSalary + (e.sales * (e.commission/100)), 0).toLocaleString()}</p>
              <p className="text-xs text-slate-400 font-medium">Proyección salarial</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col flex-1">
        
        {/* Toolbar & Tabs */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-3xl">
          <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('list')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Lista de Personal
            </button>
            <button 
              onClick={() => setActiveTab('branches')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'branches' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Sucursales
            </button>
          </div>

          {activeTab === 'list' && (
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-colors dark:text-white"
              />
            </div>
          )}
        </div>

        {/* List Content */}
        {activeTab === 'list' && (
          <div className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-950/50 rounded-b-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map(emp => (
                <div 
                  key={emp.id} 
                  onClick={() => setSelectedEmployee(emp.id)}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 relative group cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="absolute top-4 right-4">
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                      {emp.name.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white">{emp.name}</h3>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{emp.roles.join(', ')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-5 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Contacto</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Phone size={10}/> {emp.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sucursal</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 capitalize"><Store size={10}/> {emp.branches.join(', ')}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                    <div className="w-1/2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Target size={10}/> Ventas Mes</p>
                      <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">${emp.sales.toLocaleString()}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-xl text-[10px] font-bold border ${emp.active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                      {emp.active ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500">
                <UserCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-medium text-lg">No se encontraron empleados</p>
              </div>
            )}
          </div>
        )}

        {/* Branches Content (Kanban) */}
        {activeTab === 'branches' && (
          <div className="flex-1 p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50 rounded-b-3xl flex flex-col md:flex-row gap-6 overflow-x-auto">
            {availableBranches.map(branch => {
              const branchEmployees = employees.filter(e => e.branches.includes(branch.id) || e.branches.includes('all'));
              
              return (
                <div key={branch.id} className="flex-1 min-w-[300px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-3xl">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <Store size={18} className="text-indigo-500" />
                      {branch.name}
                    </h3>
                    <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-lg text-xs font-black">
                      {branchEmployees.length}
                    </span>
                  </div>
                  
                  <div className="p-4 flex-1 space-y-3">
                    {branchEmployees.map(emp => (
                      <div 
                        key={`${branch.id}-${emp.id}`}
                        onClick={() => setSelectedEmployee(emp.id)}
                        className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all shadow-sm group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                            {emp.name.substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{emp.name}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate mt-0.5">{emp.roles.join(', ')}</p>
                          </div>
                          {emp.isOwner && (
                            <Shield size={14} className="text-amber-500 shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                    {branchEmployees.length === 0 && (
                      <div className="text-center py-8 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        <Store size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-bold">Sin personal asignado</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <UserCircle size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Añadir Empleado</h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Ingresa los datos y condiciones laborales</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Nombre Completo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Juan Pérez"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all dark:text-white"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Roles Asignados</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableRoles.map(role => {
                        const isAssigned = newEmployee.roles.includes(role.id);
                        return (
                          <div 
                            key={role.id}
                            onClick={() => {
                              let newRoles;
                              if (isAssigned) {
                                newRoles = newEmployee.roles.filter(r => r !== role.id);
                                if (newRoles.length === 0) newRoles = ['Vendedor'];
                              } else {
                                newRoles = [...newEmployee.roles, role.id];
                              }
                              // Enforce Admin rule
                              if (newRoles.includes('Administrador')) {
                                setNewEmployee({...newEmployee, roles: newRoles, branches: availableBranches.map(b => b.id)});
                              } else {
                                setNewEmployee({...newEmployee, roles: newRoles});
                              }
                            }}
                            className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${isAssigned ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${isAssigned ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                              {isAssigned && <Check size={10} />}
                            </div>
                            <span className="text-xs font-bold">{role.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Sucursales</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableBranches.map(branch => {
                        const isAdmin = newEmployee.roles.includes('Administrador');
                        const isAssigned = isAdmin || newEmployee.branches.includes(branch.id);
                        return (
                          <div 
                            key={branch.id}
                            onClick={() => {
                              if (isAdmin) return;
                              let newBranches;
                              if (isAssigned) {
                                newBranches = newEmployee.branches.filter(b => b !== branch.id);
                                if (newBranches.length === 0) newBranches = [availableBranches[0].id];
                              } else {
                                newBranches = [...newEmployee.branches, branch.id];
                              }
                              setNewEmployee({...newEmployee, branches: newBranches});
                            }}
                            className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${isAdmin ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'} ${isAssigned ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${isAssigned ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                              {isAssigned && <Check size={10} />}
                            </div>
                            <span className="text-xs font-bold truncate">{branch.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Teléfono</label>
                  <input 
                    type="tel" 
                    placeholder="Ej. +54 11 1234-5678"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Email</label>
                  <input 
                    type="email" 
                    placeholder="Ej. empleado@email.com"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Horario Predefinido</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Lunes a Viernes 09:00 - 17:00"
                    value={newEmployee.schedule}
                    onChange={(e) => setNewEmployee({...newEmployee, schedule: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Salario Base Mensual</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={newEmployee.baseSalary}
                      onChange={(e) => setNewEmployee({...newEmployee, baseSalary: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm font-black outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Comisión por Venta (%)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={newEmployee.commission}
                      onChange={(e) => setNewEmployee({...newEmployee, commission: e.target.value})}
                      className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl pl-8 pr-4 py-3 text-sm font-black text-emerald-700 dark:text-emerald-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all"
                    />
                  </div>
                </div>
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
                  console.log("Saving...", newEmployee);
                  setIsAddModalOpen(false);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
              >
                Añadir Empleado
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Employees;