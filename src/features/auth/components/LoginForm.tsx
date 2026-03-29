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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Estado para el countdown timer
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Auto-dismiss para errores normales (no de bloqueo) después de 5 segundos
  useEffect(() => {
    if (error && !error.minutes_remaining && onClearError) {
      const timeout = setTimeout(() => {
        onClearError();
      }, 5000); // 5 segundos

      return () => clearTimeout(timeout);
    }
  }, [error, onClearError]);

  // Inicializar el timer cuando hay minutes_remaining
  useEffect(() => {
    if (error?.minutes_remaining !== undefined) {
      setRemainingSeconds(error.minutes_remaining * 60);
    } else {
      setRemainingSeconds(null);
    }
  }, [error?.minutes_remaining]);

  // Limpiar el error de desbloqueo después de 5 segundos
  useEffect(() => {
    if (remainingSeconds === 0 && error) {
      const timeout = setTimeout(() => {
        setRemainingSeconds(null);
        if (onClearError) {
          onClearError();
        }
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [remainingSeconds, error, onClearError]);

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  // Formatear tiempo restante (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Verificar si el mensaje principal ya incluye información de tiempo/intentos
  const messageIncludesAttempts = error?.error.toLowerCase().includes('intento');
  const messageIncludesMinutes = error?.error.toLowerCase().includes('minuto');

  // Determinar si la cuenta está bloqueada
  const isBlocked = remainingSeconds !== null && remainingSeconds > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error general o mensaje de desbloqueo */}
      {error && remainingSeconds === 0 ? (
        // Mostrar Alert de éxito cuando la cuenta se desbloquea
        <Alert variant="success">
          <p className="font-medium">Cuenta desbloqueada. Puedes intentar nuevamente.</p>
        </Alert>
      ) : error ? (
        // Mostrar Alert de error mientras está bloqueada
        <Alert variant="error">
          <div>
            <p className="font-medium">{error.error}</p>
            {/* Solo mostrar attempts_remaining si NO está en el mensaje principal */}
            {!messageIncludesAttempts && error.attempts_remaining !== undefined && error.attempts_remaining > 0 && (
              <p className="mt-1 text-xs">
                Te quedan {error.attempts_remaining} intento{error.attempts_remaining !== 1 ? 's' : ''}
              </p>
            )}
            {/* Mostrar countdown timer si la cuenta está bloqueada */}
            {isBlocked && (
              <div className="mt-2 pt-2 border-t border-red-300 text-center">
                <p className="text-xs font-medium">Tiempo restante:</p>
                <p className="text-2xl font-bold tabular-nums mt-1">{formatTime(remainingSeconds!)}</p>
              </div>
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
        {...register('email')}
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
