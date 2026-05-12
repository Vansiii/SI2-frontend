/**
 * Componente para configurar documentos requeridos de un producto
 * 
 * Permite seleccionar documentos del catálogo y configurar:
 * - Si es obligatorio
 * - Orden de visualización
 * - Formatos permitidos
 * - Tamaño máximo
 * - Vigencia máxima
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { apiClient } from '../../../utils/apiClient';
import type { DocumentType, CreateDocumentRequirementData } from '../types';

interface DocumentRequirementsConfigProps {
  value: CreateDocumentRequirementData[];
  onChange: (requirements: CreateDocumentRequirementData[]) => void;
  disabled?: boolean;
}

export function DocumentRequirementsConfig({ 
  value, 
  onChange, 
  disabled 
}: DocumentRequirementsConfigProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);

  // Obtener tipos de documento disponibles
  const { data: documentTypesResponse, isLoading, error: queryError } = useQuery({
    queryKey: ['document-types', 'active'],
    queryFn: async () => {
      return await apiClient.get<DocumentType[] | { results: DocumentType[] }>(
        '/loans/catalogs/document-types/?is_active=true'
      );
    },
  });

  // Normalizar respuesta (puede ser array directo o paginado)
  const documentTypes = Array.isArray(documentTypesResponse) 
    ? documentTypesResponse 
    : documentTypesResponse?.results || [];

  console.log('DocumentTypes data:', documentTypes);
  console.log('DocumentTypes loading:', isLoading);
  console.log('DocumentTypes error:', queryError);


  // Agregar múltiples documentos
  const handleAddMultipleDocuments = () => {
    const newRequirements = selectedDocuments.map((documentTypeId, index) => {
      const documentType = documentTypes?.find(dt => dt.id === documentTypeId);
      if (!documentType) return null;

      return {
        document_type: documentTypeId,
        is_mandatory: true,
        display_order: value.length + index,
        allowed_formats: documentType.default_formats,
        max_file_size_mb: documentType.default_max_size_mb,
        max_validity_days: documentType.default_validity_days || undefined,
      } as CreateDocumentRequirementData;
    }).filter(Boolean) as CreateDocumentRequirementData[];

    onChange([...value, ...newRequirements]);
    setSelectedDocuments([]);
    setShowAddModal(false);
  };

  // Toggle selección de documento
  const toggleDocumentSelection = (documentTypeId: number) => {
    setSelectedDocuments(prev => 
      prev.includes(documentTypeId)
        ? prev.filter(id => id !== documentTypeId)
        : [...prev, documentTypeId]
    );
  };

  // Eliminar documento
  const handleRemoveDocument = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  // Actualizar documento
  const handleUpdateDocument = (
    index: number, 
    updates: Partial<CreateDocumentRequirementData>
  ) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], ...updates };
    onChange(newValue);
  };

  // Documentos ya agregados
  const addedDocumentIds = value.map(req => req.document_type);
  const availableDocuments = documentTypes?.filter(
    dt => !addedDocumentIds.includes(dt.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Documentos Requeridos
        </label>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          disabled={disabled || isLoading || !availableDocuments?.length}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar Documento
        </button>
      </div>

      {/* Lista de documentos requeridos */}
      {value.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-sm text-gray-500">
            No hay documentos requeridos configurados
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Haz clic en "Agregar Documento" para comenzar
          </p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="space-y-3">
            {value.map((requirement, index) => {
              const documentType = documentTypes?.find(
                dt => dt.id === requirement.document_type
              );
              
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {/* Drag handle */}
                    <div className="mt-1 cursor-move text-gray-400">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 space-y-3">
                      {/* Nombre del documento */}
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {documentType?.name || 'Documento desconocido'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(index)}
                          disabled={disabled}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Configuración */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Obligatorio */}
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={requirement.is_mandatory}
                            onChange={(e) => handleUpdateDocument(index, {
                              is_mandatory: e.target.checked
                            })}
                            disabled={disabled}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Obligatorio</span>
                        </label>

                        {/* Vigencia máxima */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Vigencia (días)
                          </label>
                          <input
                            type="number"
                            value={requirement.max_validity_days || ''}
                            onChange={(e) => handleUpdateDocument(index, {
                              max_validity_days: e.target.value ? Number(e.target.value) : undefined
                            })}
                            disabled={disabled}
                            placeholder="Opcional"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Tamaño máximo */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Tamaño máx. (MB)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={requirement.max_file_size_mb || ''}
                            onChange={(e) => handleUpdateDocument(index, {
                              max_file_size_mb: e.target.value
                            })}
                            disabled={disabled}
                            placeholder="Opcional"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Formatos permitidos */}
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-600 mb-1">
                            Formatos permitidos
                          </label>
                          <input
                            type="text"
                            value={requirement.allowed_formats?.join(', ') || ''}
                            onChange={(e) => handleUpdateDocument(index, {
                              allowed_formats: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
                            })}
                            disabled={disabled}
                            placeholder="pdf, jpg, png"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal para agregar documento */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Agregar Documentos Requeridos
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Selecciona uno o más documentos para agregar al producto
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {availableDocuments && availableDocuments.length > 0 ? (
                <div className="space-y-2">
                  {availableDocuments.map((documentType) => (
                    <label
                      key={documentType.id}
                      className={`
                        flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer
                        transition-all duration-200
                        ${selectedDocuments.includes(documentType.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(documentType.id)}
                        onChange={() => toggleDocumentSelection(documentType.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          {documentType.name}
                        </div>
                        {documentType.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {documentType.description}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100">
                            {documentType.category}
                          </span>
                          {documentType.default_formats && (
                            <span>
                              Formatos: {documentType.default_formats.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay documentos disponibles para agregar</p>
                  <p className="text-sm mt-1">Todos los documentos ya han sido agregados</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                {selectedDocuments.length > 0 && (
                  <span className="font-medium text-blue-600">
                    {selectedDocuments.length} documento{selectedDocuments.length !== 1 ? 's' : ''} seleccionado{selectedDocuments.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedDocuments([]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddMultipleDocuments}
                  disabled={selectedDocuments.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Agregar {selectedDocuments.length > 0 && `(${selectedDocuments.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Configura los documentos que serán requeridos para solicitar este producto.
      </p>
    </div>
  );
}
