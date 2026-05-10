/**
 * Modal para crear/editar plantillas
 */
import { X } from 'lucide-react';
import type { ReportTemplate, ReportConfig } from '../../types';
import { TemplateForm } from './TemplateForm';

interface TemplateModalProps {
  isOpen: boolean;
  template?: ReportTemplate;
  config: ReportConfig;
  onSave: (template: Partial<ReportTemplate>) => void;
  onClose: () => void;
}

export function TemplateModal({ isOpen, template, config, onSave, onClose }: TemplateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay con transparencia */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal centrado */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative z-50 bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {template ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Contenido */}
          <div className="px-6 py-4">
            <TemplateForm template={template} config={config} onSave={onSave} onCancel={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}
