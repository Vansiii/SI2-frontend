import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SaasRegistrationData } from '../types';

interface Props {
  formData: SaasRegistrationData;
  onFinish?: () => void;
  message?: string;
}

export function SuccessStep({ formData, message }: Props) {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/login', { 
      state: { 
        registrationSuccess: true,
        email: formData.email 
      } 
    });
  };

  return (
    <div className="text-center py-8 animate-in zoom-in-95 duration-500">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Entorno creado exitosamente!</h3>
      <p className="text-gray-600 mb-8">
        {message ?? 'Registro completado exitosamente.'} Tu cuenta ha sido creada para{' '}
        <span className="font-semibold">{formData.email}</span>. Ya puedes iniciar sesión.
      </p>
      <div className="bg-gray-50 p-4 rounded-lg mb-8 text-left border border-gray-100">
        <p className="text-sm text-gray-600 mb-1">Entidad: <span className="font-medium text-gray-900">{formData.companyName}</span></p>
        <p className="text-sm text-gray-600">Usuario Administrador: <span className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</span></p>
      </div>
      <button
        type="button"
        onClick={handleGoToLogin}
        className="inline-flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        Ir a iniciar sesión
      </button>
    </div>
  );
}
