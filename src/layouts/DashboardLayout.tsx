import type { ReactNode } from 'react';
import { AppBar } from '../components/layout/AppBar';
import { Sidebar } from '../components/layout/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout para páginas del dashboard (post-login)
 * Incluye AppBar superior y Sidebar lateral con navegación
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--tenant-background)' }}>
      {/* AppBar fijo en la parte superior */}
      <AppBar />

      <div className="flex">
        {/* Sidebar lateral con navegación */}
        <Sidebar />
        
        {/* Contenido principal */}
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
