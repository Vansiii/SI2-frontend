/**
 * Tabla para mostrar el historial de ejecuciones de backups programados
 */
import React from 'react';
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import type { ScheduledBackupLog } from '../types/backup.types';
import {
  getStatusColor,
  getStatusIcon,
  formatDateTime,
  formatDuration,
} from '../types/backup.types';

interface BackupLogsTableProps {
  logs: ScheduledBackupLog[];
  isLoading?: boolean;
}

export const BackupLogsTable: React.FC<BackupLogsTableProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No hay logs de ejecuciones</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Estado</TableCell>
            <TableCell>Tenant</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Duración</TableCell>
            <TableCell>Backup ID</TableCell>
            <TableCell>Detalles</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} hover>
              <TableCell>
                <Chip
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>{getStatusIcon(log.status)}</span>
                      <span>
                        {log.status === 'success'
                          ? 'Exitoso'
                          : log.status === 'failed'
                          ? 'Fallido'
                          : 'Omitido'}
                      </span>
                    </Box>
                  }
                  color={getStatusColor(log.status) as any}
                  size="small"
                />
              </TableCell>

              <TableCell>{log.tenant_name}</TableCell>

              <TableCell>{formatDateTime(log.started_at)}</TableCell>

              <TableCell>{formatDuration(log.duration_seconds)}</TableCell>

              <TableCell>
                {log.backup_id ? (
                  <Chip label={`#${log.backup_id}`} size="small" variant="outlined" />
                ) : (
                  '-'
                )}
              </TableCell>

              <TableCell>
                {log.error_message ? (
                  <Tooltip title={log.error_message}>
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'help',
                      }}
                    >
                      {log.error_message}
                    </Typography>
                  </Tooltip>
                ) : log.metadata?.backup_size_mb ? (
                  <Typography variant="body2" color="text.secondary">
                    {log.metadata.backup_size_mb} MB
                  </Typography>
                ) : (
                  '-'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BackupLogsTable;
