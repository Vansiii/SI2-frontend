import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { loginSchema } from '../schemas/loginSchema';
import type { LoginFormData } from '../schemas/loginSchema';
import type { LoginErrorResponse } from '../../../types';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
  error: LoginErrorResponse | null;
  onClearError?: () => void;
}

export function LoginForm({ onSubmit, isLoading, error, onClearError }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Estado para el countdown timer
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Recuperar email guardado al cargar (solo durante la sesión)
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('login_email');
    if (savedEmail) {
      setValue('email', savedEmail);
    }
  }, [setValue]);

  // Guardar email en sessionStorage cuando cambie (solo durante la sesión)
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email) {
      sessionStorage.setItem('login_email', email);
    }
  };

  // Auto-dismiss para errores normales (no de bloqueo) después de 5 segundos
  useEffect(() => {
    if (error && !error.minutes_remaining && onClearError) {
      const timeout = setTimeout(() => {
        onClearError();
      }, 5000); // 5 segundos

      return () => clearTimeout(timeout);
    }
  }, [error, onClearError]);

  // Calcular tiempo restante basándose en el timestamp de localStorage
  useEffect(() => {
    const calculateRemainingTime = () => {
      const unlockTimeStr = localStorage.getItem('account_unlock_time');
      
      if (!unlockTimeStr) {
        setRemainingSeconds(null);
        return;
      }

      const unlockTime = parseInt(unlockTimeStr, 10);
      const now = Date.now();
      const remainingMs = unlockTime - now;

      if (remainingMs <= 0) {
        // El bloqueo expiró
        localStorage.removeItem('account_unlock_time');
        localStorage.removeItem('blocked_email');
        setRemainingSeconds(0);
        return;
      }

      // Calcular segundos restantes
      const seconds = Math.ceil(remainingMs / 1000);
      setRemainingSeconds(seconds);
    };

    // Calcular inmediatamente
    calculateRemainingTime();

    // Actualizar cada segundo
    const interval = setInterval(calculateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [error]); // Recalcular cuando cambie el error

  // Limpiar el error cuando el tiempo llega a 0 y mostrar mensaje de éxito
  useEffect(() => {
    if (remainingSeconds === 0) {
      // Limpiar localStorage cuando el bloqueo expira
      localStorage.removeItem('account_unlock_time');
      localStorage.removeItem('blocked_email');
      
      // Limpiar el error inmediatamente para mostrar el mensaje verde
      if (onClearError) {
        onClearError();
      }
      
      // Esperar 5 segundos antes de limpiar el mensaje de éxito
      const timeout = setTimeout(() => {
        setRemainingSeconds(null);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [remainingSeconds, onClearError]);

  // Formatear tiempo restante (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Verificar si el mensaje principal ya incluye información de tiempo/intentos
  const messageIncludesAttempts = error?.error.toLowerCase().includes('intento');

  // Determinar si la cuenta está bloqueada
  const isBlocked = remainingSeconds !== null && remainingSeconds > 0;
  
  // Determinar si debe mostrar mensaje de desbloqueo
  const showUnlockMessage = remainingSeconds === 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Mensaje de desbloqueo exitoso - PRIORIDAD MÁXIMA */}
      {showUnlockMessage ? (
        <Alert variant="success">
          <div className="text-center">
            <p className="font-semibold text-base">¡Cuenta desbloqueada!</p>
            <p className="text-sm mt-1">Ya puedes intentar iniciar sesión nuevamente.</p>
          </div>
        </Alert>
      ) : isBlocked ? (
        // Mostrar Alert de error mientras está bloqueada
        <Alert variant="error">
          <div>
            <p className="font-medium">{error?.error}</p>
            {/* Solo mostrar attempts_remaining si NO está en el mensaje principal */}
            {!messageIncludesAttempts && error?.attempts_remaining !== undefined && error.attempts_remaining > 0 && (
              <p className="mt-1 text-xs">
                Te quedan {error.attempts_remaining} intento{error.attempts_remaining !== 1 ? 's' : ''}
              </p>
            )}
            {/* Mostrar countdown timer */}
            <div className="mt-2 pt-2 border-t border-red-300 text-center">
              <p className="text-xs font-medium">Tiempo restante:</p>
              <p className="text-2xl font-bold tabular-nums mt-1">{formatTime(remainingSeconds!)}</p>
            </div>
          </div>
        </Alert>
      ) : error ? (
        // Mostrar otros errores (credenciales incorrectas, etc.)
        <Alert variant="error">
          <div>
            <p className="font-medium">{error.error}</p>
            {!messageIncludesAttempts && error.attempts_remaining !== undefined && error.attempts_remaining > 0 && (
              <p className="mt-1 text-xs">
                Te quedan {error.attempts_remaining} intento{error.attempts_remaining !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </Alert>
      ) : null}

      {/* Campo Email */}
      <Input
        id="email"
        type="email"
        label="Email"
        placeholder="tu@email.com"
        icon={<Mail />}
        error={errors.email?.message}
        disabled={isLoading || isBlocked}
        autoFocus
        {...register('email', {
          onChange: handleEmailChange,
        })}
      />

      {/* Campo Password */}
      <PasswordInput
        id="password"
        label="Contraseña"
        placeholder="••••••••"
        icon={<Lock />}
        error={errors.password?.message}
        disabled={isLoading || isBlocked}
        {...register('password')}
      />

      {/* Link Olvidé mi contraseña */}
      <div className="flex items-center justify-end">
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {/* Botón Submit */}
      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        disabled={isLoading || isBlocked}
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>

      {/* Link a Registro */}
      <div className="text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <Link
          to="/register"
          className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
        >
          Regístrate aquí
        </Link>
      </div>
    </form>
  );
}
