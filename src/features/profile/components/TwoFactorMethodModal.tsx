import { useState, useEffect } from 'react';
import { Lock, Smartphone, Mail } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { Alert } from '../../../components/ui/Alert';
import { set2FAMethod, enable2FA, verify2FASetup } from '../../auth/services/twoFactor';
import type { TwoFactorEnableResponse } from '../../auth/services/twoFactor';

interface TwoFactorMethodModalProps {
  currentMethod: 'totp' | 'email';
  onClose: () => void;
  onComplete: () => void;
}

export function TwoFactorMethodModal({
  currentMethod,
  onClose,
  onComplete,
}: TwoFactorMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'email'>(currentMethod);
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'select' | 'qr' | 'verify'>('select');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError('La contraseña es obligatoria');
      return;
    }

    if (selectedMethod === currentMethod) {
      setError('Selecciona un método diferente al actual');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Cambiar método (esto mantiene el 2FA habilitado)
      await set2FAMethod(selectedMethod, password);
      
      // Si cambia a TOTP, generar nuevo QR para configurar la app
      if (selectedMethod === 'totp') {
        const response = await enable2FA(password);
        setQrData(response);
        setStep('qr');
      } else {
        // Si cambia a email, completar inmediatamente
        onComplete();
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('Error al cambiar el método. Verifica tu contraseña.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  // Paso de selección y contraseña
  if (step === 'select') {
    return (
      <Modal isOpen onClose={onClose} title="Cambiar Método de 2FA">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Selecciona el nuevo método:
            </h3>

            <div className="space-y-3">
              {/* Opción TOTP */}
              <button
                type="button"
                onClick={() => setSelectedMethod('totp')}
                disabled={isLoading}
                className={`w-full flex items-start gap-4 p-4 border-2 rounded-lg transition-colors ${
                  selectedMethod === 'totp'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-full shrink-0 ${
                    selectedMethod === 'totp' ? 'bg-blue-600' : 'bg-gray-100'
                  }`}
                >
                  <Smartphone
                    className={`h-5 w-5 ${
                      selectedMethod === 'totp' ? 'text-white' : 'text-gray-600'
                    }`}
                  />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900">App Autenticadora (TOTP)</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Códigos generados por Google Authenticator o similar
                  </p>
                </div>
              </button>

              {/* Opción Email */}
              <button
                type="button"
                onClick={() => setSelectedMethod('email')}
                disabled={isLoading}
                className={`w-full flex items-start gap-4 p-4 border-2 rounded-lg transition-colors ${
                  selectedMethod === 'email'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-full shrink-0 ${
                    selectedMethod === 'email' ? 'bg-blue-600' : 'bg-gray-100'
                  }`}
                >
                  <Mail
                    className={`h-5 w-5 ${
                      selectedMethod === 'email' ? 'text-white' : 'text-gray-600'
                    }`}
                  />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900">Código por Email</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Códigos enviados a tu correo electrónico
                  </p>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <Alert variant="error">
              <p>{error}</p>
            </Alert>
          )}

          <div>
            <p className="text-sm text-gray-600 mb-4">
              Para confirmar el cambio, ingresa tu contraseña:
            </p>
            <PasswordInput
              id="password"
              label="Contraseña"
              placeholder="Tu contraseña actual"
              icon={<Lock />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-1/2"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || !password || selectedMethod === currentMethod}
              className="w-full sm:w-1/2"
            >
              {isLoading ? 'Cambiando...' : 'Cambiar Método'}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  // Paso de QR (solo para cambio a TOTP)
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
              className="w-64 h-64 border-2 border-gray-200 rounded-lg"
            />
          </div>

          {/* Secret Key */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              O ingresa esta clave manualmente:
            </label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <code className="text-sm font-mono break-all">{qrData.secret}</code>
            </div>
          </div>

          {/* Backup Codes */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Códigos de respaldo (guárdalos en un lugar seguro):
            </label>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
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

  // Paso de verificación (solo para cambio a TOTP)
  if (step === 'verify') {
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
            <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
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
