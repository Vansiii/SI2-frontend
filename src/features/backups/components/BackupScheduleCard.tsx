/**
 * Tarjeta para mostrar la configuración de backup programado
 */
import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Switch,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import type { BackupScheduleConfig } from '../types/backup.types';
import { formatDateTime, formatTime } from '../types/backup.types';

interface BackupScheduleCardProps {
  config: BackupScheduleConfig;
  onToggle: (id: number, enabled: boolean) => Promise<void>;
  onEdit: (config: BackupScheduleConfig) => void;
  onDelete: (id: number) => void;
  onRunNow: (id: number) => void;
  onViewStatus: (id: number) => void;
  isLoading?: boolean;
}

export const BackupScheduleCard: React.FC<BackupScheduleCardProps> = ({
  config,
  onToggle,
  onEdit,
  onDelete,
  onRunNow,
  onViewStatus,
  isLoading = false,
}) => {
  const handleToggle = async () => {
    await onToggle(config.id, !config.is_enabled);
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          {/* Header */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">{config.tenant_name}</Typography>
                <Chip
                  label={config.is_enabled ? 'Habilitado' : 'Deshabilitado'}
                  color={config.is_enabled ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Ver estadísticas">
                  <IconButton size="small" onClick={() => onViewStatus(config.id)}>
                    <AssessmentIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Ejecutar ahora">
                  <IconButton
                    size="small"
                    onClick={() => onRunNow(config.id)}
                    disabled={isLoading || !config.is_enabled}
                  >
                    <PlayIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => onEdit(config)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton size="small" onClick={() => onDelete(config.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>

          {/* Configuración */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              📅 Frecuencia
            </Typography>
            <Typography variant="body1">{config.schedule_description}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              💾 Tipo
            </Typography>
            <Typography variant="body1">
              {config.backup_type === 'full' ? 'Completo' : 'Solo Metadatos'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              📦 Retención
            </Typography>
            <Typography variant="body1">
              {config.retention_days} días / Máx. {config.max_backups_to_keep} backups
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              📧 Notificaciones
            </Typography>
            <Typography variant="body1">
              {config.notification_emails.length > 0
                ? `${config.notification_emails.length} email(s)`
                : 'Sin notificaciones'}
            </Typography>
          </Grid>

          {/* Ejecuciones */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Última ejecución
                </Typography>
                <Typography variant="body1">{formatDateTime(config.last_run_at)}</Typography>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Próxima ejecución
                </Typography>
                <Typography variant="body1" color="primary">
                  {formatDateTime(config.next_run_at)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Estadísticas */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h6">{config.total_runs}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="success.main">
                  Exitosos
                </Typography>
                <Typography variant="h6" color="success.main">
                  {config.successful_runs}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="error.main">
                  Fallidos
                </Typography>
                <Typography variant="h6" color="error.main">
                  {config.failed_runs}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tasa de éxito
                </Typography>
                <Typography variant="h6" color={config.success_rate >= 90 ? 'success.main' : 'warning.main'}>
                  {config.success_rate.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Toggle */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch checked={config.is_enabled} onChange={handleToggle} disabled={isLoading} />
              <Typography variant="body2">
                {config.is_enabled ? 'Deshabilitar backups automáticos' : 'Habilitar backups automáticos'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BackupScheduleCard;
