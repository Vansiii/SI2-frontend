import { useCallback, useState, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';

export interface FileUploadProps {
  label: string;
  accept: string;
  maxSizeMB: number;
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  disabled?: boolean;
  description?: string;
  previewShape?: 'square' | 'circle' | 'rectangle';
  error?: string;
  isDeleting?: boolean;  // Nuevo: indica si se está eliminando
}

export function FileUpload({
  label,
  accept,
  maxSizeMB,
  currentUrl,
  onUpload,
  onDelete,
  disabled = false,
  description,
  previewShape = 'square',
  error,
  isDeleting = false,  // Nuevo
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Validar tipo
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const isValidType = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return file.type.startsWith(category + '/');
        }
        return file.type === type;
      });

      if (!isValidType) {
        return `Tipo de archivo no permitido. Formatos aceptados: ${accept}`;
      }

      // Validar tamaño
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `El archivo no puede superar ${maxSizeMB} MB`;
      }

      return null;
    },
    [accept, maxSizeMB]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      // Crear preview
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      }

      // Upload
      try {
        setIsUploading(true);
        await onUpload(file);
        setPreviewUrl(null); // Limpiar preview después de upload exitoso
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Error al subir el archivo');
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, validateFile]
  );

  const handleFileInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input
      event.target.value = '';
    },
    [handleFile]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;

    if (!window.confirm('¿Eliminar este archivo?')) {
      return;
    }

    try {
      setIsUploading(true);
      await onDelete();
      setPreviewUrl(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al eliminar el archivo');
    } finally {
      setIsUploading(false);
    }
  }, [onDelete]);

  const displayUrl = previewUrl || currentUrl;
  const showError = error || uploadError;

  const previewClasses = {
    square: 'h-24 w-24 rounded-2xl',
    circle: 'h-24 w-24 rounded-full',
    rectangle: 'h-24 w-32 rounded-2xl',
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      {description && <p className="text-sm text-slate-500">{description}</p>}

      <div
        className={`relative rounded-2xl border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : showError
            ? 'border-red-300 bg-red-50'
            : 'border-slate-300 bg-slate-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Preview */}
            {displayUrl ? (
              <div className="relative">
                <img
                  src={displayUrl}
                  alt="Preview"
                  className={`${previewClasses[previewShape]} object-cover border border-slate-200 shadow-sm`}
                />
                {onDelete && !disabled && !isUploading && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <div
                className={`${previewClasses[previewShape]} flex items-center justify-center bg-slate-100 border border-slate-200`}
              >
                <FileImage className="h-8 w-8 text-slate-400" />
              </div>
            )}

            {/* Upload area */}
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700">
                  {isDragging ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-slate-500">
                  Formatos: {accept.split(',').join(', ')} • Máximo: {maxSizeMB} MB
                </p>
              </div>

              <label
                className={`inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors ${
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Subiendo...' : 'Seleccionar archivo'}
                <input
                  type="file"
                  accept={accept}
                  onChange={handleFileInput}
                  disabled={disabled || isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Loading overlay */}
          {(isUploading || isDeleting) && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-700">
                  {isDeleting ? 'Eliminando archivo...' : 'Subiendo archivo...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {showError && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{showError}</p>
        </div>
      )}
    </div>
  );
}
