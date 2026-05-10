/**
 * Página de gestión de plantillas
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TemplateList, TemplateModal } from '../components/templates';
import { ErrorAlert, SuccessAlert } from '../components/common';
import { useTemplates } from '../hooks/useTemplates';
import type { ReportTemplate, ReportConfig } from '../types';

export function TemplatesPage() {
  const navigate = useNavigate();
  const { templates, loading, create, update, deleteTemplate, error } = useTemplates();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | undefined>();
  const [currentConfig, setCurrentConfig] = useState<ReportConfig | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateNew = () => {
    // Redirigir al catálogo para seleccionar el tipo de reporte
    navigate('/reports', { 
      state: { 
        message: 'Selecciona un tipo de reporte para crear una nueva plantilla' 
      } 
    });
  };

  const handleEdit = (template: ReportTemplate) => {
    setCurrentConfig(template.config);
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleSave = async (templateData: Partial<ReportTemplate>) => {
    try {
      if (editingTemplate) {
        await update(editingTemplate.id, templateData);
        setSuccessMessage('Plantilla actualizada exitosamente');
      } else {
        await create(templateData);
        setSuccessMessage('Plantilla creada exitosamente');
      }
      setIsModalOpen(false);
      setEditingTemplate(undefined);
      setCurrentConfig(null);

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error al guardar plantilla:', err);
    }
  };

  const handleDelete = async (templateId: number) => {
    try {
      await deleteTemplate(templateId);
      setSuccessMessage('Plantilla eliminada exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error al eliminar plantilla:', err);
    }
  };

  const handleUse = (template: ReportTemplate) => {
    // Navegar al builder con la configuración de la plantilla
    const config = template.config;
    navigate(
      `/reports/builder?scope=${config.scope}&category=${config.category}&type=${config.report_type}`,
      { state: { config } }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/reports')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al Catálogo
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Plantillas de Reportes</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tus plantillas de reportes para generar reportes rápidamente
        </p>
      </div>

      {/* Alertas */}
      {error && <ErrorAlert message={error} />}
      {successMessage && <SuccessAlert message={successMessage} />}

      {/* Lista de plantillas */}
      <TemplateList
        templates={templates}
        loading={loading}
        onUse={handleUse}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
      />

      {/* Modal de creación/edición */}
      {currentConfig && (
        <TemplateModal
          isOpen={isModalOpen}
          template={editingTemplate}
          config={currentConfig}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTemplate(undefined);
            setCurrentConfig(null);
          }}
        />
      )}
    </div>
  );
}
