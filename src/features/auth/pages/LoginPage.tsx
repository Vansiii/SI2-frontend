import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { ApiErrorClass } from '../../../utils/errorHandler';
import { Alert } from '../../../components/ui/Alert';
import type { LoginFormData } from '../schemas/loginSchema';
import type { LoginErrorResponse } from '../../../types';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginErrorResponse | null>(null);

  // Obtener información del registro si viene desde allí
  const registrationSuccess = location.state?.registrationSuccess;
  const registeredEmail = location.state?.email;

  // Redirigir a home si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await login(data);

      // Si requiere 2FA, guardar información y redirigir
      if (response.requires_2fa && response.challenge_token) {
        sessionStorage.setItem('challenge_token', response.challenge_token);
        
        // Guardar timestamp de expiración (no el tiempo restante)
        if (response.expires_in) {
          const expiresAt = Date.now() + (response.expires_in * 1000); // Convertir segundos a ms
          sessionStorage.setItem('challenge_expires_at', expiresAt.toString());
        }
        
        // Guardar método 2FA (totp o email)
        if (response.method) {
          sessionStorage.setItem('two_factor_method', response.method);
        }
        
        // Guardar email del usuario para mostrar en la vista 2FA
        if (response.user?.email) {
          sessionStorage.setItem('user_email', response.user.email);
        }
        
        navigate('/login/2fa');
        return;
      }

      // Si no requiere 2FA, redirigir a home
      navigate('/home');
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        // Construir objeto de error con la información del backend
        const errorResponse: LoginErrorResponse = {
          error: err.message,
        };

        // Extraer attempts_remaining si existe
        const attemptsMatch = err.message.match(/(\d+)\s+intento/i);
        if (attemptsMatch) {
          errorResponse.attempts_remaining = parseInt(attemptsMatch[1], 10);
        }

        // Extraer minutes_remaining si existe
        const minutesMatch = err.message.match(/(\d+)\s+minuto/i);
        if (minutesMatch) {
          errorResponse.minutes_remaining = parseInt(minutesMatch[1], 10);
        }

        // Si el mensaje contiene información de bloqueo
        if (err.message.toLowerCase().includes('bloqueada')) {
          errorResponse.minutes_remaining = errorResponse.minutes_remaining || 5;
        }

        setError(errorResponse);
      } else {
        setError({
          error: 'Error de conexión. Verifica tu conexión a internet.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle="Ingresa tus credenciales para acceder al sistema"
    >
      {registrationSuccess && (
        <Alert variant="success" className="mb-6">
          ¡Registro exitoso! Tu cuenta ha sido creada. Ahora puedes iniciar sesión
          {registeredEmail && ` con ${registeredEmail}`}.
        </Alert>
      )}
      <LoginForm 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
        error={error}
        onClearError={() => setError(null)}
      />
    </AuthLayout>
  );
}
