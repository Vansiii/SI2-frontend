import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { CheckCircle, Clock, AlertCircle, FileText, UserCheck, TrendingUp, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TimelineEvent } from '../types/timeline.types';

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className = '' }) => {
  const getIcon = (event: TimelineEvent) => {
    if (event.is_pending_action) {
      return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    }
    
    // Iconos específicos por estado
    switch (event.to_status) {
      case 'APPROVED':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'DOCUMENTS':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'KYC':
        return <UserCheck className="h-6 w-6 text-purple-500" />;
      case 'SCORING':
        return <TrendingUp className="h-6 w-6 text-indigo-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    switch (status) {
      case 'APPROVED':
      case 'DISBURSED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'DOCUMENTS':
      case 'KYC':
      case 'REVIEW':
        return 'warning';
      case 'SCORING':
      case 'SUBMITTED':
        return 'info';
      default:
        return 'default';
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No hay eventos en el timeline aún</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4 animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
          {/* Línea vertical e icono */}
          <div className="flex flex-col items-center">
            <div className="flex-shrink-0">
              {getIcon(event)}
            </div>
            {index < events.length - 1 && (
              <div className="w-0.5 flex-1 bg-gray-200 mt-2 min-h-[40px]" />
            )}
          </div>

          {/* Contenido del evento */}
          <Card 
            className="flex-1 transition-all duration-200 hover:shadow-md"
            hover={false}
          >
            <CardContent className="py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">
                    {event.client_message}
                  </p>
                  
                  {event.notes && (
                    <p className="text-sm text-gray-600 mb-2">
                      {event.notes}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(event.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", {
                        locale: es,
                      })}
                    </span>
                  </div>

                  {event.changed_by_name && (
                    <p className="text-xs text-gray-500 mt-1">
                      Por: {event.changed_by_name}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge variant={getStatusColor(event.to_status)} size="sm">
                    {event.to_status}
                  </Badge>
                  
                  {event.is_pending_action && (
                    <Badge variant="warning" size="sm">
                      Acción Requerida
                    </Badge>
                  )}
                </div>
              </div>

              {/* Acción requerida */}
              {event.requires_client_action && event.action_description && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        {event.action_description}
                      </p>
                      {event.action_url && (
                        <a
                          href={event.action_url}
                          className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                          style={{
                            color: 'var(--tenant-primary, #2563EB)',
                          }}
                        >
                          Realizar acción →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};
