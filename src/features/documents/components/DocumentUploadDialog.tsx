import React, { useState, useRef } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Badge } from '../../../components/ui/Badge';
import { useUploadDocument } from '../hooks/useDocuments';
import { Upload, FileText, AlertCircle, X, CheckCircle } from 'lucide-react';
import type { LoanApplicationDocumentRequirement } from '../types/document.types';

interface DocumentUploadDialogProps {
  open: boolean;
  onClose: () => void;
  documentId: number;
  document: LoanApplicationDocumentRequirement;
  onUploadSuccess: () => void;
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onClose,
  documentId,
  document,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadDocument();

  const validateFile = (file: File): string | null => {
    // Validar extensión
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!document.allowed_formats.includes(fileExtension)) {
      return `Formato no permitido. Formatos aceptados: ${document.allowed_formats.join(', ')}`;
    }

    // Validar tamaño
    const maxSizeBytes = document.max_file_size_mb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo es muy grande. Tamaño máximo: ${document.max_file_size_mb} MB`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      setSelectedFile(null);
    } else {
      setValidationError(null);
      setSelectedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync({
        id: documentId,
        file: selectedFile,
      });
      onUploadSuccess();
    } catch (error) {
      // El error ya se maneja en el hook con toast
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Cargar Documento
              </h2>
              <p className="text-sm text-gray-600">
                {document.document_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Información del documento */}
          <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                {document.description && (
                  <p className="text-sm text-blue-900 mb-2">
                    {document.description}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {document.is_mandatory && (
                    <Badge variant="warning" size="sm">
                      Obligatorio
                    </Badge>
                  )}
                  <span className="text-xs text-blue-700">
                    Formatos: {document.allowed_formats.join(', ')}
                  </span>
                  <span className="text-xs text-blue-700">
                    Tamaño máximo: {document.max_file_size_mb} MB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Área de carga */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center
              transition-all duration-200
              ${dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${selectedFile ? 'bg-green-50 border-green-300' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept={document.allowed_formats.join(',')}
              className="hidden"
            />

            {!selectedFile ? (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">
                  Arrastra tu archivo aquí o haz click para seleccionar
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--tenant-primary-soft, rgba(37, 99, 235, 0.12))',
                    color: 'var(--tenant-primary, #2563EB)',
                  }}
                >
                  Seleccionar archivo
                </button>
              </>
            ) : (
              <>
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-green-700" />
                  <p className="text-green-900 font-medium">
                    {selectedFile.name}
                  </p>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  {formatFileSize(selectedFile.size)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setValidationError(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Cambiar archivo
                </button>
              </>
            )}
          </div>

          {/* Error de validación */}
          {validationError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{validationError}</p>
              </div>
            </div>
          )}

          {/* Error de carga */}
          {uploadMutation.isError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">
                  Error al cargar el documento. Por favor, intenta nuevamente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={uploadMutation.isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--tenant-primary, #2563EB)',
                color: 'var(--tenant-on-primary, #FFFFFF)',
              }}
            >
              {uploadMutation.isPending ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Cargando...
                </>
              ) : (
                <>
                  <Upload className="inline-block h-4 w-4 mr-2" />
                  Cargar documento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
