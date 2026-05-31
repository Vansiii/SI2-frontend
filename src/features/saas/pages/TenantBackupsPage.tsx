/**
 * Página rediseñada de gestión de backups de un tenant
 * Con funcionalidad de restore y descarga directa
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Archive,
  Plus,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  HardDrive,
  RotateCcw,
  FileArchive,
  Database,
  Calendar,
} from 'lucide-react';
import { BackupStatsWidget } from '../components/BackupStatsWidget';
import { CreateBackupModal } from '../components/CreateBackupModal';
import { BackupDetailModal } from '../components/BackupDetailModal';
import { RestoreBackupModal } from '../components/RestoreBackupModal';
import { AutomaticBackupModal } from '../../backups/components/AutomaticBackupModal';
import { backupsApi } from '../services/backupsApi';
import type { Backup } from '../types/backup.types';
import { LoadingState } from '../../../components/ui/LoadingState';

export function TenantBackupsPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [automaticBackupModalOpen, setAutomaticBackupModalOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    if (tenantId) {
      loadBackups();
    }
  }, [tenantId]);

  // Auto-refresh cada 30 segundos si hay backups en progreso o modal automático abierto
  useEffect(() => {
    if (!autoRefresh || !tenantId) return;

    const hasRunning = backups.some(
      (b) => b.status === 'pending' || b.status === 'running'
    );

    // Refrescar si hay backups corriendo O si el modal de automáticos está abierto
    if (hasRunning || automaticBackupModalOpen) {
      const interval = setInterval(() => {
        loadBackups();
      }, 10000); // 10 segundos para más responsividad

      return () => clearInterval(interval);
    }
  }, [autoRefresh, backups, tenantId, automaticBackupModalOpen]);

  const loadBackups = async () => {
    if (!tenantId) return;

    try {
      setError(null);
      const data = await backupsApi.listBackups(parseInt(tenantId));
      setBackups(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar backups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadBackups();
  };

  const handleViewDetail = (backup: Backup) => {
    setSelectedBackup(backup);
    setDetailModalOpen(true);
  };

  const handleRestore = (backup: Backup) => {
    setSelectedBackup(backup);
    setRestoreModalOpen(true);
  };

  const handleRestoreSuccess = () => {
    loadBackups();
  };

  const handleDownload = async (backup: Backup) => {
    try {
      setDownloading(backup.id);
      const { download_url } = await backupsApi.getDownloadUrl(
        parseInt(tenantId!),
        backup.id
      );
      
      // Generar nombre de archivo
      const isZip = backup.backup_path?.endsWith('.zip');
      const extension = isZip ? 'zip' : 'json';
      const filename = `backup_${backup.id}_${backup.tenant_name?.replace(/\s+/g, '_')}.${extension}`;
      
      // Descargar directamente
      await backupsApi.downloadBackupDirect(download_url, filename);
    } catch (err: any) {
      alert(err.message || 'Error al descargar backup');
    } finally {
      setDownloading(null);
    }
  };

  const getTenantName = () => {
    return backups[0]?.tenant_name || backups[0]?.tenant?.name || 'Tenant';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'running':
        return <Loader className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <Archive className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'running':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'expired':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
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

  const getBackupTypeIcon = (backupPath: string | undefined) => {
    if (backupPath?.endsWith('.zip')) {
      return <FileArchive className="h-4 w-4 text-blue-600" />;
    }
    return <Database className="h-4 w-4 text-green-600" />;
  };

  const getBackupTypeLabel = (backupPath: string | undefined) => {
    if (backupPath?.endsWith('.zip')) {
      return 'Con Archivos';
    }
    return 'Solo Datos';
  };

  if (loading) {
    return <LoadingState message="Cargando backups..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg">
              <HardDrive className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Gestión de Backups
              </h1>
              {backups.length > 0 && (
                <p className="text-slate-500 mt-1 text-sm font-medium">
                  {getTenantName()}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm">
              <input
                type="checkbox"
                id="auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all"
              />
              <label 
                htmlFor="auto-refresh" 
                className="cursor-pointer select-none"
              >
                <span className={autoRefresh ? 'text-slate-900' : 'text-slate-600'}>
                  Auto-actualización
                </span>
              </label>
            </div>
            <button
              onClick={loadBackups}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-all font-medium text-sm shadow-sm hover:shadow active:scale-95 group"
            >
              <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              Actualizar
            </button>
            <button
              onClick={() => setAutomaticBackupModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-purple-200 text-purple-700 hover:text-purple-800 hover:border-purple-300 hover:bg-purple-50 rounded-xl transition-all font-medium text-sm shadow-sm hover:shadow active:scale-95 group"
            >
              <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              Backups Automáticos
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-sm w-full sm:w-auto active:scale-95 group"
            >
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Crear Backup
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Widget */}
      {tenantId && (
        <div className="animate-in slide-in-from-bottom duration-300">
          <BackupStatsWidget 
            backups={backups}
            onRefresh={loadBackups}
          />
        </div>
      )}

      {/* Backups Grid/Table */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border border-slate-200 rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Archive className="h-4 w-4 text-slate-400" />
            Lista de Backups ({backups.length})
          </h2>
        </div>

        {backups.length === 0 ? (
          <div className="p-12 text-center bg-gradient-to-b from-slate-50 to-white">
            <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No hay backups disponibles
            </h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              Crea tu primer backup para proteger los datos de tu tenant
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-medium text-sm shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              Crear Primer Backup
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Expira
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Solicitado por
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-slate-100">
                {backups.map((backup, index) => (
                  <tr 
                    key={backup.id} 
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 animate-in fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                        #{backup.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getBackupTypeIcon(backup.backup_path)}
                        <span className="text-sm font-medium text-slate-700">
                          {getBackupTypeLabel(backup.backup_path)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
                          backup.status
                        )}`}
                      >
                        {getStatusIcon(backup.status)}
                        {getStatusLabel(backup.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-slate-900">
                        {backup.status === 'completed'
                          ? backupsApi.formatSize(backup.total_size_mb)
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">
                        {backupsApi.formatDate(backup.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">
                        {backupsApi.formatDate(backup.expires_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 line-clamp-1">
                        {backup.requested_by_email || backup.requested_by?.email || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(backup)}
                          className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all shadow-sm hover:shadow active:scale-90 group"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </button>
                        {backup.status === 'completed' && (
                          <>
                            <button
                              onClick={() => handleDownload(backup)}
                              disabled={downloading === backup.id}
                              className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 text-slate-600 hover:text-green-600 hover:border-green-300 hover:bg-green-50 rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 group"
                              title="Descargar"
                            >
                              {downloading === backup.id ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                              )}
                            </button>
                            <button
                              onClick={() => handleRestore(backup)}
                              className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 rounded-lg transition-all shadow-sm hover:shadow active:scale-90 group"
                              title="Restaurar"
                            >
                              <RotateCcw className="h-4 w-4 group-hover:-rotate-180 transition-transform duration-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {tenantId && (
        <>
          <CreateBackupModal
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            tenantId={parseInt(tenantId)}
            tenantName={getTenantName()}
            onSuccess={handleCreateSuccess}
          />

          <BackupDetailModal
            open={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            backup={selectedBackup}
            tenantId={parseInt(tenantId)}
          />

          <RestoreBackupModal
            open={restoreModalOpen}
            onClose={() => setRestoreModalOpen(false)}
            backup={selectedBackup}
            tenantId={parseInt(tenantId)}
            onSuccess={handleRestoreSuccess}
          />

          <AutomaticBackupModal
            open={automaticBackupModalOpen}
            onClose={() => {
              setAutomaticBackupModalOpen(false);
              loadBackups(); // Recargar backups al cerrar el modal
            }}
            tenantId={parseInt(tenantId)}
            tenantName={getTenantName()}
          />
        </>
      )}
    </div>
  );
}
