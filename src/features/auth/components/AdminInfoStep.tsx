import { LoaderCircle, Lock, Mail, User } from 'lucide-react';
import type { ChangeEvent, FormEvent } from 'react';
import type { RegistrationFieldErrors, SaasRegistrationData } from '../types';

interface Props {
  formData: SaasRegistrationData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBack: () => void;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  errors: RegistrationFieldErrors;
}

function inputClass(hasError: boolean): string {
  return `focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-lg py-3 outline-none border transition-colors ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`;
}

export function AdminInfoStep({
  formData,
  onChange,
  onBack,
  onSubmit,
  isSubmitting,
  errors,
}: Props) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
      {errors.form && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.form}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={onChange}
                className={`${inputClass(Boolean(errors.firstName))} pl-10`}
                placeholder="Ingresa tu nombre"
                aria-invalid={Boolean(errors.firstName)}
              />
            </div>
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Apellidos
            </label>
            <div className="mt-1">
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={onChange}
                className={`${inputClass(Boolean(errors.lastName))} px-3`}
                placeholder="Ingresa tus apellidos"
                aria-invalid={Boolean(errors.lastName)}
              />
            </div>
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico corporativo
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={onChange}
              className={`${inputClass(Boolean(errors.email))} pl-10`}
              placeholder="Ingresa tu correo electrónico corporativo"
              aria-invalid={Boolean(errors.email)}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={onChange}
              className={`${inputClass(Boolean(errors.password))} pl-10`}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmar contraseña
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={onChange}
              className={`${inputClass(Boolean(errors.confirmPassword))} pl-10`}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.confirmPassword)}
            />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="w-1/3 flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Atrás
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Registrando...
              </span>
            ) : (
              'Completar Registro'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
