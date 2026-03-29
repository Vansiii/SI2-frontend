import type { ReactNode } from 'react';
import { AppBar } from '../components/layout/AppBar';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout para páginas del dashboard (post-login)
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* AppBar fijo en la parte superior */}
      <AppBar />

      {/* Contenido principal */}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
