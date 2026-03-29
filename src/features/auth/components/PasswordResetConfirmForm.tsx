import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  passwordResetConfirmSchema,
  type PasswordResetConfirmFormData,
} from '../schemas/passwordResetSchema';

interface PasswordResetConfirmFormProps {
  onSubmit: (data: PasswordResetConfirmFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  passwordErrors: string[];
  tokenError: boolean;
}

export function PasswordResetConfirmForm({
  onSubmit,
  isLoading,
  error,
  passwordErrors,
  tokenError,
}: PasswordResetConfirmFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetConfirmFormData>({
    resolver: zodResolver(passwordResetConfirmSchema),
  });

  if (tokenError) {
    return (
      <div className="space-y-6">
        <Alert variant="error">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Enlace inválido o expirado</p>
              <p className="mt-1 text-sm">
                Este enlace de recuperación no es válido o ha expirado.
              </p>
            </div>
          </div>
        </Alert>

        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Solicitar nuevo enlace de recuperación
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error general */}
      {error && (
        <Alert variant="error">
          <p>{error}</p>
        </Alert>
      )}

      {/* Errores de validación de contraseña del backend */}
      {passwordErrors.length > 0 && (
        <Alert variant="error">
          <div>
            <p className="font-medium mb-2">La contraseña no cumple con los requisitos:</p>
            <ul className="space-y-1 text-sm ml-2">
              {passwordErrors.map((err, index) => (
                <li key={index}>• {err}</li>
              ))}
            </ul>
          </div>
        </Alert>
      )}

      {/* Campo Nueva Contraseña */}
      <PasswordInput
        id="new_password"
        label="Nueva Contraseña"
        placeholder="Mínimo 8 caracteres"
        icon={<Lock />}
        error={errors.new_password?.message}
        disabled={isLoading}
        autoFocus
        {...register('new_password')}
      />

      {/* Campo Confirmar Contraseña */}
      <PasswordInput
        id="confirm_password"
        label="Confirmar Contraseña"
        placeholder="Repite tu nueva contraseña"
        icon={<Lock />}
        error={errors.confirm_password?.message}
        disabled={isLoading}
        {...register('confirm_password')}
      />

      {/* Botón Submit */}
      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
      </Button>
    </form>
  );
}
