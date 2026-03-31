import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserById, assignRoles } from '../services/usersApi';
import { fetchRoles } from '../../roles/services/rolesApi';
import type { UserWithDetails, Role, AssignRolesData } from '../../../types';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ArrowLeft, Shield, AlertCircle, Save, CheckCircle2 } from 'lucide-react';

export function UserRolesPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<UserWithDetails | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;

    try {
      setLoadingData(true);
      const [userData, rolesData] = await Promise.all([
        getUserById(Number(userId)),
        fetchRoles(),
      ]);
      setUser(userData);
      setRoles(rolesData);
      setSelectedRoleIds(userData.roles.map((r) => r.id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al cargar datos');
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    if (selectedRoleIds.length === 0) {
      setError('Debe seleccionar al menos un rol');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data: AssignRolesData = {
        role_ids: selectedRoleIds,
      };

      await assignRoles(Number(userId), data);
      navigate('/users');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al asignar roles');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  if (loadingData) {
    return <LoadingState message="Cargando perfil del usuario..." fullScreen={true} />;
  }

  if (!user) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center p-12 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200">
           <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
           <p className="text-lg font-medium text-slate-600 mb-4">Usuario no encontrado o no disponible.</p>
           <button onClick={() => navigate('/users')} className="text-blue-600 hover:text-blue-800 font-medium">Volver a usuarios</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
         <button
            onClick={() => navigate('/users')}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a usuarios
          </button>
          
          <div className="flex items-start gap-4 p-5 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm mb-6">
              <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl border-2 border-blue-100 shrink-0">
                 {user.first_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" /> Asignar Roles
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  Gestionando roles para <span className="font-semibold text-slate-800">{user.first_name} {user.last_name}</span> ({user.email})
                </p>
              </div>
          </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50/80 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-sm">
           <AlertCircle className="h-5 w-5 shrink-0" />
           <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
             <div>
                <h2 className="text-lg font-bold text-slate-900">Catálogo de Roles</h2>
                <p className="text-sm text-slate-500 mt-1">Seleccione los roles de sistema que se aplicarán a este usuario.</p>
             </div>
             <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
               {selectedRoleIds.length} {selectedRoleIds.length === 1 ? 'Seleccionado' : 'Seleccionados'}
             </span>
          </div>

          <div className="space-y-3">
            {roles.length === 0 ? (
               <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  No hay roles disponibles configurados en el sistema.
               </div>
            ) : (
              roles.map((role) => {
                 const isSelected = selectedRoleIds.includes(role.id);
                 return (
                    <label
                      key={role.id}
                      className={`block w-full p-4 rounded-xl border cursor-pointer transition-all ${
                         isSelected 
                         ? 'bg-blue-50/40 border-blue-200 ring-1 ring-blue-500/20' 
                         : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                         <div className="relative flex items-center justify-center mt-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleRoleToggle(role.id)}
                              className="peer sr-only"
                            />
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                  isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                               }`}
                            >
                               {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                               <span className={`font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                                 {role.name}
                               </span>
                               {role.institution && (
                                   <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600">
                                      {role.institution}
                                   </span>
                               )}
                            </div>
                            {role.description && (
                              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{role.description}</p>
                            )}
                            
                            {/* Permisos Preview */}
                            {role.permissions && role.permissions.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-100/60 flex flex-wrap gap-1.5">
                                {role.permissions.slice(0, 4).map((perm) => (
                                  <span
                                    key={perm.id}
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                       isSelected ? 'bg-blue-100/50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-600 border-slate-200/60'
                                    }`}
                                  >
                                    {perm.name}
                                  </span>
                                ))}
                                {role.permissions.length > 4 && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                     isSelected ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200/60'
                                  }`}>
                                    +{role.permissions.length - 4} más
                                  </span>
                                )}
                              </div>
                            )}
                         </div>
                      </div>
                    </label>
                 );
              })
            )}
          </div>
          
          {roles.length > 0 && selectedRoleIds.length === 0 && (
            <p className="flex items-center gap-1.5 text-amber-600 text-sm mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
               <AlertCircle className="w-4 h-4" /> Debe asignar al menos un rol al usuario.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-white hover:text-slate-900 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || selectedRoleIds.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-md hover:-translate-y-0.5 transition-all disabled:bg-slate-400 disabled:transform-none font-medium text-sm"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Guardando...' : 'Guardar Asignación'}
          </button>
        </div>
      </form>
    </div>
  );
}