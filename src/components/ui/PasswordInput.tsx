import { InputHTMLAttributes, ReactNode, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const hasError = Boolean(error);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const inputClass = `focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-lg py-3 outline-none border transition-colors ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
    } ${icon ? 'pl-10' : 'pl-3'} pr-10`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">{icon}</div>
            </div>
          )}
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`${inputClass} ${className}`}
            aria-invalid={hasError}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
