/**
 * Componente para listar y gestionar documentos de solicitud de crédito
 */

import { useState } from 'react';
import { uploadLoanApplicationDocument, type LoanApplicationDocument } from '../services/loansApi';

interface DocumentListProps {
  applicationId: number;
  documents: LoanApplicationDocument[];
  onDocumentUploaded: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'ID_DOCUMENT', label: 'Documento de Identidad' },
  { value: 'INCOME_PROOF', label: 'Comprobante de Ingresos' },
  { value: 'BANK_STATEMENT', label: 'Estado de Cuenta Bancario' },
  { value: 'EMPLOYMENT_LETTER', label: 'Carta Laboral' },
  { value: 'TAX_RETURN', label: 'Declaración de Renta' },
  { value: 'PROPERTY_DEED', label: 'Escritura de Propiedad' },
  { value: 'OTHER', label: 'Otro' },
];

export function DocumentList({ applicationId, documents, onDocumentUploaded }: DocumentListProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no puede ser mayor a 10MB');
        return;
      }
      
      // Validar tipo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Solo se permiten archivos PDF, JPG y PNG');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      setError('Selecciona un archivo y tipo de documento');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      await uploadLoanApplicationDocument(
        applicationId,
        selectedFile,
        documentType,
        description
      );
      
      // Limpiar formulario
      setSelectedFile(null);
      setDocumentType('');
      setDescription('');
      setShowUploadForm(false);
      
      // Notificar al padre
      onDocumentUploaded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = DOCUMENT_TYPES.find(dt => dt.value === type);
    return docType?.label || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return (
        <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Botón para agregar documento */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Documentos ({documents.length})
        </h3>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Subir Documento
        </button>
      </div>

      {/* Formulario de upload */}
      {showUploadForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Subir Nuevo Documento</h4>
          
          <div className="space-y-4">
            {/* Tipo de documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento *
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar tipo</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Formatos permitidos: PDF, JPG, PNG. Tamaño máximo: 10MB
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (Opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción adicional del documento..."
              />
            </div>

            {/* Vista previa del archivo */}
            {selectedFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center">
                  {getFileIcon(selectedFile.name)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
                    <p className="text-xs text-blue-700">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                  setDocumentType('');
                  setDescription('');
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !documentType}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subiendo...
                  </>
                ) : (
                  'Subir Documento'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de documentos */}
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">No hay documentos</p>
          <p className="text-gray-500">Sube documentos para completar la solicitud</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  {getFileIcon(document.file_name)}
                  <div className="ml-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {getDocumentTypeLabel(document.document_type)}
                      </h4>
                      {document.is_verified && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Verificado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{document.file_name}</p>
                    {document.description && (
                      <p className="text-sm text-gray-500 mt-1">{document.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>Subido por {document.uploaded_by_name}</span>
                      <span>{new Date(document.created_at).toLocaleDateString()}</span>
                    </div>
                    {document.verified_by_name && (
                      <p className="text-xs text-green-600 mt-1">
                        Verificado por {document.verified_by_name} el {new Date(document.verified_at!).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {document.file_url && (
                    <a
                      href={document.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded hover:bg-blue-50"
                    >
                      Ver
                    </a>
                  )}
                  <a
                    href={document.file}
                    download={document.file_name}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Descargar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}