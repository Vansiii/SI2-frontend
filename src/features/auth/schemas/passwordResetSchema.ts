import { z } from 'zod';

/**
 * Schema de validación para solicitar recuperación de contraseña
 */
export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresa un email válido'),
});

export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>;

/**
 * Schema de validación para confirmar nueva contraseña
 */
export const passwordResetConfirmSchema = z.object({
  new_password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirm_password: z
    .string()
    .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
});

export type PasswordResetConfirmFormData = z.infer<typeof passwordResetConfirmSchema>;
