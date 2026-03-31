import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { Alert } from '../../../components/ui/Alert';
import { disable2FA } from '../../auth/services/twoFactor';

interface TwoFactorDisableModalProps {
  onClose: () => void;
  onComplete: () => void;
}

export function TwoFactorDisableModal({
  onClose,
  onComplete,
}: TwoFactorDisableModalProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-dismiss error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
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

    setIsLoading(true);
    setError(null);

    try {
      await disable2FA(password);
      onComplete();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('Error al deshabilitar 2FA. Verifica tu contraseña.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Deshabilitar 2FA">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Alert variant="warning">
          <div>
            <p className="font-medium">¿Estás seguro?</p>
            <p className="mt-1 text-sm">
              Deshabilitar la autenticación de dos factores hará que tu cuenta sea menos
              segura.
            </p>
          </div>
        </Alert>

        {error && (
          <Alert variant="error">
            <p>{error}</p>
          </Alert>
        )}

        <div>
          <p className="text-sm text-slate-600 mb-4">
            Para confirmar, ingresa tu contraseña actual:
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
            variant="danger"
            isLoading={isLoading}
            disabled={isLoading || !password}
            className="w-full sm:w-1/2"
          >
            {isLoading ? 'Deshabilitando...' : 'Deshabilitar 2FA'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


