/**
 * Visualizador de transcripción de audio
 */
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface TranscriptionViewerProps {
  transcription: string;
  language?: string;
  confidence?: number;
  duration?: number;
}

export function TranscriptionViewer({
  transcription,
  language = 'es',
  confidence,
  duration,
}: TranscriptionViewerProps) {
  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.9) return 'text-green-600';
    if (conf >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (conf: number) => {
    if (conf >= 0.7) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Transcripción</h3>

        {confidence !== undefined && (
          <div className="flex items-center space-x-2">
            {getConfidenceIcon(confidence)}
            <span className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
              Confianza: {(confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        {language && <span>Idioma: {language.toUpperCase()}</span>}
        {duration !== undefined && <span>Duración: {duration.toFixed(1)}s</span>}
      </div>

      {/* Transcripción */}
      <div className="bg-gray-50 rounded-md p-4">
        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{transcription}</p>
      </div>

      {/* Advertencia si confianza es baja */}
      {confidence !== undefined && confidence < 0.7 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            La confianza de la transcripción es baja. Revisa cuidadosamente la configuración
            inferida.
          </p>
        </div>
      )}
    </div>
  );
}
