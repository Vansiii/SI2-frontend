import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Plus, Edit2, Trash2, Key } from 'lucide-react';
import { fetchRoles, deactivateRole } from '../services/rolesApi';
import type { Role } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';

export function RoleListPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await fetchRoles(true);
      setRoles(data);
      setError('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al cargar los roles');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas desactivar este rol?')) return;
    try {
      await deactivateRole(id);
      loadRoles();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al desactivar el rol');
      }
    }
  };

  if (loading) {
    return <LoadingState message="Cargando roles..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Gestión de Roles
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Administra los roles y configura los accesos disponibles para los usuarios.
          </p>
        </div>
        <Link
          to="/roles/create"
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm w-full md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo Rol
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Grid de tarjetas para Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
            No hay roles registrados en esta institución.
          </div>
        ) : (
          roles.map((role) => (
            <div 
              key={role.id} 
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                   <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${role.is_active ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:scale-110' : 'bg-slate-100 text-slate-400'} transition-all`}>
                      <Shield className="h-5 w-5" />
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-900 leading-tight">
                        {role.name}
                      </h3>
                      <span
                        className={`inline-flex mt-1.5 items-center px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border ${
                          role.is_active
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        {role.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                   </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {role.description || 'Sin descripción detallada.'}
                </p>
                
                <div className="mt-auto pt-4 border-t border-slate-50">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                     <Key className="h-3.5 w-3.5" /> Permisos Asignados
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.length === 0 ? (
                      <span className="text-xs text-slate-400 italic px-2 py-1 bg-slate-50 rounded-lg">Ninguno</span>
                    ) : (
                      <>
                        {role.permissions.slice(0, 3).map(p => (
                          <span key={p.id} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {p.name}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200" title={`${role.permissions.length - 3} permisos adicionales`}>
                            +{role.permissions.length - 3} más
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-1">
                 <Link
                    to={`/roles/${role.id}/permissions`}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors text-xs font-semibold"
                  >
                    <Key className="h-4 w-4" /> {/* <span className="hidden sm:inline">Permisos</span> */}
                  </Link>
                  <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                  <Link
                    to={`/roles/${role.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-xs font-semibold"
                  >
                    <Edit2 className="h-4 w-4" /> {/* <span className="hidden sm:inline">Editar</span> */}
                  </Link>
                  {role.is_active && (
                    <>
                      <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-xs font-semibold"
                      >
                        <Trash2 className="h-4 w-4" /> {/* <span className="hidden sm:inline">Desactivar</span> */}
                      </button>
                    </>
                  )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}