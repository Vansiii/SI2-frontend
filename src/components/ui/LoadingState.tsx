import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  overlay?: boolean;
}

export function LoadingState({ message = 'Cargando...', size = 'md', fullScreen = false, overlay = false }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
        {/* Main spinner */}
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 relative z-10`} />
      </div>
      {message && (
        <p className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-slate-500 animate-pulse tracking-wide">
          {message}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-50/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
        {content}
      </div>
    );
  }

  if (fullScreen) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh] w-full">
        {content}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-12 w-full h-full min-h-[40vh]">
      {content}
    </div>
  );
}
