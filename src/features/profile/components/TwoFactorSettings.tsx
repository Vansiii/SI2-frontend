import { useState, useEffect } from 'react';
import { Shield, Check, Smartphone, Mail } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { LoadingState } from '../../../components/ui/LoadingState';
import {
  get2FAStatus,
  type TwoFactorStatus,
} from '../../auth/services/twoFactor';
import { TwoFactorSetupModal } from './TwoFactorSetupModal';
import { TwoFactorDisableModal } from './TwoFactorDisableModal';
import { TwoFactorMethodModal } from './TwoFactorMethodModal';

export function TwoFactorSettings() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  // Auto-dismiss error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [error]);

  const loadStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await get2FAStatus();
      setStatus(data);
    } catch (err) {
      setError('Error al cargar el estado de 2FA');
      console.error('Error loading 2FA status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetupModal(false);
    loadStatus();
  };

  const handleDisableComplete = () => {
    setShowDisableModal(false);
    loadStatus();
  };

  const handleMethodChange = () => {
    setShowMethodModal(false);
    loadStatus();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const getMethodLabel = (method?: 'totp' | 'email') => {
    if (!method) return 'App Autenticadora (TOTP)';
    return method === 'totp' ? 'App Autenticadora (TOTP)' : 'Código por Email';
  };

  const getMethodIcon = (method?: 'totp' | 'email') => {
    if (!method || method === 'totp') {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Mail className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6">
        <Alert variant="error">
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Autenticación de Dos Factores (2FA)
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Agrega una capa adicional de seguridad a tu cuenta
        </p>

        {status?.is_enabled ? (
          <div className="space-y-4">
            {/* Estado Habilitado */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <Check className="h-4 w-4" />
                Habilitado
              </div>
            </div>

            {/* Método Actual */}
            <div>
              <label className="text-sm font-medium text-slate-700">Método Actual</label>
              <div className="mt-1 flex items-center gap-2 text-base text-slate-900">
                {getMethodIcon(status.method)}
                {getMethodLabel(status.method)}
              </div>
            </div>

            {/* Fecha de Habilitación */}
            {status.enabled_at && (
              <div>
                <label className="text-sm font-medium text-slate-700">Habilitado desde</label>
                <p className="mt-1 text-base text-slate-900">
                  {formatDate(status.enabled_at)}
                </p>
              </div>
            )}

            {/* Códigos de Respaldo (solo para TOTP) */}
            {(!status.method || status.method === 'totp') && (
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Códigos de respaldo restantes
                </label>
                <p className="mt-1 text-base text-slate-900">
                  {status.backup_codes_remaining} de 10
                </p>
                {status.backup_codes_remaining < 3 && (
                  <p className="mt-1 text-xs text-yellow-600">
                    Te quedan pocos códigos de respaldo. Considera regenerarlos.
                  </p>
                )}
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowMethodModal(true)}
                className="w-full sm:w-auto"
              >
                Cambiar Método
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDisableModal(true)}
                className="w-full sm:w-auto"
              >
                Deshabilitar 2FA
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Estado Deshabilitado */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                Deshabilitado
              </div>
            </div>

            <p className="text-sm text-slate-600">
              La autenticación de dos factores no está habilitada. Te recomendamos activarla
              para proteger mejor tu cuenta.
            </p>

            {/* Botón Habilitar */}
            <Button onClick={() => setShowSetupModal(true)} className="w-full sm:w-auto">
              Habilitar 2FA
            </Button>
          </div>
        )}
      </div>

      {/* Modales */}
      {showSetupModal && (
        <TwoFactorSetupModal
          onClose={() => setShowSetupModal(false)}
          onComplete={handleSetupComplete}
        />
      )}

      {showDisableModal && (
        <TwoFactorDisableModal
          onClose={() => setShowDisableModal(false)}
          onComplete={handleDisableComplete}
        />
      )}

      {showMethodModal && status && (
        <TwoFactorMethodModal
          currentMethod={status.method || 'totp'}
          onClose={() => setShowMethodModal(false)}
          onComplete={handleMethodChange}
        />
      )}
    </>
  );
}


