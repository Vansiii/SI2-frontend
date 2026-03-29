import { LoaderCircle } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message = 'Cargando...', size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoaderCircle className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
