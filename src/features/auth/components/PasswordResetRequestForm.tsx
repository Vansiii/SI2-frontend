import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  passwordResetRequestSchema,
  type PasswordResetRequestFormData,
} from '../schemas/passwordResetSchema';

interface PasswordResetRequestFormProps {
  onSubmit: (data: PasswordResetRequestFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function PasswordResetRequestForm({
  onSubmit,
  isLoading,
  error,
  success,
}: PasswordResetRequestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Mensaje de éxito */}
      {success && (
        <Alert variant="info">
          <p className="text-sm">
            Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer
            tu contraseña.
          </p>
        </Alert>
      )}

      {/* Error general */}
      {error && !success && (
        <Alert variant="error">
          <p>{error}</p>
        </Alert>
      )}

      {/* Campo Email */}
      <Input
        id="email"
        type="email"
        label="Correo Electrónico"
        placeholder="tu@email.com"
        icon={<Mail />}
        error={errors.email?.message}
        disabled={isLoading || success}
        autoFocus
        {...register('email')}
      />

      {/* Botón Submit */}
      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        disabled={isLoading || success}
      >
        {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
      </Button>

      {/* Link Volver al Login */}
      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
