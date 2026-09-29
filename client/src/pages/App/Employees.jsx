import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DollarSign, Loader2, Mail, Phone, Plus, Search, Shield, Store, UserCircle, Users, X } from 'lucide-react';
import {
  createAppEmployee,
  getAppEmployees,
  getBusinessBranches,
  getCurrentBusiness,
} from '../../services/api';
import { useNotification } from '../../shared/components/Notification/NotificationContext';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrador', description: 'Acceso total al negocio' },
  { value: 'MANAGER', label: 'Encargado', description: 'Control de operación diaria' },
  { value: 'SELLER', label: 'Vendedor', description: 'Ventas y atención' },
  { value: 'CASHIER', label: 'Cajero', description: 'Caja y cobros' },
  { value: 'STOCKER', label: 'Repositor', description: 'Inventario y stock' },
];

const currency = (value) => `$${Number(value || 0).toLocaleString()}`;

const Employees = () => {
  const notify = useNotification();
  const { selectedBranch } = useOutletContext();
  const business = getCurrentBusiness();

  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'SELLER',
    branchIds: [],
    baseSalary: '',
    commission: '',
    hoursPerWeek: '40',
    schedule: 'Lunes a Viernes 09:00 - 17:00',
  });

  const loadData = useCallback(async () => {
    if (!business?.id) {
      setEmployees([]);
      setBranches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [employeeRows, branchRows] = await Promise.all([
        getAppEmployees({ businessId: business.id }),
        getBusinessBranches(business.id),
      ]);
      setEmployees(Array.isArray(employeeRows) ? employeeRows : []);
      setBranches(Array.isArray(branchRows) ? branchRows : []);
    } catch (error) {
      notify.error(error.response?.data?.message || 'No se pudieron cargar los empleados');
    } finally {
      setLoading(false);
    }
  }, [business?.id, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (branches.length === 0) return;
    setNewEmployee((prev) => {
      if (prev.branchIds.length > 0) return prev;
      return { ...prev, branchIds: [String(branches[0].id)] };
    });
  }, [branches]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        employee.name?.toLowerCase().includes(term) ||
        employee.email?.toLowerCase().includes(term);
      const matchesBranch =
        selectedBranch === 'all' ||
        (employee.branchIds || []).includes(String(selectedBranch));

      return matchesSearch && matchesBranch;
    });
  }, [employees, searchTerm, selectedBranch]);

  const totalSales = filteredEmployees.reduce((sum, employee) => sum + Number(employee.sales || 0), 0);
  const totalLaborCost = filteredEmployees.reduce((sum, employee) => {
    const baseSalary = Number(employee.baseSalary || 0);
    const commissionAmount = Number(employee.sales || 0) * (Number(employee.commission || 0) / 100);
    return sum + baseSalary + commissionAmount;
  }, 0);

  const handleToggleBranch = (branchId) => {
    setNewEmployee((prev) => {
      const exists = prev.branchIds.includes(String(branchId));
      const nextBranchIds = exists
        ? prev.branchIds.filter((id) => id !== String(branchId))
        : [...prev.branchIds, String(branchId)];

      return {
        ...prev,
        branchIds: nextBranchIds.length > 0 ? nextBranchIds : [String(branchId)],
      };
    });
  };

  const handleCreateEmployee = async () => {
    if (!business?.id || !newEmployee.name.trim() || !newEmployee.email.trim() || !newEmployee.password.trim()) {
      notify.warning('Completa nombre, email y contraseña para crear el usuario real');
      return;
    }

    setSaving(true);
    try {
      const created = await createAppEmployee({
        businessId: business.id,
        name: newEmployee.name.trim(),
        email: newEmployee.email.trim(),
        password: newEmployee.password,
        phone: newEmployee.phone.trim(),
        role: newEmployee.role,
        branchIds: newEmployee.branchIds.map(Number),
        baseSalary: Number(newEmployee.baseSalary || 0),
        commission: Number(newEmployee.commission || 0),
        hoursPerWeek: Number(newEmployee.hoursPerWeek || 40),
        schedule: newEmployee.schedule.trim(),
      });

      setEmployees((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'SELLER',
        branchIds: branches[0] ? [String(branches[0].id)] : [],
        baseSalary: '',
        commission: '',
        hoursPerWeek: '40',
        schedule: 'Lunes a Viernes 09:00 - 17:00',
      });
      notify.success('Empleado creado con usuario real y acceso habilitado');
    } catch (error) {
      notify.error(error.response?.data?.message || 'No se pudo crear el empleado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-5 min-h-full flex flex-col w-full max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="app-page-title">Equipo y Personal</h1>
          <p className="app-page-subtitle mt-0.5">
            Gestiona empleados reales con acceso al sistema y asignación por sucursal.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Añadir Empleado
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-5 rounded-3xl shadow-xl shadow-indigo-900/20 relative overflow-hidden text-white border border-indigo-500/30">
          <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Plantilla</p>
          <p className="text-3xl font-display font-black tracking-tight mt-3">{filteredEmployees.length}</p>
          <p className="text-xs text-indigo-200 font-medium mt-1">{filteredEmployees.filter((employee) => employee.active).length} activos</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-5 rounded-3xl shadow-xl shadow-emerald-900/20 relative overflow-hidden text-white border border-emerald-500/30">
          <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Ventas del equipo</p>
          <p className="text-3xl font-display font-black tracking-tight mt-3">{currency(totalSales)}</p>
          <p className="text-xs text-emerald-200 font-medium mt-1">según ventas registradas</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden text-white border border-slate-700">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Costo laboral</p>
          <p className="text-3xl font-display font-black tracking-tight mt-3">{currency(totalLaborCost)}</p>
          <p className="text-xs text-slate-400 font-medium mt-1">salario base + comisión estimada</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col flex-1">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-3xl">
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">Usuarios del equipo</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {selectedBranch === 'all' ? 'Vista global' : `Filtrado por sucursal ${selectedBranch}`}
            </p>
          </div>
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar empleado por nombre o email..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-slate-900 dark:focus:border-slate-400 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-950/50 rounded-b-3xl">
          {loading ? (
            <div className="min-h-[260px] flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              Cargando empleados reales...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500">
              <UserCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium text-lg">No se encontraron empleados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                      {(employee.name || '?').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-lg text-slate-900 dark:text-white truncate">{employee.name}</h3>
                        {employee.isOwner && (
                          <span className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-200 dark:border-amber-500/20">
                            Dueño
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{employee.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Mail size={12} className="text-slate-400" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Phone size={12} className="text-slate-400" />
                      <span>{employee.phone || 'Sin teléfono'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Store size={12} className="text-slate-400" />
                      <span className="truncate">
                        {employee.branches?.length > 0
                          ? employee.branches.map((branch) => branch.name).join(', ')
                          : 'Sin sucursales'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Ventas</p>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">{currency(employee.sales)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Sueldo base</p>
                      <p className="text-base font-black text-slate-900 dark:text-white mt-1">{currency(employee.baseSalary)}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <Shield size={12} />
                      {employee.active ? 'Acceso activo' : 'Acceso inactivo'}
                    </div>
                    <div className={`px-3 py-1 rounded-xl text-[10px] font-bold border ${employee.active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                      {employee.active ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Añadir Empleado</h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Se creará un usuario real que podrá iniciar sesión.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(event) => setNewEmployee((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Email</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(event) => setNewEmployee((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="empleado@negocio.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Contraseña inicial</label>
                  <input
                    type="text"
                    value={newEmployee.password}
                    onChange={(event) => setNewEmployee((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(event) => setNewEmployee((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="+54 11 1234-5678"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Rol</label>
                  <select
                    value={newEmployee.role}
                    onChange={(event) => setNewEmployee((prev) => ({ ...prev, role: event.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 dark:text-white"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Sucursales asignadas</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {branches.map((branch) => {
                      const assigned = newEmployee.branchIds.includes(String(branch.id));
                      return (
                        <button
                          key={branch.id}
                          type="button"
                          onClick={() => handleToggleBranch(branch.id)}
                          className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                            assigned
                              ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="font-bold text-sm truncate">{branch.name}</span>
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black ${assigned ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-300'}`}>
                            {assigned ? 'OK' : '+'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Salario Base</label>
                  <input
                    type="number"
                    value={newEmployee.baseSalary}
                    onChange={(event) => setNewEmployee((prev) => ({ ...prev, baseSalary: event.target.value }))}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Comisión (%)</label>
                  <input
                    type="number"
                    value={newEmployee.commission}
                    onChange={(event) => setNewEmployee((prev) => ({ ...prev, commission: event.target.value }))}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Horas por semana</label>
                  <input
                    type="number"
                    value={newEmployee.hoursPerWeek}
                    onChange={(event) => setNewEmployee((prev) => ({ ...prev, hoursPerWeek: event.target.value }))}
                    placeholder="40"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Horario</label>
                  <input
                    type="text"
                    value={newEmployee.schedule}
                    onChange={(event) => setNewEmployee((prev) => ({ ...prev, schedule: event.target.value }))}
                    placeholder="Lunes a Viernes 09:00 - 17:00"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateEmployee}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Crear usuario y empleado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
