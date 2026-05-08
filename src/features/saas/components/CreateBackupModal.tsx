/**
 * Modal rediseñado para crear un nuevo backup
 * Con opciones de archivos físicos y diseño mejorado
 */

import { useState } from 'react';
import { X, HardDrive, Database, FileArchive, AlertCircle, Loader, CheckCircle2 } from 'lucide-react';
import { backupsApi } from '../services/backupsApi';
import type { CreateBackupRequest } from '../types/backup.types';

interface CreateBackupModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: number;
  tenantName: string;
  onSuccess: () => void;
}

export function CreateBackupModal({
  open,
  onClose,
  tenantId,
  tenantName,
  onSuccess,
}: CreateBackupModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [includePhysicalFiles, setIncludePhysicalFiles] = useState(false);
  const [includeAuditLogs, setIncludeAuditLogs] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    if (!loading) {
      setNotes('');
      setIncludePhysicalFiles(false);
      setIncludeAuditLogs(false);
      setError(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const request: CreateBackupRequest = {
        backup_type: 'full',
        notes: notes || undefined,
        include_physical_files: includePhysicalFiles,
        include_audit_logs: includeAuditLogs,
      };

      await backupsApi.createBackup(tenantId, request);
      
      handleClose();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear el backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <HardDrive className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Crear Nuevo Backup</h2>
              <p className="text-sm text-slate-600 mt-0.5">{tenantName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
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

          {/* Backup Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Opciones de Backup
            </h3>

            {/* Option 1: With Files */}
            <label
              className={`relative flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                includePhysicalFiles
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="backup-type"
                checked={includePhysicalFiles}
                onChange={() => setIncludePhysicalFiles(true)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileArchive className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-slate-900">
                    Backup Completo (Con Archivos)
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Incluye todos los datos de la base de datos <strong>y archivos físicos</strong> (logos, documentos, PDFs).
                  Genera un archivo ZIP.
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <span className="text-slate-500">
                    <strong>Tamaño:</strong> ~50MB-5GB
                  </span>
                  <span className="text-slate-500">
                    <strong>Tiempo:</strong> ~2-10 minutos
                  </span>
                </div>
              </div>
            </label>

            {/* Option 2: Without Files */}
            <label
              className={`relative flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                !includePhysicalFiles
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="backup-type"
                checked={!includePhysicalFiles}
                onChange={() => setIncludePhysicalFiles(false)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-slate-900">
                    Backup Rápido (Solo Datos)
                  </span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Recomendado
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Solo incluye datos de la base de datos. <strong>No incluye archivos físicos</strong>.
                  Genera un archivo JSON.
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <span className="text-slate-500">
                    <strong>Tamaño:</strong> ~100KB-5MB
                  </span>
                  <span className="text-slate-500">
                    <strong>Tiempo:</strong> ~10-30 segundos
                  </span>
                </div>
              </div>
            </label>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Opciones Adicionales
            </h3>

            <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={includeAuditLogs}
                onChange={(e) => setIncludeAuditLogs(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-900">
                  Incluir logs de auditoría
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Puede aumentar significativamente el tamaño del backup (limitado a 10,000 registros)
                </p>
              </div>
            </label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Notas (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Backup antes de actualización de sistema"
              rows={3}
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">Importante</p>
              <p className="text-sm text-amber-700 mt-1">
                El proceso de backup puede tardar varios minutos dependiendo del tamaño de los datos
                y las opciones seleccionadas. El backup se ejecutará en segundo plano.
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-white rounded-xl transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 group"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Creando Backup...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Crear Backup
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
