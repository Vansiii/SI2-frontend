import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Key, ArrowLeft, Save, Filter, LayoutGrid } from 'lucide-react';
import { fetchRole, fetchPermissions, assignPermissions } from '../services/rolesApi';
import type { Role, Permission } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';

export function RolePermissionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    if (id) {
      loadData(parseInt(id, 10));
    }
  }, [id]);

  const loadData = async (roleId: number) => {
    try {
      setLoading(true);
      const [roleData, permissionsData] = await Promise.all([
        fetchRole(roleId),
        fetchPermissions()
      ]);
      setRole(roleData);
      setAllPermissions(permissionsData);
      setSelectedPermissions(new Set(roleData.permissions.map(p => p.id)));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al cargar los datos');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const toggleModulePermissions = (permissionsInModule: Permission[]) => {
    const allSelected = permissionsInModule.every(p => selectedPermissions.has(p.id));
    
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      permissionsInModule.forEach(p => {
        if (allSelected) {
          next.delete(p.id);
        } else {
          next.add(p.id);
        }
      });
      return next;
    });
  };

  const handleSave = async () => {
    if (!role) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const arrayPerms = Array.from(selectedPermissions);
      await assignPermissions(role.id, { permission_ids: arrayPerms });
      setSuccess('Permisos actualizados correctamente');
      setTimeout(() => navigate('/roles'), 1500);
    } catch (err: unknown) {
       if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al guardar los permisos');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Cargando configuración..." fullScreen={true} />;
  }

  if (!role) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          Rol no encontrado.
        </div>
        <Link to="/roles" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Volver a Roles
        </Link>
      </div>
    );
  }

  // Agrupación de permisos por módulo
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const mod = perm.module || 'General';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const modules = Object.keys(groupedPermissions).sort();
  const visibleModules = moduleFilter ? [moduleFilter] : modules;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
        <div className="flex items-start gap-4">
          <Link
            to="/roles"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 shrink-0 mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Key className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              Asignar Permisos
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Configurando accesos para el rol: <span className="text-slate-900 font-semibold px-2 py-0.5 bg-slate-100 rounded border border-slate-200">{role.name}</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex justify-center items-center gap-2 px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm w-full md:w-auto"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-700 text-sm flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-700 font-bold">&times;</button>
        </div>
      )}

      {/* Filtros Tab */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-5">
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
               <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                 Filtrar por Módulo
               </label>
               <div className="relative">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <select
                   value={moduleFilter}
                   onChange={(e) => setModuleFilter(e.target.value)}
                   className="w-full pl-9 pr-8 py-2 bg-white/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                 >
                   <option value="">Todos los módulos</option>
                   {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                 </select>
               </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 sm:mt-6">
               <span className="font-semibold text-slate-900">{selectedPermissions.size}</span>
               <span>permisos seleccionados</span>
            </div>
         </div>
      </div>

      {/* Grilla de Módulos */}
      <div className="space-y-6">
        {visibleModules.map(moduleName => {
           const modulePerms = groupedPermissions[moduleName];
           const isAllSelectedInModule = modulePerms.every(p => selectedPermissions.has(p.id));
           const selectedInModuleCount = modulePerms.filter(p => selectedPermissions.has(p.id)).length;

           return (
             <div key={moduleName} className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               {/* Module Header */}
               <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <LayoutGrid className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 capitalize tracking-tight">
                        {moduleName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {selectedInModuleCount} de {modulePerms.length} permisos habilitados
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleModulePermissions(modulePerms)}
                    className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all border ${
                      isAllSelectedInModule 
                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                        : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                     }`}
                  >
                    {isAllSelectedInModule ? 'Desmarcar todo' : 'Seleccionar todo'}
                  </button>
               </div>

               {/* Module Permissions Grid */}
               <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                  {modulePerms.map(permission => {
                    const isSelected = selectedPermissions.has(permission.id);
                    return (
                      <label 
                        key={permission.id} 
                        className={`relative flex items-start p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-50/50 border-blue-200 shadow-sm' 
                            : 'bg-transparent border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center h-5 mt-0.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePermission(permission.id)}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 rounded cursor-pointer transition-colors"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <span className={`block text-sm font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                            {permission.name}
                          </span>
                          <span className="block text-xs text-slate-500 mt-1 leading-relaxed">
                            {permission.description || 'Sin descripción.'}
                          </span>
                        </div>
                      </label>
                    );
                  })}
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}