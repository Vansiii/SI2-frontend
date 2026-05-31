/**
 * Página principal de configuración de backups automáticos
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { backupsApi } from '../services/backupsApi';
import { BackupScheduleCard } from '../components/BackupScheduleCard';
import { BackupScheduleForm } from '../components/BackupScheduleForm';
import type {
  BackupScheduleConfig,
  BackupScheduleConfigCreate,
  BackupScheduleConfigUpdate,
  SchedulerStatus,
} from '../types/backup.types';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const BackupSchedulePage: React.FC = () => {
  const { user } = useAuth();
  
  // Obtener tenant ID desde la membresía activa del usuario
  const getTenantId = (): number | undefined => {
    if (!user) return undefined;
    
    // Si es superadmin SaaS, no tiene tenant específico
    if ((user as any).profile?.user_type === 'saas_admin') {
      return undefined;
    }
    
    // Obtener tenant desde la membresía activa
    const activeMembership = (user as any).institution_memberships?.find((m: any) => m.is_active);
    return activeMembership?.institution?.id;
  };
  
  const tenantId = getTenantId();

  // State
  const [configs, setConfigs] = useState<BackupScheduleConfig[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<BackupScheduleConfig | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<number | null>(null);

  // Cargar datos
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [configsData, statusData] = await Promise.all([
        backupsApi.getSchedules(),
        backupsApi.getSchedulerStatus(),
      ]);

      setConfigs(configsData);
      setSchedulerStatus(statusData);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.response?.data?.detail || 'Error cargando configuraciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Crear configuración
  const handleCreate = async (data: BackupScheduleConfigCreate | BackupScheduleConfigUpdate) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await backupsApi.createSchedule(data as BackupScheduleConfigCreate);
      setSuccess('Configuración creada exitosamente');
      setIsCreateDialogOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Error creando configuración:', err);
      setError(err.response?.data?.detail || 'Error creando configuración');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar configuración
  const handleUpdate = async (data: BackupScheduleConfigUpdate) => {
    if (!selectedConfig) return;

    console.log('🔄 handleUpdate recibió:', data);
    console.log('🔄 selectedConfig:', selectedConfig);

    try {
      setIsSubmitting(true);
      setError(null);

      const updatedConfig = await backupsApi.updateSchedule(selectedConfig.id, data);
      setSuccess('Configuración actualizada exitosamente');
      
      // Actualizar la configuración en la lista local
      setConfigs(configs.map(c => c.id === updatedConfig.id ? updatedConfig : c));
      
      // Cerrar diálogo y limpiar estado
      handleCloseEdit();
      
      // Recargar datos para asegurar sincronización
      await loadData();
    } catch (err: any) {
      console.error('Error actualizando configuración:', err);
      setError(err.response?.data?.detail || 'Error actualizando configuración');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle habilitar/deshabilitar
  const handleToggle = async (id: number, enabled: boolean) => {
    try {
      setError(null);

      if (enabled) {
        await backupsApi.enableSchedule(id);
        setSuccess('Backups automáticos habilitados');
      } else {
        await backupsApi.disableSchedule(id);
        setSuccess('Backups automáticos deshabilitados');
      }

      await loadData();
    } catch (err: any) {
      console.error('Error cambiando estado:', err);
      setError(err.response?.data?.detail || 'Error cambiando estado');
    }
  };

  // Eliminar configuración
  const handleDelete = async () => {
    if (!configToDelete) return;

    try {
      setError(null);

      await backupsApi.deleteSchedule(configToDelete);
      setSuccess('Configuración eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setConfigToDelete(null);
      await loadData();
    } catch (err: any) {
      console.error('Error eliminando configuración:', err);
      setError(err.response?.data?.detail || 'Error eliminando configuración');
    }
  };

  // Ejecutar ahora
  const handleRunNow = async (id: number) => {
    try {
      setError(null);

      const result = await backupsApi.runNow(id);
      setSuccess(result.detail);
      await loadData();
    } catch (err: any) {
      console.error('Error ejecutando backup:', err);
      setError(err.response?.data?.detail || 'Error ejecutando backup');
    }
  };

  // Ver estado
  const handleViewStatus = (id: number) => {
    // TODO: Navegar a página de estadísticas detalladas
    console.log('Ver estado de configuración:', id);
  };

  // Editar
  const handleEdit = (config: BackupScheduleConfig) => {
    setSelectedConfig(config);
    setIsEditDialogOpen(true);
  };

  // Cerrar diálogo de edición
  const handleCloseEdit = () => {
    setIsEditDialogOpen(false);
    // Esperar a que el diálogo se cierre antes de limpiar selectedConfig
    setTimeout(() => {
      setSelectedConfig(null);
    }, 300);
  };

  // Confirmar eliminación
  const handleDeleteClick = (id: number) => {
    setConfigToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  if (!tenantId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">No se pudo obtener la información del tenant</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">⚙️ Backups Automáticos</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadData}
              disabled={isLoading}
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Nueva Configuración
            </Button>
          </Box>
        </Box>

        {/* Estado del Scheduler */}
        {schedulerStatus && (
          <Alert
            severity={schedulerStatus.scheduler_running ? 'success' : 'warning'}
            sx={{ mb: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={schedulerStatus.status === 'running' ? 'Corriendo' : 'Detenido'}
                color={schedulerStatus.status === 'running' ? 'success' : 'warning'}
                size="small"
              />
              <Typography variant="body2">{schedulerStatus.message}</Typography>
            </Box>
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              {schedulerStatus.info}
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Configuraciones */}
      {!isLoading && configs.length === 0 && (
        <Alert severity="info">
          No hay configuraciones de backups automáticos. Crea una para comenzar.
        </Alert>
      )}

      {!isLoading && configs.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {configs.map((config) => (
            <BackupScheduleCard
              key={config.id}
              config={config}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onRunNow={handleRunNow}
              onViewStatus={handleViewStatus}
            />
          ))}
        </Box>
      )}

      {/* Dialog: Crear */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => !isSubmitting && setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nueva Configuración de Backup</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <BackupScheduleForm
              tenantId={tenantId}
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={isSubmitting}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => !isSubmitting && handleCloseEdit()}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar Configuración de Backup</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedConfig && (
              <BackupScheduleForm
                key={`edit-${selectedConfig.id}-${Date.now()}`}
                config={selectedConfig}
                tenantId={tenantId}
                onSubmit={handleUpdate}
                onCancel={handleCloseEdit}
                isLoading={isSubmitting}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta configuración de backup?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar: Success */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        message={success}
      />

      {/* Snackbar: Error */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BackupSchedulePage;
