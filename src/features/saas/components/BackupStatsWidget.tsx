/**
 * Widget de estadísticas de backups con gráficos
 */

import { useEffect, useState } from 'react';
import {
  Archive,
  AlertTriangle,
  Clock,
  HardDrive,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { backupsApi } from '../services/backupsApi';
import type { Backup } from '../types/backup.types';

interface BackupStatsWidgetProps {
  tenantId: number;
  backups: Backup[];
  onRefresh?: () => void;
}

export function BackupStatsWidget({ tenantId, backups, onRefresh }: BackupStatsWidgetProps) {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calcular estadísticas desde los backups
  const stats = {
    expired: backups.filter(b => b.status === 'expired').length,
    failed: backups.filter(b => b.status === 'failed').length,
    expiring: backups.filter(b => {
      if (!b.expires_at) return false;
      const expiresAt = new Date(b.expires_at);
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      return expiresAt <= sevenDaysFromNow && b.status === 'completed';
    }).length,
    total: backups.length,
    totalSize: backups
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.total_size_mb, 0),
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLastUpdate(new Date());
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Calcular tiempo desde última actualización
  const getTimeSinceUpdate = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    
    if (diff < 60) return `hace ${diff}s`;
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    return `hace ${Math.floor(diff / 3600)}h`;
  };

  // Actualizar cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(prev => prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-md shadow-lg border border-slate-200 rounded-2xl p-6 animate-in fade-in duration-500">
      {/* Header con última actualización */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-400" />
          Estadísticas de Backups
        </h2>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-medium">{getTimeSinceUpdate()}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-50 group"
            title="Actualizar estadísticas"
          >
            <RefreshCw className={`h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-md hover:scale-105 cursor-pointer group animate-in slide-in-from-bottom duration-300">
          <div className="h-12 w-12 shrink-0 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <Archive className="h-6 w-6" />
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-900">{stats.expired}</div>
            <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Expirados</div>
            <div className="text-xs text-orange-600 mt-0.5">0.00 KB</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-md hover:scale-105 cursor-pointer group animate-in slide-in-from-bottom duration-300" style={{ animationDelay: '100ms' }}>
          <div className="h-12 w-12 shrink-0 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-3xl font-bold text-red-900">{stats.failed}</div>
            <div className="text-xs font-semibold text-red-700 uppercase tracking-wide">Fallidos</div>
            <div className="text-xs text-red-600 mt-0.5">Antiguos</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-md hover:scale-105 cursor-pointer group animate-in slide-in-from-bottom duration-300" style={{ animationDelay: '200ms' }}>
          <div className="h-12 w-12 shrink-0 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-900">{stats.expiring}</div>
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Por Expirar</div>
            <div className="text-xs text-blue-600 mt-0.5">Próximos 7 días</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-md hover:scale-105 cursor-pointer group animate-in slide-in-from-bottom duration-300" style={{ animationDelay: '300ms' }}>
          <div className="h-12 w-12 shrink-0 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <div className="text-3xl font-bold text-green-900">{stats.total}</div>
            <div className="text-xs font-semibold text-green-700 uppercase tracking-wide">Total</div>
            <div className="text-xs text-green-600 mt-0.5">
              {backupsApi.formatSize(stats.totalSize)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
