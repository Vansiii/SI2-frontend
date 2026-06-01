/**
 * Modal para configurar backups automáticos
 * Se integra dentro de la página de backups del tenant
 */

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Save, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { backupsApi } from '../../saas/services/backupsApi';
import type { BackupScheduleConfig } from '../types/backup.types';

interface AutomaticBackupModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: number;
  tenantName: string;
}

export function AutomaticBackupModal({
  open,
  onClose,
  tenantId,
  tenantName,
}: AutomaticBackupModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingConfig, setExistingConfig] = useState<BackupScheduleConfig | null>(null);

  // Form state
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hour, setHour] = useState(2);
  const [minute, setMinute] = useState(0);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [retentionDays, setRetentionDays] = useState(30);
  const [includeFiles, setIncludeFiles] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (open) {
      // Resetear estados al abrir el modal
      setSuccess(false);
      setError(null);
      setSaving(false);
      loadExistingConfig();
    }
  }, [open, tenantId]);

  const loadExistingConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const configs = await backupsApi.getSchedules();
      
      // Buscar configuración para este tenant
      const config = configs.find((c) => c.tenant === tenantId);
      
      if (config) {
        setExistingConfig(config);
        setFrequency(config.frequency);
        setHour(config.hour ?? 2);
        setMinute(config.minute ?? 0);
        setDayOfWeek(config.day_of_week || 1);
        setDayOfMonth(config.day_of_month || 1);
        setRetentionDays(config.retention_days);
        setIncludeFiles(config.include_physical_files);
        setIsEnabled(config.is_enabled);
      }
    } catch (err: any) {
      console.error('Error loading config:', err);
      setError(err.response?.data?.detail || 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const data: any = {
        tenant: tenantId,
        frequency,
        hour,
        minute,
        day_of_week: frequency === 'weekly' ? dayOfWeek : null,
        day_of_month: frequency === 'monthly' ? dayOfMonth : null,
        retention_days: retentionDays,
        include_physical_files: includeFiles,
        is_enabled: isEnabled,
        backup_type: 'full',
        include_audit_logs: false,
        max_backups_to_keep: 10,
        notify_on_success: false,
        notify_on_failure: true,
        notification_emails: [],
      };

      if (existingConfig) {
        // Actualizar configuración existente
        await backupsApi.updateSchedule(existingConfig.id, data);
      } else {
        // Crear nueva configuración
        await backupsApi.createSchedule(data);
      }

      setSuccess(true);
      
      // Recargar la configuración actualizada
      await loadExistingConfig();
      
      // Cerrar modal después de 1.5 segundos
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error saving config:', err);
      setError(err.response?.data?.detail || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingConfig) return;
    
    if (!confirm('¿Estás seguro de eliminar la configuración de backups automáticos?')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await backupsApi.deleteSchedule(existingConfig.id);
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error deleting config:', err);
      setError(err.response?.data?.detail || 'Error al eliminar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Backups Automáticos</h2>
              <p className="text-blue-100 text-sm">{tenantName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={saving}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  Configuración guardada exitosamente
                </div>
              )}

              {/* Estado */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {isEnabled ? 'Backups Habilitados' : 'Backups Deshabilitados'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {isEnabled ? 'Los backups se ejecutarán automáticamente' : 'Los backups automáticos están pausados'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Frecuencia */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Frecuencia
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`p-3 rounded-xl border-2 transition-all font-medium text-sm ${
                        frequency === freq
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {freq === 'daily' && 'Diario'}
                      {freq === 'weekly' && 'Semanal'}
                      {freq === 'monthly' && 'Mensual'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hora */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Hora de Ejecución
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={hour}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setHour(Math.max(0, Math.min(23, val)));
                        }
                      }}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Hora (0-23)"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minute}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setMinute(Math.max(0, Math.min(59, val)));
                        }
                      }}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Minuto (0-59)"
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Los backups se ejecutarán a las {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')} (hora del servidor)
                </p>
              </div>

              {/* Día de la semana (solo para semanal) */}
              {frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Día de la Semana
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>Lunes</option>
                    <option value={2}>Martes</option>
                    <option value={3}>Miércoles</option>
                    <option value={4}>Jueves</option>
                    <option value={5}>Viernes</option>
                    <option value={6}>Sábado</option>
                    <option value={0}>Domingo</option>
                  </select>
                </div>
              )}

              {/* Día del mes (solo para mensual) */}
              {frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Día del Mes
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Día del mes (1-28) en que se ejecutará el backup
                  </p>
                </div>
              )}

              {/* Retención */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Días de Retención
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Los backups se eliminarán automáticamente después de este período
                </p>
              </div>

              {/* Incluir archivos */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  id="include-files"
                  checked={includeFiles}
                  onChange={(e) => setIncludeFiles(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="include-files" className="flex-1 cursor-pointer">
                  <p className="font-semibold text-slate-900">Incluir Archivos</p>
                  <p className="text-sm text-slate-600">
                    Incluir archivos adjuntos en el backup (aumenta el tamaño)
                  </p>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
                {existingConfig && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all font-medium text-sm disabled:opacity-50"
                  >
                    Eliminar Configuración
                  </button>
                )}
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all font-medium text-sm disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || success}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-medium text-sm shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {existingConfig ? 'Actualizar' : 'Guardar'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
