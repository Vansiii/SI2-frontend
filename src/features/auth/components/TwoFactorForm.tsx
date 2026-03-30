import { useState, useEffect } from 'react';
import { Clock, Mail, Smartphone } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { useCountdown } from '../hooks/useCountdown';
import type { TwoFactorErrorResponse } from '../../../types';

interface TwoFactorFormProps {
  onSubmit: (code: string, isBackupCode?: boolean) => Promise<void>;
  onBack: () => void;
  onResend?: () => Promise<void>;
  isLoading: boolean;
  error: TwoFactorErrorResponse | null;
  expiresIn?: number; // Segundos hasta que expire el challenge_token
  method?: 'totp' | 'email'; // Método de 2FA
  userEmail?: string; // Email del usuario (para mostrar en método email)
}

export function TwoFactorForm({
  onSubmit,
  onBack,
  onResend,
  isLoading,
  error,
  expiresIn = 300, // 5 minutos por defecto
  method = 'totp',
  userEmail,
}: TwoFactorFormProps) {
  const [code, setCode] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [attemptsExhausted, setAttemptsExhausted] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  
  // Pausar el timer cuando se agotan los intentos
  const { isExpired, formatted: formatTime } = useCountdown(expiresIn, attemptsExhausted);
  
  // Detectar cuando se agotan los intentos y mantener el estado
  useEffect(() => {
    if (error?.attempts_remaining === 0) {
      setAttemptsExhausted(true);
    }
  }, [error]);
  
  // Deshabilitar input y botón verificar si se agotaron intentos o expiró
  const isDisabled = isExpired || attemptsExhausted;

  // Auto-dismiss error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        // El error se limpiará en el próximo intento de submit
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const expectedLength = useBackupCode ? 8 : 6;
    if (code.length !== expectedLength) {
      return;
    }

    await onSubmit(code, useBackupCode);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (useBackupCode) {
      // Códigos de respaldo: alfanuméricos, 8 caracteres
      value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (value.length <= 8) {
        setCode(value);
      }
    } else {
      // Códigos TOTP/Email: solo números, 6 dígitos
      value = value.replace(/\D/g, '');
      if (value.length <= 6) {
        setCode(value);
      }
    }
  };

  const toggleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    setCode(''); // Limpiar el código al cambiar de modo
  };

  const handleResend = async () => {
    if (!onResend || isResending) return;
    
    setIsResending(true);
    try {
      await onResend();
      // Resetear estado de intentos agotados al reenviar
      setAttemptsExhausted(false);
      setCode(''); // Limpiar el código ingresado
    } finally {
      setIsResending(false);
    }
  };

  const maskEmail = (email: string) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    const maskedName = name.charAt(0) + '***' + name.charAt(name.length - 1);
    return `${maskedName}@${domain}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Icono y descripción */}
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
          {method === 'email' ? (
            <Mail className="h-8 w-8 text-blue-600" />
          ) : (
            <Smartphone className="h-8 w-8 text-blue-600" />
          )}
        </div>
        
        {method === 'email' ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Hemos enviado un código de 6 dígitos a:
            </p>
            <p className="text-sm font-medium text-gray-900">
              {userEmail ? maskEmail(userEmail) : 'tu correo electrónico'}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            {useBackupCode 
              ? 'Ingresa uno de tus códigos de respaldo de 8 caracteres'
              : 'Ingresa el código de 6 dígitos generado por tu aplicación de autenticación'}
          </p>
        )}
      </div>

      {/* Timer */}
      {!isExpired && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Tiempo restante: {formatTime}</span>
        </div>
      )}

      {/* Mensaje de expiración */}
      {isExpired && (
        <Alert variant="error">
          <div>
            <p className="font-medium">Código expirado</p>
            <p className="mt-1 text-xs">
              {method === 'email' 
                ? 'El código ha expirado. Solicita uno nuevo.'
                : 'El código ha expirado. Por favor, inicia sesión nuevamente.'}
            </p>
          </div>
        </Alert>
      )}
      
      {/* Mensaje de intentos agotados */}
      {attemptsExhausted && !isExpired && (
        <Alert variant="error">
          <div>
            <p className="font-medium">Demasiados intentos</p>
            <p className="mt-1 text-xs">
              {method === 'email' 
                ? 'Has agotado tus intentos. Solicita un nuevo código.'
                : 'Has agotado tus intentos. Por favor, inicia sesión nuevamente.'}
            </p>
          </div>
        </Alert>
      )}

      {/* Error general */}
      {error && !isExpired && !attemptsExhausted && (
        <Alert variant="error">
          <p>{error.error}</p>
        </Alert>
      )}

      {/* Input de código */}
      <div>
        <Input
          id="code"
          type="text"
          inputMode={useBackupCode ? 'text' : 'numeric'}
          pattern={useBackupCode ? '[A-Z0-9]*' : '[0-9]*'}
          label={useBackupCode ? 'Código de Respaldo' : 'Código de Verificación'}
          placeholder={useBackupCode ? 'ABC12345' : '123456'}
          value={code}
          onChange={handleCodeChange}
          disabled={isLoading || isDisabled}
          autoFocus
          className="text-center text-2xl font-mono uppercase"
          maxLength={useBackupCode ? 8 : 6}
        />
        <p className="mt-2 text-xs text-gray-500 text-center">
          {useBackupCode 
            ? 'Ingresa los 8 caracteres sin espacios'
            : 'Ingresa los 6 dígitos sin espacios'}
        </p>
        
        {/* Toggle para código de respaldo (solo para TOTP) */}
        {method === 'totp' && !isDisabled && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={toggleBackupCode}
              className="text-sm text-blue-600 hover:text-blue-500 underline"
            >
              {useBackupCode 
                ? '← Usar código de autenticación'
                : '¿No puedes acceder? Usa un código de respaldo'}
            </button>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading || code.length !== (useBackupCode ? 8 : 6) || isDisabled}
        >
          {isLoading ? 'Verificando...' : 'Verificar Código'}
        </Button>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            disabled={isLoading || isResending}
            className="w-full"
          >
            Volver
          </Button>
          
          {method === 'email' && onResend && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              disabled={isLoading || isResending || (!isExpired && !attemptsExhausted)}
              isLoading={isResending}
              className="w-full"
            >
              {isResending ? 'Reenviando...' : 'Reenviar Código'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
