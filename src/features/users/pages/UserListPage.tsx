import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { getUsers, deactivateUser } from '../services/usersApi';
import type { UserWithDetails } from '../../../types';
import { LoadingState } from '../../../components/ui/LoadingState';
import { Building2, Edit2, Shield, Trash2, UsersIcon, UserPlus } from 'lucide-react';

export function UserListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreate = hasPermission('users.create');
  const canEdit = hasPermission('users.edit');
  const canDeactivate = hasPermission('users.deactivate');
  const canAssignRoles = hasPermission('users.assign_roles');

  useEffect(() => {
    loadUsers();
  }, [hasPermission]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err: unknown) {
      let errorMessage = 'Error al cargar usuarios';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      // Si es error 403, mostrar mensaje específico sobre permisos
      if (typeof err === 'object' && err !== null && 'status' in err && (err as any).status === 403 || errorMessage.includes('permiso')) {
        setError(
          'No tienes permiso para ver usuarios. Si acabas de recibir nuevos permisos, ' +
          'cierra sesión y vuelve a iniciar sesión para actualizar tus permisos.'
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId: number) => {
    if (!confirm('¿Está seguro de desactivar este usuario?')) {
      return;
    }

    try {
      await deactivateUser(userId);
      await loadUsers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al desactivar usuario');
      }
    }
  };

  if (loading) {
    return <LoadingState message="Cargando usuarios..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-blue-600" />
            Gestión de Usuarios
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Administra el directorio de usuarios y sus perfiles institucionales.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/users/new')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm w-full md:w-auto"
          >
            <UserPlus className="h-4 w-4" />
            Crear Usuario
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Vista de cuadrícula para móviles y escritorio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.length === 0 ? (
           <div className="col-span-full p-8 text-center text-slate-500 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
             No hay usuarios registrados en el sistema.
           </div>
        ) : (
          users.map((user) => (
             <div 
                key={user.id}
                className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Header de Tarjeta */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-3">
                   <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600 font-bold text-lg border-2 border-white shadow-sm shrink-0">
                         {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                         <h3 className="font-bold text-slate-900 truncate" title={`${user.first_name} ${user.last_name}`}>
                            {user.first_name} {user.last_name}
                         </h3>
                         <p className="text-xs text-slate-500 truncate" title={user.email}>
                            {user.email}
                         </p>
                      </div>
                   </div>
                   <span
                      className={`shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full border ${
                        user.is_active
                          ? 'bg-green-50/50 border-green-200 text-green-600'
                          : 'bg-slate-50/50 border-slate-200 text-slate-400'
                      }`}
                      title={user.is_active ? 'Usuario Activo' : 'Cuentra Inactiva'}
                    >
                      <div className={`h-2.5 w-2.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                    </span>
                </div>

                {/* Cuerpo de la Tarjeta */}
                <div className="p-5 flex-1 flex flex-col gap-4">
                   {/* Info perfil */}
                   {user.profile && (
                     <div className="space-y-2">
                        {user.profile.position && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                             <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                             <span className="truncate">{user.profile.position}</span>
                          </div>
                        )}
                        {user.profile.department && (
                           <div className="text-xs text-slate-500 ml-1">
                              Dep: <span className="font-medium text-slate-700">{user.profile.department}</span>
                           </div>
                        )}
                     </div>
                   )}

                   {/* Roles */}
                   <div className="mt-auto">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Roles Asignados
                     </p>
                     <div className="flex flex-wrap gap-1.5">
                        {user.roles.length === 0 ? (
                           <span className="text-xs text-slate-400 italic">Sin roles</span>
                        ) : (
                          user.roles.map((role) => (
                             <span
                                key={role.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                title={role.institution ? `Institución: ${role.institution}` : undefined}
                              >
                                {role.name}
                              </span>
                          ))
                        )}
                     </div>
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-1">
                    {canAssignRoles && (
                      <button
                        onClick={() => navigate(`/users/${user.id}/roles`)}
                        className="flex-1 flex items-center justify-center gap-1.5 p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors text-xs font-semibold whitespace-nowrap"
                        title="Asignar Roles"
                      >
                        <Shield className="h-4 w-4" /> {/* <span className="hidden sm:inline">Roles</span> */}
                      </button>
                    )}
                    {canEdit && (
                       <>
                        <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                        <button
                          onClick={() => navigate(`/users/${user.id}/edit`)}
                          className="flex-1 flex items-center justify-center gap-1.5 p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-xs font-semibold whitespace-nowrap"
                          title="Editar Usuario"
                        >
                          <Edit2 className="h-4 w-4" /> {/* <span className="hidden sm:inline">Editar</span> */}
                        </button>
                       </>
                    )}
                    {canDeactivate && user.is_active && (
                       <>
                         <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                         <button
                           onClick={() => handleDeactivate(Number(user.id))}
                           className="flex-1 flex items-center justify-center gap-1.5 p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-xs font-semibold whitespace-nowrap"
                           title="Desactivar Usuario"
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