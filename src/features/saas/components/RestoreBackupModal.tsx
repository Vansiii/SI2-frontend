/**
 * Modal para restaurar un backup
 * Con preview, dry-run y manejo de conflictos
 */

import { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  AlertTriangle,
  Loader,
  CheckCircle2,
  FileArchive,
  Database,
  AlertCircle,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { backupsApi } from '../services/backupsApi';
import type { Backup, RestorePreview, RestoreBackupRequest } from '../types/backup.types';

interface RestoreBackupModalProps {
  open: boolean;
  onClose: () => void;
  backup: Backup | null;
  tenantId: number;
  onSuccess: () => void;
}

type Step = 'preview' | 'options' | 'confirm' | 'restoring' | 'success';

export function RestoreBackupModal({
  open,
  onClose,
  backup,
  tenantId,
  onSuccess,
}: RestoreBackupModalProps) {
  const [step, setStep] = useState<Step>('preview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<RestorePreview | null>(null);
  const [conflictStrategy, setConflictStrategy] = useState<'skip' | 'overwrite' | 'fail'>('skip');
  const [restoreFiles, setRestoreFiles] = useState(true);
  const [dryRun, setDryRun] = useState(false);

  useEffect(() => {
    if (open && backup) {
      loadPreview();
    } else {
      resetState();
    }
  }, [open, backup]);

  const resetState = () => {
    setStep('preview');
    setLoading(false);
    setError(null);
    setPreview(null);
    setConflictStrategy('skip');
    setRestoreFiles(true);
    setDryRun(false);
  };

  const loadPreview = async () => {
    if (!backup) return;

    try {
      setLoading(true);
      setError(null);
      const data = await backupsApi.getRestorePreview(tenantId, backup.id);
      setPreview(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar preview');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!backup) return;

    try {
      setStep('restoring');
      setError(null);

      const request: RestoreBackupRequest = {
        conflict_strategy: conflictStrategy,
        restore_files: restoreFiles,
        dry_run: dryRun,
      };

      await backupsApi.restoreBackup(tenantId, backup.id, request);
      
      setStep('success');
      setTimeout(() => {
        handleClose();
        onSuccess();
        // Recargar la página para reflejar los cambios del restore
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al restaurar backup');
      setStep('options');
    }
  };

  const handleClose = () => {
    if (step !== 'restoring') {
      resetState();
      onClose();
    }
  };

  if (!open || !backup) return null;

  const isZipBackup = backup.backup_path?.endsWith('.zip');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-linear-to-r from-orange-50 to-red-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center">
              <RotateCcw className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Restaurar Backup</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Backup #{backup.id} - {backupsApi.formatDate(backup.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={step === 'restoring'}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-200">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && (
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-slate-600">Cargando preview...</p>
                </div>
              ) : preview ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Total Registros</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{preview.total_records}</p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-900">Conflictos</span>
                      </div>
                      <p className="text-2xl font-bold text-amber-900">{preview.potential_conflicts}</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileArchive className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Archivos</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">{preview.file_count}</p>
                    </div>
                  </div>

                  {/* Models Detail */}
                  {Object.keys(preview.models).length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                        Detalle por Modelo
                      </h3>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                        <div className="max-h-64 overflow-y-auto">
                          {Object.entries(preview.models).map(([modelPath, stats]) => (
                            <div
                              key={modelPath}
                              className="flex items-center justify-between p-3 border-b border-slate-200 last:border-b-0 hover:bg-white transition-colors"
                            >
                              <span className="text-sm font-medium text-slate-700">{modelPath}</span>
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1 text-green-600">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>{stats.new} nuevos</span>
                                </div>
                                <div className="flex items-center gap-1 text-amber-600">
                                  <Minus className="h-3 w-3" />
                                  <span>{stats.conflicts} conflictos</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-500">
                                  <span className="font-semibold">{stats.total}</span> total
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warning */}
                  {preview.potential_conflicts > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-900">Conflictos Detectados</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Se encontraron {preview.potential_conflicts} registros que ya existen en la base de datos.
                          Podrás elegir cómo manejarlos en el siguiente paso.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}

          {/* Step: Options */}
          {step === 'options' && (
            <div className="space-y-6">
              {/* Conflict Strategy */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Estrategia de Conflictos
                </h3>

                <label
                  className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    conflictStrategy === 'skip'
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 hover:border-green-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="conflict-strategy"
                    checked={conflictStrategy === 'skip'}
                    onChange={() => setConflictStrategy('skip')}
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">Omitir (Skip)</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Omite registros duplicados. Seguro, no sobrescribe datos actuales.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    conflictStrategy === 'overwrite'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-200 hover:border-orange-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="conflict-strategy"
                    checked={conflictStrategy === 'overwrite'}
                    onChange={() => setConflictStrategy('overwrite')}
                    className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">Sobrescribir (Overwrite)</span>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        Peligroso
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Sobrescribe registros existentes. Puede perder datos actuales.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    conflictStrategy === 'fail'
                      ? 'border-red-500 bg-red-50'
                      : 'border-slate-200 hover:border-red-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="conflict-strategy"
                    checked={conflictStrategy === 'fail'}
                    onChange={() => setConflictStrategy('fail')}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">Fallar (Fail)</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        Estricto
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Cancela la restauración si encuentra duplicados.
                    </p>
                  </div>
                </label>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Opciones Adicionales
                </h3>

                {isZipBackup && (
                  <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={restoreFiles}
                      onChange={(e) => setRestoreFiles(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-900">
                        Restaurar archivos físicos
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Restaura logos, documentos y otros archivos desde el backup ZIP
                      </p>
                    </div>
                  </label>
                )}

                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                    className="mt-0.5 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-900">
                      Modo simulación (Dry-run)
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Simula la restauración sin escribir en la base de datos
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  ¿Estás seguro de continuar?
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Esta acción restaurará el sistema al estado del backup seleccionado.
                  {conflictStrategy === 'overwrite' && (
                    <strong className="block mt-2">
                      ⚠️ Los datos actuales serán sobrescritos y no se podrán recuperar.
                    </strong>
                  )}
                </p>
                <div className="bg-white rounded-lg p-4 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Estrategia:</span>
                    <span className="font-semibold text-slate-900">
                      {conflictStrategy === 'skip' && 'Omitir duplicados'}
                      {conflictStrategy === 'overwrite' && 'Sobrescribir duplicados'}
                      {conflictStrategy === 'fail' && 'Fallar si hay duplicados'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Restaurar archivos:</span>
                    <span className="font-semibold text-slate-900">
                      {restoreFiles ? 'Sí' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Modo:</span>
                    <span className="font-semibold text-slate-900">
                      {dryRun ? 'Simulación' : 'Real'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step: Restoring */}
          {step === 'restoring' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="h-16 w-16 text-blue-600 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Restaurando Backup...
              </h3>
              <p className="text-sm text-slate-600 text-center max-w-md">
                Este proceso puede tardar varios minutos. Por favor no cierres esta ventana.
              </p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                ¡Restauración Completada!
              </h3>
              <p className="text-sm text-slate-600 text-center max-w-md">
                El backup se ha restaurado exitosamente. La página se recargará para mostrar los cambios...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          {step === 'preview' && (
            <>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-white rounded-xl transition-all font-medium text-sm active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={() => setStep('options')}
                disabled={loading || !preview}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group"
              >
                <span className="group-hover:translate-x-1 inline-block transition-transform">Continuar →</span>
              </button>
            </>
          )}

          {step === 'options' && (
            <>
              <button
                onClick={() => setStep('preview')}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-white rounded-xl transition-all font-medium text-sm active:scale-95 group"
              >
                <span className="group-hover:-translate-x-1 inline-block transition-transform">← Atrás</span>
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-sm active:scale-95 group"
              >
                <span className="group-hover:translate-x-1 inline-block transition-transform">Continuar →</span>
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <button
                onClick={() => setStep('options')}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-white rounded-xl transition-all font-medium text-sm active:scale-95 group"
              >
                <span className="group-hover:-translate-x-1 inline-block transition-transform">← Atrás</span>
              </button>
              <button
                onClick={handleRestore}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-sm flex items-center gap-2 active:scale-95 group"
              >
                <RotateCcw className="h-4 w-4 group-hover:-rotate-180 transition-transform duration-500" />
                {dryRun ? 'Simular Restauración' : 'Restaurar Ahora'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
