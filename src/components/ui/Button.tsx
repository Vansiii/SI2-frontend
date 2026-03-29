import { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClass = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'border border-transparent text-white bg-blue-600 hover:bg-blue-700',
    secondary: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
    danger: 'border border-transparent text-white bg-red-600 hover:bg-red-700',
    ghost: 'border border-transparent text-blue-600 bg-transparent hover:bg-blue-50',
  };

  const sizeClasses = {
    sm: 'py-2 px-3 text-xs',
    md: 'py-3 px-4 text-sm',
    lg: 'py-4 px-6 text-base',
  };

  return (
    <button
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
