import { useState, useEffect } from 'react';
import { Smartphone, Mail } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { enable2FA, enableEmail2FA, verify2FASetup } from '../../auth/services/twoFactor';
import type { TwoFactorEnableResponse } from '../../auth/services/twoFactor';

interface TwoFactorSetupModalProps {
  onClose: () => void;
  onComplete: () => void;
}

export function TwoFactorSetupModal({ onClose, onComplete }: TwoFactorSetupModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'email' | null>(null);
  const [step, setStep] = useState<'select' | 'password' | 'qr' | 'verify'>('select');
  const [password, setPassword] = useState('');
  const [qrData, setQrData] = useState<TwoFactorEnableResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  // Auto-dismiss error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
        setAttemptsRemaining(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [error]);

  const handleMethodSelect = (method: 'totp' | 'email') => {
    setSelectedMethod(method);
    setError(null);
  };

  const handleContinue = async () => {
    if (!selectedMethod) return;
    
    // Para ambos métodos, pedir contraseña primero
    setStep('password');
  };

  const handleEnableTOTP = async () => {
    if (!password.trim()) {
      setError('Ingresa tu contraseña para continuar');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[2FA Setup] Habilitando TOTP...');
      const response = await enable2FA(password);
      console.log('[2FA Setup] Respuesta recibida:', response);
      setQrData(response);
      setStep('qr');
    } catch (err: unknown) {
      console.error('[2FA Setup] Error al habilitar TOTP:', err);
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('Error al habilitar 2FA. Verifica tu contraseña.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableEmail = async () => {
    if (!password.trim()) {
      setError('Ingresa tu contraseña para continuar');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await enableEmail2FA(password);
      onComplete();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('Error al habilitar 2FA por email. Verifica tu contraseña.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar paso de selección de método
  if (step === 'select') {
    return (
      <Modal isOpen onClose={onClose} title="Habilitar Autenticación de Dos Factores">
        <div className="space-y-6">
          <Alert variant="info">
            <p className="text-sm">
              La autenticación de dos factores agrega una capa adicional de seguridad a tu cuenta.
            </p>
          </Alert>

          {error && (
            <Alert variant="error">
              <p>{error}</p>
            </Alert>
          )}

          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-3">
              Selecciona un método de verificación:
            </h3>

            <div className="space-y-3">
              {/* Opción TOTP */}
              <button
                onClick={() => handleMethodSelect('totp')}
                disabled={isLoading}
                className={`w-full flex items-start gap-4 p-4 border-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedMethod === 'totp'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-full shrink-0 ${
                    selectedMethod === 'totp' ? 'bg-blue-600' : 'bg-slate-100'
                  }`}
                >
                  <Smartphone
                    className={`h-5 w-5 ${
                      selectedMethod === 'totp' ? 'text-white' : 'text-slate-600'
                    }`}
                  />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-slate-900">App Autenticadora (TOTP)</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Usa Google Authenticator, Authy u otra app compatible para generar códigos
                  </p>
                </div>
              </button>

              {/* Opción Email */}
              <button
                onClick={() => handleMethodSelect('email')}
                disabled={isLoading}
                className={`w-full flex items-start gap-4 p-4 border-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedMethod === 'email'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-full shrink-0 ${
                    selectedMethod === 'email' ? 'bg-blue-600' : 'bg-slate-100'
                  }`}
                >
                  <Mail
                    className={`h-5 w-5 ${
                      selectedMethod === 'email' ? 'text-white' : 'text-slate-600'
                    }`}
                  />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-slate-900">Código por Email</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Recibe un código de 6 dígitos en tu correo electrónico cada vez que inicies
                    sesión
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button 
              variant="secondary" 
              onClick={onClose} 
              disabled={isLoading}
              className="w-full sm:w-1/2"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedMethod || isLoading}
              isLoading={isLoading}
              className="w-full sm:w-1/2"
            >
              {isLoading ? 'Habilitando...' : 'Continuar'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Renderizar paso de contraseña (para ambos métodos)
  if (step === 'password') {
    const handlePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedMethod === 'email') {
        handleEnableEmail();
      } else {
        handleEnableTOTP();
      }
    };

    return (
      <Modal isOpen onClose={onClose} title="Confirmar Contraseña">
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <Alert variant="info">
            <p className="text-sm">
              Por seguridad, confirma tu contraseña para habilitar 2FA{selectedMethod === 'email' ? ' por email' : ' con app autenticadora'}.
            </p>
          </Alert>

          {error && (
            <Alert variant="error">
              <p>{error}</p>
            </Alert>
          )}

          <PasswordInput
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            disabled={isLoading}
            autoFocus
          />

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button 
              type="button"
              variant="secondary" 
              onClick={() => {
                setStep('select');
                setPassword('');
                setError(null);
              }}
              disabled={isLoading}
              className="w-full sm:w-1/2"
            >
              Atrás
            </Button>
            <Button
              type="submit"
              disabled={!password.trim() || isLoading}
              isLoading={isLoading}
              className="w-full sm:w-1/2"
            >
              {isLoading ? 'Verificando...' : 'Continuar'}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  // Renderizar paso de QR (solo para TOTP)
  if (step === 'qr' && qrData) {
    return (
      <Modal isOpen onClose={onClose} title="Escanea el Código QR">
        <div className="space-y-6">
          <Alert variant="info">
            <p className="text-sm">
              Escanea este código QR con tu app autenticadora (Google Authenticator, Authy, etc.)
            </p>
          </Alert>

          {error && (
            <Alert variant="error">
              <p>{error}</p>
            </Alert>
          )}

          {/* QR Code */}
          <div className="flex justify-center">
            <img 
              src={qrData.qr_code} 
              alt="QR Code" 
              className="w-64 h-64 border-2 border-slate-200 rounded-lg"
            />
          </div>

          {/* Secret Key */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              O ingresa esta clave manualmente:
            </label>
            <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <code className="text-sm font-mono break-all">{qrData.secret}</code>
            </div>
          </div>

          {/* Backup Codes */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Códigos de respaldo (guárdalos en un lugar seguro):
            </label>
            <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {qrData.backup_codes.map((code, index) => (
                  <code key={index} className="text-sm font-mono">
                    {code}
                  </code>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                setStep('verify');
                setError(null);
              }}
              className="w-full"
            >
              Continuar
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Renderizar paso de verificación (solo para TOTP)
  if (step === 'verify') {
    const handleVerifySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!verificationCode.trim()) {
        setError('Ingresa el código de 6 dígitos');
        return;
      }

      if (verificationCode.length !== 6) {
        setError('El código debe tener 6 dígitos');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await verify2FASetup(verificationCode);
        onComplete();
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'message' in err) {
          const errorMessage = err.message as string;
          setError(errorMessage);
          
          // Extraer intentos restantes del mensaje si existe
          // Ejemplo: "Código incorrecto. Te quedan 2 intento(s)."
          const attemptsMatch = errorMessage.match(/Te quedan (\d+) intento/);
          if (attemptsMatch) {
            setAttemptsRemaining(parseInt(attemptsMatch[1], 10));
          }
        } else {
          setError('Código incorrecto. Verifica tu app autenticadora.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Modal isOpen onClose={onClose} title="Verificar Código">
        <form onSubmit={handleVerifySubmit} className="space-y-6">
          <Alert variant="info">
            <p className="text-sm">
              Ingresa el código de 6 dígitos que aparece en tu app autenticadora para confirmar que todo funciona correctamente.
            </p>
          </Alert>

          {error && (
            <Alert variant="error">
              <p>{error}</p>
              {attemptsRemaining !== null && attemptsRemaining > 0 && (
                <p className="text-sm mt-1">
                  Intentos restantes: {attemptsRemaining}
                </p>
              )}
            </Alert>
          )}

          <div>
            <label htmlFor="verification-code" className="block text-sm font-medium text-slate-700 mb-2">
              Código de verificación
            </label>
            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setVerificationCode(value);
              }}
              placeholder="123456"
              disabled={isLoading}
              autoFocus
              className="w-full px-4 py-3 text-center text-2xl font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button 
              type="button"
              variant="secondary" 
              onClick={() => {
                setStep('qr');
                setVerificationCode('');
                setError(null);
              }}
              disabled={isLoading}
              className="w-full sm:w-1/2"
            >
              Atrás
            </Button>
            <Button
              type="submit"
              disabled={verificationCode.length !== 6 || isLoading}
              isLoading={isLoading}
              className="w-full sm:w-1/2"
            >
              {isLoading ? 'Verificando...' : 'Finalizar'}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
}


