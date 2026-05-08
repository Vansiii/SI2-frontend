/**
 * Modal mejorado para mostrar el detalle completo de un backup
 * Diseño responsivo, minimalista y con mejor UX/UI
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  Box,
  IconButton,
  CircularProgress,
  Collapse,
} from '@mui/material';
import {
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  Database,
  Clock,
  User,
  Calendar,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Archive,
  FileArchive,
  Activity,
  Info,
} from 'lucide-react';
import { backupsApi } from '../services/backupsApi';
import type { Backup, AuditLog } from '../types/backup.types';

interface BackupDetailModalProps {
  open: boolean;
  onClose: () => void;
  backup: Backup | null;
  tenantId: number;
}

export function BackupDetailModal({
  open,
  onClose,
  backup,
  tenantId,
}: BackupDetailModalProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [manifestExpanded, setManifestExpanded] = useState(false);
  const [logsExpanded, setLogsExpanded] = useState(false);

  useEffect(() => {
    if (open && backup) {
      loadAuditLogs();
    }
  }, [open, backup]);

  const loadAuditLogs = async () => {
    if (!backup) return;

    try {
      setLoadingLogs(true);
      const logs = await backupsApi.getAuditLogs(tenantId, backup.id);
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleDownload = async () => {
    if (!backup) return;

    try {
      setDownloading(true);
      const { download_url } = await backupsApi.getDownloadUrl(tenantId, backup.id);
      
      // Generar nombre de archivo basado en el tipo de backup
      const isFullBackup = backup.backup_type === 'full';
      const extension = isFullBackup ? 'zip' : 'json';
      const filename = `backup_${backup.id}_${backup.tenant_name?.replace(/\s+/g, '_')}.${extension}`;
      
      // Descargar directamente
      await backupsApi.downloadBackupDirect(download_url, filename);
    } catch (error: any) {
      alert(error.message || 'Error al descargar backup');
    } finally {
      setDownloading(false);
    }
  };

  if (!backup) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'running':
        return <Loader className="h-5 w-5 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'failed':
        return <XCircle className="h-5 w-5" />;
      case 'expired':
        return <Archive className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'running':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'expired':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      running: 'Ejecutando',
      completed: 'Completado',
      failed: 'Fallido',
      expired: 'Expirado',
    };
    return labels[status] || status;
  };

  const getBackupTypeIcon = () => {
    if (backup.backup_type === 'full') {
      return <FileArchive className="h-5 w-5 text-blue-600" />;
    }
    return <Database className="h-5 w-5 text-green-600" />;
  };

  const getBackupTypeLabel = () => {
    // Verificar si es un archivo ZIP (puede contener archivos)
    const isZipBackup = backup.backup_path?.endsWith('.zip');
    const hasFiles = backup.file_count && backup.file_count > 0;
    
    if (backup.backup_type === 'full') {
      if (isZipBackup) {
        // Es ZIP, mostrar si tiene archivos o no
        if (hasFiles) {
          return `Backup Completo (${backup.file_count} archivo${backup.file_count > 1 ? 's' : ''})`;
        } else {
          return 'Backup Completo (Sin archivos físicos)';
        }
      } else {
        // Es JSON, solo base de datos
        return 'Backup Completo (Solo Base de Datos)';
      }
    } else if (backup.backup_type === 'metadata_only') {
      return 'Backup de Datos (Solo Base de Datos)';
    } else if (backup.backup_type === 'storage_only') {
      return 'Backup de Archivos (Solo Storage)';
    } else {
      return 'Backup Completo';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'error':
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'error':
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          maxHeight: '90vh',
        },
      }}
    >
      {/* Header con gradiente */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          color: 'white',
          p: 3,
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getBackupTypeIcon()}
              </Box>
              <Box>
                <h2 className="text-2xl font-bold">Backup #{backup.id}</h2>
                <p className="text-white/80 text-sm mt-0.5">{getBackupTypeLabel()}</p>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(
                backup.status
              )}`}
            >
              {getStatusIcon(backup.status)}
              {getStatusLabel(backup.status)}
            </div>
            
            <IconButton
              onClick={onClose}
              sx={{
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <X className="h-5 w-5" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
        {/* Información General - Grid Responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Tamaño */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Tamaño Total
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {backup.status === 'completed'
                ? backupsApi.formatSize(backup.total_size_mb)
                : '-'}
            </p>
          </div>

          {/* Archivos */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Archivos
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {backup.file_count?.toLocaleString() || '0'}
            </p>
          </div>

          {/* Duración */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Duración
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {backup.duration_seconds
                ? backupsApi.formatDuration(backup.duration_seconds)
                : '-'}
            </p>
          </div>

          {/* Fecha Creación */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Fecha Creación
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {backupsApi.formatDate(backup.created_at)}
            </p>
          </div>

          {/* Fecha Expiración */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <Calendar className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Fecha Expiración
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {backupsApi.formatDate(backup.expires_at)}
            </p>
          </div>

          {/* Usuario */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <User className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Solicitado por
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 truncate">
              {backup.requested_by_email || backup.requested_by?.email || 'N/A'}
            </p>
          </div>
        </div>

        {/* Notas */}
        {backup.notes && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-900">Notas</span>
            </div>
            <p className="text-sm text-slate-700">{backup.notes}</p>
          </div>
        )}

        {/* Error Message */}
        {backup.error_message && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-semibold text-slate-900">Error</span>
            </div>
            <p className="text-sm text-slate-700">{backup.error_message}</p>
          </div>
        )}

        {/* Manifest - Collapsible */}
        {backup.manifest && (
          <div className="mb-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setManifestExpanded(!manifestExpanded)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-600" />
                <span className="font-semibold text-slate-900">Manifest del Backup</span>
              </div>
              {manifestExpanded ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>
            
            <Collapse in={manifestExpanded}>
              <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <span className="text-xs text-slate-600 font-medium">Total de Registros</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {backup.manifest.total_records.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <span className="text-xs text-slate-600 font-medium">Versión del Esquema</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {backup.manifest.schema_version}
                    </p>
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-slate-600 font-medium mb-2 block">
                    Tablas Incluidas
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {backup.manifest.included_tables.map((table) => (
                      <span
                        key={table}
                        className="px-3 py-1 bg-white text-slate-700 rounded-full text-xs font-medium border border-slate-200"
                      >
                        {table}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Collapse>
          </div>
        )}

        {/* Audit Logs - Collapsible */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => {
              setLogsExpanded(!logsExpanded);
              if (!logsExpanded && auditLogs.length === 0) {
                loadAuditLogs();
              }
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-600" />
              <span className="font-semibold text-slate-900">
                Logs de Auditoría ({auditLogs.length})
              </span>
            </div>
            {logsExpanded ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </button>
          
          <Collapse in={logsExpanded}>
            <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50">
              {loadingLogs ? (
                <div className="flex justify-center items-center py-8">
                  <CircularProgress size={32} />
                </div>
              ) : auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white rounded-lg p-3 border border-slate-200"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg border ${getSeverityColor(
                            log.severity
                          )}`}
                        >
                          {getSeverityIcon(log.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${getSeverityColor(
                                log.severity
                              )}`}
                            >
                              {log.severity}
                            </span>
                          </div>
                          <p className="text-sm text-slate-900 font-medium mb-2">
                            {log.description}
                          </p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {backupsApi.formatDate(log.created_at)}
                            </span>
                            {(log.actor_email || log.actor?.email) && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {log.actor_email || log.actor?.email}
                              </span>
                            )}
                            {log.ip_address && (
                              <span className="flex items-center gap-1">
                                <Database className="h-3 w-3" />
                                IP: {log.ip_address}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    No hay logs de auditoría disponibles
                  </p>
                </div>
              )}
            </div>
          </Collapse>
        </div>
      </Box>

      {/* Footer con acciones */}
      <Box
        sx={{
          p: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(to top, #f8fafc, #ffffff)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all font-medium text-sm shadow-sm hover:shadow active:scale-95"
        >
          Cerrar
        </button>
        
        {backup.status === 'completed' && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-medium text-sm shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {downloading ? (
              <>
                <CircularProgress size={18} sx={{ color: 'white' }} />
                Descargando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Descargar Backup
              </>
            )}
          </button>
        )}
      </Box>
    </Dialog>
  );
}