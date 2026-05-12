/**
 * Página de generación de reportes por voz
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Upload, ArrowLeft } from 'lucide-react';
import {
  VoiceRecorder,
  AudioUploader,
  TranscriptionViewer,
  IntentEditor,
  ConfigurationReview,
  InterpretingAnimation,
} from '../components/voice';
import { LoadingSpinner, ErrorAlert, SuccessAlert } from '../components/common';
import { useVoiceReport } from '../hooks/useVoiceReport';
import { useReportGeneration } from '../hooks/useReportGeneration';
import type { ReportScope, ReportConfig, VoiceIntent } from '../types';

type Step = 'input' | 'transcription' | 'edit' | 'review' | 'generating';

export function VoiceReportPage() {
  const navigate = useNavigate();
  const { interpretAudio, interpreting, interpretation, error: interpretError } = useVoiceReport();
  const { generateReport, error: generateError } = useReportGeneration();

  const [step, setStep] = useState<Step>('input');
  const [inputMethod, setInputMethod] = useState<'record' | 'upload'>('record');
  const [scope, setScope] = useState<ReportScope>('TENANT');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [editedIntent, setEditedIntent] = useState<VoiceIntent | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRecordingComplete = (_blob: Blob, file: File) => {
    setAudioFile(file);
  };

  const handleFileSelect = (file: File) => {
    setAudioFile(file);
  };

  const handleInterpret = async () => {
    if (!audioFile) return;

    try {
      const result = await interpretAudio(audioFile, scope);
      // Crear VoiceIntent con campos adicionales de interpretación
      const voiceIntent: VoiceIntent = {
        ...result.proposed_config,
        interpretation_notes: result.interpretation_notes,
        confidence: result.confidence,
      };
      setEditedIntent(voiceIntent);
      setStep('transcription');
    } catch (err) {
      console.error('Error al interpretar audio:', err);
    }
  };

  const handleEditIntent = () => {
    setStep('edit');
  };

  const handleReviewConfig = () => {
    setStep('review');
  };

  const handleConfirmGeneration = async () => {
    if (!editedIntent) return;

    setStep('generating');
    try {
      // Construir configuración del reporte
      const reportConfig: ReportConfig = {
        scope: editedIntent.scope,
        category: editedIntent.category!,
        report_type: editedIntent.report_type!,
        date_range: editedIntent.date_range,
        filters: editedIntent.filters || [],
        columns: editedIntent.columns || [],
        group_by: editedIntent.group_by || [],
        sort: editedIntent.sort || [],
        format: editedIntent.format || 'xlsx',
      };
      
      await generateReport(reportConfig);
      setSuccess(true);
      setTimeout(() => {
        navigate('/reports/history');
      }, 2000);
    } catch (err) {
      console.error('Error al generar reporte:', err);
      setStep('review');
    }
  };

  const handleCancel = () => {
    setStep('input');
    setAudioFile(null);
    setEditedIntent(null);
    setSuccess(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/reports')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al Catálogo
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Generar Reporte por Voz</h1>
        <p className="mt-2 text-gray-600">
          Graba o sube un audio describiendo el reporte que necesitas
        </p>
      </div>

      {/* Alertas */}
      {interpretError && <ErrorAlert message={interpretError} />}
      {generateError && <ErrorAlert message={generateError} />}
      {success && <SuccessAlert message="Reporte generado exitosamente. Redirigiendo..." />}

      {/* Contenido según el paso */}
      {step === 'input' && (
        <div className="space-y-6">
          {/* Selector de scope */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ReportScope)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="TENANT">TENANT - Reportes del Tenant</option>
              <option value="SAAS">SAAS - Reportes del Sistema</option>
            </select>
          </div>

          {/* Selector de método */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Método de Entrada
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setInputMethod('record')}
                className={`flex-1 flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-colors ${
                  inputMethod === 'record'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Mic className="h-5 w-5 mr-2" />
                Grabar Audio
              </button>
              <button
                onClick={() => setInputMethod('upload')}
                className={`flex-1 flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-colors ${
                  inputMethod === 'upload'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Upload className="h-5 w-5 mr-2" />
                Subir Archivo
              </button>
            </div>
          </div>

          {/* Componente de entrada */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {inputMethod === 'record' ? (
              <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
            ) : (
              <AudioUploader onFileSelect={handleFileSelect} />
            )}
          </div>

          {/* Botón de interpretar */}
          {audioFile && !interpreting && (
            <div className="flex justify-end">
              <button
                onClick={handleInterpret}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Interpretar Audio
              </button>
            </div>
          )}

          {/* Animación de interpretación */}
          {interpreting && (
            <InterpretingAnimation 
              message="Interpretando tu solicitud..."
              showProgress={true}
            />
          )}
        </div>
      )}

      {step === 'transcription' && interpretation && (
        <div className="space-y-6">
          <TranscriptionViewer
            transcription={interpretation.transcription}
            language={interpretation.language || 'es'}
            confidence={interpretation.confidence}
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleEditIntent}
              className="px-6 py-3 border border-transparent rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 'edit' && editedIntent && (
        <div className="space-y-6">
          <IntentEditor
            intent={editedIntent}
            onChange={setEditedIntent}
            missingFields={interpretation?.missing_fields || []}
            unsupportedTerms={interpretation?.unsupported_terms || []}
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleReviewConfig}
              className="px-6 py-3 border border-transparent rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Revisar Configuración
            </button>
          </div>
        </div>
      )}

      {step === 'review' && editedIntent && interpretation && (
        <ConfigurationReview
          config={{
            scope: editedIntent.scope,
            category: editedIntent.category!,
            report_type: editedIntent.report_type!,
            date_range: editedIntent.date_range,
            filters: editedIntent.filters,
            columns: editedIntent.columns,
            group_by: editedIntent.group_by,
            sort: editedIntent.sort,
            format: editedIntent.format,
          }}
          transcription={interpretation.transcription}
          onConfirm={handleConfirmGeneration}
          onEdit={() => setStep('edit')}
          onCancel={handleCancel}
        />
      )}

      {step === 'generating' && (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-gray-700">Generando reporte...</p>
          <p className="mt-2 text-sm text-gray-500">Esto puede tomar unos momentos</p>
        </div>
      )}
    </div>
  );
}
