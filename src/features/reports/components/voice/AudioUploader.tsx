/**
 * Componente para cargar archivos de audio
 */
import { useState, useRef } from 'react';
import { Upload, X, FileAudio } from 'lucide-react';

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}

export function AudioUploader({
  onFileSelect,
  acceptedFormats = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/ogg', 'audio/webm'],
  maxSizeMB = 25,
}: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validar tipo
    if (!acceptedFormats.includes(file.type)) {
      return `Formato no soportado. Formatos permitidos: MP3, WAV, M4A, OGG, WEBM`;
    }

    // Validar tamaño
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `Archivo muy grande (${sizeMB.toFixed(2)}MB). Tamaño máximo: ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Zona de drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="space-y-2">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Haz clic para seleccionar
              </span>{' '}
              o arrastra un archivo de audio aquí
            </div>
            <p className="text-xs text-gray-500">
              MP3, WAV, M4A, OGG, WEBM hasta {maxSizeMB}MB
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white rounded-md p-4">
            <div className="flex items-center space-x-3">
              <div className="shrink-0">
                <FileAudio className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="shrink-0 ml-4 text-red-600 hover:text-red-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
