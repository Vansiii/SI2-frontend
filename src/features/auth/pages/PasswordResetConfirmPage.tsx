import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { PasswordResetConfirmForm } from '../components/PasswordResetConfirmForm';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { confirmPasswordReset } from '../services/passwordReset';
import { ApiErrorClass } from '../../../utils/errorHandler';

interface PasswordResetConfirmFormData {
  new_password: string;
  confirm_password: string;
}

export function PasswordResetConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);

  // Auto-dismiss error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [error]);

  // Auto-dismiss passwordErrors después de 7 segundos (más tiempo porque son múltiples mensajes)
  useEffect(() => {
    if (passwordErrors.length > 0) {
      const timeout = setTimeout(() => {
        setPasswordErrors([]);
      }, 7000);

      return () => clearTimeout(timeout);
    }
  }, [passwordErrors]);

  useEffect(() => {
    // Obtener token de URL query params
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      setTokenError(true);
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (data: PasswordResetConfirmFormData) => {
    if (!token) {
      setTokenError(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setPasswordErrors([]);

    try {
      await confirmPasswordReset(token, data.new_password, data.confirm_password);
      setSuccess(true);

      // Redirigir a login después de 3 segundos
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        // Manejar errores específicos
        if (err.message.toLowerCase().includes('token') || 
            err.message.toLowerCase().includes('expirado') ||
            err.message.toLowerCase().includes('inválido')) {
          setTokenError(true);
        } else if (err.fieldErrors && err.fieldErrors.newPassword) {
          // Errores de validación de contraseña del backend
          setPasswordErrors(Array.isArray(err.fieldErrors.newPassword) 
            ? err.fieldErrors.newPassword 
            : [err.fieldErrors.newPassword]);
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

  const handleGoToLogin = () => {
    navigate('/login', { replace: true });
  };

  if (success) {
    return (
      <AuthLayout
        title="¡Contraseña Actualizada!"
        subtitle="Tu contraseña ha sido restablecida exitosamente"
      >
        <div className="space-y-6">
          <Alert variant="success">
            <div>
              <p className="font-medium">Contraseña actualizada exitosamente</p>
              <p className="mt-1 text-sm">
                Serás redirigido al inicio de sesión en unos segundos...
              </p>
            </div>
          </Alert>

          <Button onClick={handleGoToLogin} className="w-full">
            Ir al Inicio de Sesión
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Nueva Contraseña"
      subtitle="Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta"
    >
      <PasswordResetConfirmForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        passwordErrors={passwordErrors}
        tokenError={tokenError}
      />
    </AuthLayout>
  );
}
