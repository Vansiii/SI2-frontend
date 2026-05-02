import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Layout principal con sidebar y header
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex selection:bg-blue-100 selection:text-blue-900 font-sans" style={{ backgroundColor: 'var(--tenant-background)', color: 'var(--tenant-text)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}



