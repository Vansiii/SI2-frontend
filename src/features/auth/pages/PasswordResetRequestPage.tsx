import { useState, useEffect } from 'react';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { PasswordResetRequestForm } from '../components/PasswordResetRequestForm';
import { requestPasswordReset } from '../services/passwordReset';
import { ApiErrorClass } from '../../../utils/errorHandler';

interface PasswordResetRequestFormData {
  email: string;
}

export function PasswordResetRequestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-dismiss error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [error]);

  // Auto-dismiss success después de 10 segundos
  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        setSuccess(false);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [success]);

  const handleSubmit = async (data: PasswordResetRequestFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await requestPasswordReset(data.email);
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        // Manejar errores específicos
        if (err.message.toLowerCase().includes('demasiadas')) {
          setError('Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Error de conexión. Verifica tu conexión a internet e intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar Contraseña"
      subtitle="Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña"
    >
      <PasswordResetRequestForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        success={success}
      />
    </AuthLayout>
  );
}
