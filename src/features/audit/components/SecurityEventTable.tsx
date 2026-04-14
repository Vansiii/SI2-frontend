/**
 * Tabla de eventos de seguridad
 */
import { Eye, CheckCircle } from 'lucide-react';
import type { SecurityEventList } from '../types';

interface SecurityEventTableProps {
  events: SecurityEventList[];
  onViewDetails: (id: number) => void;
  onResolve?: (id: number) => void;
}

const eventTypeColors = {
  failed_login: 'bg-red-100 text-red-800',
  account_locked: 'bg-red-100 text-red-800',
  suspicious_activity: 'bg-orange-100 text-orange-800',
  unauthorized_access: 'bg-red-100 text-red-800',
  permission_escalation: 'bg-red-100 text-red-800',
  data_breach_attempt: 'bg-red-100 text-red-800',
  rate_limit_exceeded: 'bg-yellow-100 text-yellow-800',
  invalid_token: 'bg-orange-100 text-orange-800',
  session_hijack: 'bg-red-100 text-red-800',
} as const;

export function SecurityEventTable({
  events,
  onViewDetails,
  onResolve,
}: SecurityEventTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se encontraron eventos de seguridad</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo de Evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario/Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(event.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    eventTypeColors[event.event_type as keyof typeof eventTypeColors] || 'bg-red-100 text-red-800'
                  }`}>
                    {event.event_type_display}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {event.user_email || event.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {event.ip_address}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {event.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    event.resolved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.resolved ? 'Resuelto' : 'Pendiente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => onViewDetails(event.id)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {!event.resolved && onResolve && (
                      <button
                        onClick={() => onResolve(event.id)}
                        className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                        title="Marcar como resuelto"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}