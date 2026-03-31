import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserById, createUser, updateUser } from '../services/usersApi';
import { fetchRoles } from '../../roles/services/rolesApi';
import type { CreateUserData, UpdateUserData, Role } from '../../../types';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Shield, User, Mail, Lock, Phone, Briefcase, Building2 } from 'lucide-react';

export function UserFormPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const isEditMode = !!userId;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    role_ids: [] as number[],
    phone: '',
    position: '',
    department: '',
  });

  useEffect(() => {
    loadRoles();
    if (isEditMode) {
      loadUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadRoles = async () => {
    try {
      const data = await fetchRoles();
      setRoles(data);
    } catch (err: unknown) {
      console.error('Error al cargar roles:', err);
    }
  };

  const loadUser = async () => {
    if (!userId) return;

    try {
      setLoadingData(true);
      const user = await getUserById(Number(userId));
      setFormData({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        password: '',
        confirm_password: '',
        role_ids: user.roles.map((r) => r.id),
        phone: user.profile.phone || '',
        position: user.profile.position || '',
        department: user.profile.department || '',
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
         setError(err.message);
      } else {
         setError('Error al cargar usuario');
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validaciones
    const errors: Record<string, string> = {};

    if (!isEditMode) {
      if (!formData.password) {
        errors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = 'Las contraseñas no coinciden';
      }
    }

    if (formData.role_ids.length === 0) {
      errors.role_ids = 'Debe seleccionar al menos un rol';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        const updateData: UpdateUserData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
        };
        await updateUser(Number(userId), updateData);
      } else {
        const createData: CreateUserData = {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          password: formData.password,
          role_ids: formData.role_ids,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
        };
        await createUser(createData);
      }

      navigate('/users');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'fieldErrors' in err) {
         setFieldErrors((err as any).fieldErrors);
      } else {
        setError('Error al guardar usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setFormData((prev) => ({
      ...prev,
      role_ids: prev.role_ids.includes(roleId)
        ? prev.role_ids.filter((id) => id !== roleId)
        : [...prev.role_ids, roleId],
    }));
  };

  if (loadingData) {
    return <LoadingState message="Cargando información del usuario..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            onClick={() => navigate('/users')}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a usuarios
          </button>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            {isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50/80 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        
        {/* Secciones del Formulario */}
        <div className="flex flex-col md:flex-row border-b border-slate-100">
           {/* Columna Izquierda: Información Básica */}
           <div className="p-6 md:p-8 flex-1 space-y-6 md:border-r md:border-slate-100">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="h-5 w-5 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Datos Personales</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400 sm:text-sm"
                    placeholder="Ej. Juan Carlos"
                    required
                  />
                  {fieldErrors.first_name && (
                    <p className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> {fieldErrors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400 sm:text-sm"
                    placeholder="Ej. Pérez"
                    required
                  />
                  {fieldErrors.last_name && (
                   <p className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> {fieldErrors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                   <Mail className="h-4 w-4 text-slate-400" />
                   Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 disabled:opacity-50 disabled:bg-slate-100 sm:text-sm"
                  placeholder="usuario@institucion.com"
                  required
                  disabled={isEditMode}
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> {fieldErrors.email}</p>
                )}
                {isEditMode && <p className="text-xs text-slate-500 mt-1.5 ml-1">El correo electrónico no puede ser modificado.</p>}
              </div>

              {/* Contraseñas (Solo creación) */}
              {!isEditMode && (
                <div className="space-y-5 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 mb-2">
                     <Lock className="h-4 w-4 text-slate-400" />
                     <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Credenciales</h3>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                      placeholder="Mínimo 8 caracteres"
                      required
                      minLength={8}
                    />
                    {fieldErrors.password && (
                       <p className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> {fieldErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Confirmar Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                      placeholder="Repita la contraseña"
                      required
                    />
                    {fieldErrors.confirm_password && (
                      <p className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> {fieldErrors.confirm_password}</p>
                    )}
                  </div>
                </div>
              )}
           </div>

           {/* Columna Derecha: Información Profesional & Roles */}
           <div className="p-6 md:p-8 flex-1 space-y-6">
              
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Briefcase className="h-5 w-5 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Perfil Profesional</h2>
              </div>

               <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                       <Building2 className="h-4 w-4 text-slate-400" /> Departamento
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                      placeholder="Ej. Recursos Humanos"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                           Cargo
                        </label>
                        <input
                          type="text"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                          placeholder="Ej. Analista"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                           <Phone className="h-4 w-4 text-slate-400" /> Teléfono
                        </label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                  </div>
               </div>

               <div className="pt-2">
                 <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4">
                   <Shield className="h-4 w-4 text-slate-400" />
                   <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Asignación de Roles <span className="text-red-500 normal-case">*</span></h3>
                 </div>
                 
                 <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                    {roles.length === 0 ? (
                      <p className="text-slate-500 text-sm p-2 text-center italic">No hay roles disponibles o no tiene permisos para verlos.</p>
                    ) : (
                      roles.map((role) => {
                         const isSelected = formData.role_ids.includes(role.id);
                         return (
                           <label 
                              key={role.id} 
                              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                                 isSelected ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                              }`}
                           >
                             <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleRoleToggle(role.id)}
                                  className="peer sr-only"
                                />
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                                   }`}
                                >
                                   {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="font-medium text-slate-900 text-sm truncate">{role.name}</div>
                               {role.description && (
                                 <div className="text-xs text-slate-500 truncate mt-0.5">{role.description}</div>
                               )}
                             </div>
                           </label>
                         );
                      })
                    )}
                 </div>
                 {fieldErrors.role_ids && (
                    <p className="text-red-500 text-xs font-medium mt-2 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> {fieldErrors.role_ids}</p>
                 )}
               </div>
           </div>
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
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-md hover:-translate-y-0.5 transition-all disabled:bg-slate-400 disabled:transform-none font-medium text-sm"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}