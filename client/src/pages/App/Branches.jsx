import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowUpRight, Loader2, MapPin, Package, Plus, Store, Users, X } from 'lucide-react';
import {
  createBranch,
  getAppEmployees,
  getBusinessBranches,
  getCurrentBusiness,
  updateAppEmployee,
} from '../../services/api';
import { useNotification } from '../../shared/components/Notification/NotificationContext';

const currency = (value) => `$${Number(value || 0).toLocaleString()}`;

const Branches = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const { selectedBranch } = useOutletContext();
  const business = getCurrentBusiness();

  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingBranch, setSavingBranch] = useState(false);
  const [savingAssignmentId, setSavingAssignmentId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [managingBranch, setManagingBranch] = useState(null);
  const [newBranch, setNewBranch] = useState({ name: '', address: '' });

  const loadData = useCallback(async () => {
    if (!business?.id) {
      setBranches([]);
      setEmployees([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [branchRows, employeeRows] = await Promise.all([
        getBusinessBranches(business.id),
        getAppEmployees({ businessId: business.id }),
      ]);
      setBranches(Array.isArray(branchRows) ? branchRows : []);
      setEmployees(Array.isArray(employeeRows) ? employeeRows : []);
    } catch (error) {
      notify.error(error.response?.data?.message || 'No se pudieron cargar las sucursales');
    } finally {
      setLoading(false);
    }
  }, [business?.id, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const employeesByBranch = useMemo(() => {
    const map = new Map();
    branches.forEach((branch) => {
      map.set(String(branch.id), []);
    });

    employees.forEach((employee) => {
      (employee.branchIds || []).forEach((branchId) => {
        const list = map.get(String(branchId)) || [];
        list.push(employee);
        map.set(String(branchId), list);
      });
    });

    return map;
  }, [branches, employees]);

  const visibleBranches = useMemo(() => {
    if (selectedBranch === 'all') return branches;
    return branches.filter((branch) => String(branch.id) === String(selectedBranch));
  }, [branches, selectedBranch]);

  const handleCreateBranch = async () => {
    if (!business?.id || !newBranch.name.trim()) return;
    setSavingBranch(true);
    try {
      await createBranch({
        business_id: business.id,
        name: newBranch.name.trim(),
        address: newBranch.address.trim(),
      });
      notify.success('Sucursal creada correctamente');
      setNewBranch({ name: '', address: '' });
      setIsAddModalOpen(false);
      await loadData();
    } catch (error) {
      notify.error(error.response?.data?.message || 'No se pudo crear la sucursal');
    } finally {
      setSavingBranch(false);
    }
  };

  const handleToggleEmployee = async (employee, branchId) => {
    const hasBranch = (employee.branchIds || []).includes(String(branchId));
    const nextBranchIds = hasBranch
      ? (employee.branchIds || []).filter((id) => String(id) !== String(branchId))
      : [...(employee.branchIds || []), String(branchId)];

    if (!employee.isOwner && nextBranchIds.length === 0) {
      notify.warning('Cada empleado debe tener al menos una sucursal asignada');
      return;
    }

    setSavingAssignmentId(`${employee.id}-${branchId}`);
    try {
      const updated = await updateAppEmployee(employee.id, {
        branchIds: nextBranchIds.map(Number),
      });
      setEmployees((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      notify.error(error.response?.data?.message || 'No se pudo actualizar la asignación');
    } finally {
      setSavingAssignmentId(null);
    }
  };

  return (
    <div className="p-4 md:p-5 min-h-full flex flex-col w-full max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="app-page-title">Mis Sucursales</h1>
          <p className="app-page-subtitle mt-0.5">
            Gestiona sucursales reales, personal asignado y el inventario por local.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
        >
          <Plus size={18} />
          Nueva Sucursal
        </button>
      </div>

      {loading ? (
        <div className="min-h-[260px] flex items-center justify-center text-slate-500 dark:text-slate-400">
          <Loader2 size={20} className="animate-spin mr-2" />
          Cargando sucursales reales...
        </div>
      ) : visibleBranches.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 p-10 text-center">
          <Store size={36} className="mx-auto mb-3 text-slate-400" />
          <p className="text-base font-bold text-slate-900 dark:text-white">No hay sucursales creadas</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Crea la primera sucursal para empezar a separar stock y personal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleBranches.map((branch) => {
            const assignedEmployees = employeesByBranch.get(String(branch.id)) || [];
            const isActiveBranch = String(selectedBranch) === String(branch.id);

            return (
              <div
                key={branch.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border shadow-sm p-6 relative overflow-hidden transition-all ${
                  isActiveBranch
                    ? 'border-indigo-400 dark:border-indigo-600 shadow-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                    <Store size={26} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-lg text-slate-900 dark:text-white truncate">{branch.name}</h3>
                      {isActiveBranch && (
                        <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                          Activa
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                      <MapPin size={14} />
                      <span className="truncate">{branch.address || 'Sin dirección cargada'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ventas Hoy</p>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{currency(branch.todaySales)}</p>
                  </div>
                  <button
                    onClick={() => setManagingBranch(branch)}
                    className="text-left bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors"
                  >
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <Users size={10} />
                      Personal
                    </p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{assignedEmployees.length}</p>
                    <p className="text-[10px] mt-1 font-bold text-indigo-500">Asignar empleados</p>
                  </button>
                </div>

                <button
                  onClick={() => navigate('/app/catalogo')}
                  className="w-full text-left bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50 mb-6 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors relative z-10"
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Package size={10} />
                      Inventario local
                    </p>
                    <span className="text-[10px] font-bold text-indigo-500">Abrir catálogo</span>
                  </div>
                  <div className="flex justify-between items-end gap-3">
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      {Number(branch.productsCount || 0).toLocaleString()} <span className="text-xs text-slate-500 font-bold">ítems</span>
                    </p>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{currency(branch.stockValue)}</p>
                  </div>
                </button>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Equipo asignado</p>
                  <div className="flex flex-wrap gap-2">
                    {assignedEmployees.length === 0 ? (
                      <span className="text-xs font-medium text-slate-400">Sin personal asignado todavía</span>
                    ) : (
                      assignedEmployees.slice(0, 4).map((employee) => (
                        <span
                          key={`${branch.id}-${employee.id}`}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-bold"
                        >
                          {employee.name}
                        </span>
                      ))
                    )}
                    {assignedEmployees.length > 4 && (
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[11px] font-bold">
                        +{assignedEmployees.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Nueva Sucursal</h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Se conectará automáticamente con inventario y empleados.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Nombre</label>
                <input
                  type="text"
                  value={newBranch.name}
                  onChange={(event) => setNewBranch((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Ej. Sucursal Sur"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Dirección</label>
                <input
                  type="text"
                  value={newBranch.address}
                  onChange={(event) => setNewBranch((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="Ej. Av. San Martín 321"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 dark:text-white"
                />
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
                onClick={handleCreateBranch}
                disabled={savingBranch || !newBranch.name.trim()}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {savingBranch && <Loader2 size={16} className="animate-spin" />}
                Crear Sucursal
              </button>
            </div>
          </div>
        </div>
      )}

      {managingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Asignar Personal</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{managingBranch.name}</p>
              </div>
              <button
                onClick={() => setManagingBranch(null)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-3">
              {employees.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                  <Users size={28} className="mx-auto mb-3 text-slate-400" />
                  <p className="font-bold text-slate-900 dark:text-white">No hay empleados creados</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Primero crea empleados desde la sección de personal.</p>
                </div>
              ) : (
                employees.map((employee) => {
                  const assigned = (employee.branchIds || []).includes(String(managingBranch.id));
                  const saving = savingAssignmentId === `${employee.id}-${managingBranch.id}`;
                  return (
                    <button
                      key={employee.id}
                      onClick={() => handleToggleEmployee(employee, managingBranch.id)}
                      disabled={saving}
                      className={`w-full text-left rounded-2xl border px-4 py-4 transition-all ${
                        assigned
                          ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/70 dark:bg-indigo-500/10'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40'
                      } disabled:opacity-60`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">{employee.name}</p>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                            {employee.email} · {employee.role}
                          </p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ${assigned ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300'}`}>
                          {saving ? 'Guardando...' : assigned ? 'Asignado' : 'Asignar'}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center gap-3">
              <button
                onClick={() => navigate('/app/empleados')}
                className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2"
              >
                Abrir empleados
                <ArrowUpRight size={14} />
              </button>
              <button
                onClick={() => setManagingBranch(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
