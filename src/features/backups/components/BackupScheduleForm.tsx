/**
 * Formulario para crear/editar configuración de backups programados
 */
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  Chip,
  Alert,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type {
  BackupScheduleConfig,
  BackupScheduleConfigCreate,
  BackupScheduleConfigUpdate,
  BackupFrequency,
  BackupType,
} from '../types/backup.types';
import {
  FREQUENCY_OPTIONS,
  BACKUP_TYPE_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
  formatTime,
} from '../types/backup.types';

interface BackupScheduleFormProps {
  config?: BackupScheduleConfig;
  tenantId: number;
  onSubmit: (data: BackupScheduleConfigCreate | BackupScheduleConfigUpdate) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const BackupScheduleForm: React.FC<BackupScheduleFormProps> = ({
  config,
  tenantId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEdit = !!config;

  // Form state - Asegurar que NUNCA sean undefined
  const [frequency, setFrequency] = useState<BackupFrequency>(() => config?.frequency || 'daily');
  const [hour, setHour] = useState<number>(() => config?.hour !== undefined ? config.hour : 2);
  const [minute, setMinute] = useState<number>(() => config?.minute !== undefined ? config.minute : 0);
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(() => config?.day_of_week ?? null);
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(() => config?.day_of_month ?? null);
  const [cronExpression, setCronExpression] = useState<string>(() => config?.cron_expression || '');
  const [backupType, setBackupType] = useState<BackupType>(() => config?.backup_type || 'full');
  const [includeAuditLogs, setIncludeAuditLogs] = useState<boolean>(() => config?.include_audit_logs ?? false);
  const [includePhysicalFiles, setIncludePhysicalFiles] = useState<boolean>(() => config?.include_physical_files ?? false);
  const [retentionDays, setRetentionDays] = useState<number>(() => config?.retention_days ?? 30);
  const [maxBackupsToKeep, setMaxBackupsToKeep] = useState<number>(() => config?.max_backups_to_keep ?? 10);
  const [notifyOnSuccess, setNotifyOnSuccess] = useState<boolean>(() => config?.notify_on_success ?? false);
  const [notifyOnFailure, setNotifyOnFailure] = useState<boolean>(() => config?.notify_on_failure ?? true);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => config?.is_enabled ?? true);
  const [notificationEmails, setNotificationEmails] = useState<string[]>(() => config?.notification_emails || []);
  const [newEmail, setNewEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  // Validación de email
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Agregar email
  const handleAddEmail = () => {
    if (!newEmail.trim()) {
      setEmailError('Ingrese un email');
      return;
    }

    if (!validateEmail(newEmail)) {
      setEmailError('Email inválido');
      return;
    }

    if (notificationEmails.includes(newEmail)) {
      setEmailError('Email ya agregado');
      return;
    }

    setNotificationEmails([...notificationEmails, newEmail]);
    setNewEmail('');
    setEmailError('');
  };

  // Eliminar email
  const handleRemoveEmail = (email: string) => {
    setNotificationEmails(notificationEmails.filter((e) => e !== email));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: BackupScheduleConfigCreate | BackupScheduleConfigUpdate = {
      ...(isEdit ? {} : { tenant: tenantId }),
      is_enabled: isEnabled,
      frequency,
      hour,
      minute,
      day_of_week: frequency === 'weekly' ? dayOfWeek : null,
      day_of_month: frequency === 'monthly' ? dayOfMonth : null,
      cron_expression: frequency === 'custom' ? cronExpression : null,
      backup_type: backupType,
      include_audit_logs: includeAuditLogs,
      include_physical_files: includePhysicalFiles,
      retention_days: retentionDays,
      max_backups_to_keep: maxBackupsToKeep,
      notify_on_success: notifyOnSuccess,
      notify_on_failure: notifyOnFailure,
      notification_emails: notificationEmails,
    };

    console.log('📤 Datos a enviar:', data);
    console.log('📤 Hour:', hour, 'Minute:', minute);

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Estado: Habilitar/Deshabilitar */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="h6">
                      Backups Habilitados
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Los backups se ejecutarán automáticamente según la configuración
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Frecuencia */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📅 Frecuencia
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Frecuencia</InputLabel>
                    <Select
                      value={frequency}
                      label="Frecuencia"
                      onChange={(e) => setFrequency(e.target.value as BackupFrequency)}
                    >
                      {FREQUENCY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Hora de Ejecución
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        label="Hora (0-23)"
                        type="number"
                        value={hour}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            setHour(Math.max(0, Math.min(23, val)));
                          }
                        }}
                        slotProps={{
                          htmlInput: { min: 0, max: 23 }
                        }}
                        sx={{ width: '120px' }}
                      />
                      <TextField
                        label="Minuto (0-59)"
                        type="number"
                        value={minute}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            setMinute(Math.max(0, Math.min(59, val)));
                          }
                        }}
                        slotProps={{
                          htmlInput: { min: 0, max: 59 }
                        }}
                        sx={{ width: '120px' }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Los backups se ejecutarán a las {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')} (hora del servidor)
                    </Typography>
                  </Box>
                </Grid>

                {frequency === 'weekly' && (
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <InputLabel>Día de la Semana</InputLabel>
                      <Select
                        value={dayOfWeek || ''}
                        label="Día de la Semana"
                        onChange={(e) => setDayOfWeek(e.target.value as number)}
                      >
                        {DAY_OF_WEEK_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {frequency === 'monthly' && (
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Día del Mes"
                      value={dayOfMonth || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setDayOfMonth(Math.max(1, Math.min(31, val)));
                        } else {
                          setDayOfMonth(null);
                        }
                      }}
                      slotProps={{
                        htmlInput: { min: 1, max: 31 }
                      }}
                      helperText="1-31"
                    />
                  </Grid>
                )}

                {frequency === 'custom' && (
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Expresión Cron"
                      value={cronExpression}
                      onChange={(e) => setCronExpression(e.target.value)}
                      placeholder="0 2 * * *"
                      helperText="Formato: minuto hora día mes día_semana"
                    />
                  </Grid>
                )}

                <Grid size={12}>
                  <Alert severity="info">
                    Hora de ejecución: {formatTime(hour, minute)}
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tipo de Backup */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💾 Tipo de Backup
              </Typography>

              <Grid container spacing={2}>
                <Grid size={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={backupType}
                      label="Tipo"
                      onChange={(e) => setBackupType(e.target.value as BackupType)}
                    >
                      {BACKUP_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={includeAuditLogs}
                        onChange={(e) => setIncludeAuditLogs(e.target.checked)}
                      />
                    }
                    label="Incluir logs de auditoría (puede aumentar el tamaño)"
                  />
                </Grid>

                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={includePhysicalFiles}
                        onChange={(e) => setIncludePhysicalFiles(e.target.checked)}
                      />
                    }
                    label="Incluir archivos físicos en ZIP (puede ser muy grande)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Retención */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📦 Retención
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Días de Retención"
                    value={retentionDays}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setRetentionDays(Math.max(1, Math.min(365, val)));
                      }
                    }}
                    slotProps={{
                      htmlInput: { min: 1, max: 365 }
                    }}
                    helperText="Días que se mantendrán los backups (1-365)"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Máximo de Backups"
                    value={maxBackupsToKeep}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setMaxBackupsToKeep(Math.max(1, Math.min(100, val)));
                      }
                    }}
                    slotProps={{
                      htmlInput: { min: 1, max: 100 }
                    }}
                    helperText="Máximo de backups automáticos a mantener (1-100)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notificaciones */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📧 Notificaciones
              </Typography>

              <Grid container spacing={2}>
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifyOnSuccess}
                        onChange={(e) => setNotifyOnSuccess(e.target.checked)}
                      />
                    }
                    label="Notificar cuando el backup se complete exitosamente"
                  />
                </Grid>

                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifyOnFailure}
                        onChange={(e) => setNotifyOnFailure(e.target.checked)}
                      />
                    }
                    label="Notificar cuando el backup falle"
                  />
                </Grid>

                <Grid size={12}>
                  <FormLabel>Emails de Notificación</FormLabel>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                      fullWidth
                      type="email"
                      placeholder="admin@example.com"
                      value={newEmail}
                      onChange={(e) => {
                        setNewEmail(e.target.value);
                        setEmailError('');
                      }}
                      error={!!emailError}
                      helperText={emailError}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddEmail();
                        }
                      }}
                    />
                    <IconButton color="primary" onClick={handleAddEmail}>
                      <AddIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {notificationEmails.map((email) => (
                      <Chip
                        key={email}
                        label={email}
                        onDelete={() => handleRemoveEmail(email)}
                        deleteIcon={<DeleteIcon />}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Botones */}
        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {onCancel && (
              <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
                Cancelar
              </Button>
            )}
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default BackupScheduleForm;
