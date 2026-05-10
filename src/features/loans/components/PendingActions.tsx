import React from 'react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { PendingAction } from '../types/timeline.types';

interface PendingActionsProps {
  actions: PendingAction[];
  className?: string;
}

export const PendingActions: React.FC<PendingActionsProps> = ({ actions, className = '' }) => {
  if (!actions || actions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">No hay acciones pendientes</p>
              <p className="text-sm text-gray-500 mt-1">
                Tu solicitud está siendo procesada
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {actions.map((action, index) => (
        <Card
          key={action.id}
          className="border-l-4 border-yellow-500 animate-fadeIn"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {action.client_message}
                  </h3>
                  <Badge variant="warning" size="sm">
                    Pendiente
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {action.action_description}
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Desde: {format(new Date(action.created_at), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </p>

                  {action.action_url && (
                    <a
                      href={action.action_url}
                      className="inline-flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
                      style={{
                        backgroundColor: 'var(--tenant-primary, #2563EB)',
                        color: 'var(--tenant-on-primary, #FFFFFF)',
                      }}
                    >
                      Completar acción
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};
