import { FileCheck } from 'lucide-react';
import { StaffDocumentsPage } from './StaffDocumentsPage';

/**
 * Página centralizada de Gestión Documental (CU-12)
 * 
 * Proporciona acceso unificado a la revisión de documentos de solicitudes de crédito
 */
export function DocumentManagementPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header with Glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-(--tenant-primary-soft) opacity-50 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-(--tenant-primary) font-bold text-xs tracking-wider uppercase">
              <FileCheck className="h-3.5 w-3.5" />
              Operaciones
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Gestión Documental
            </h1>
            <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
              Analiza, aprueba o rechaza los documentos cargados por los clientes en sus expedientes de crédito para avanzar el proceso.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative mt-6">
        <StaffDocumentsPage embedded />
      </div>
    </div>
  );
}
