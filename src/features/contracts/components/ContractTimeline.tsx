/**
 * Timeline de eventos del contrato
 */

import React from 'react';
import { FileText, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Contract } from '../types';

interface Props {
  contract: Contract;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

export const ContractTimeline: React.FC<Props> = ({ contract }) => {
  const events: TimelineEvent[] = [];

  // Evento: Generación
  events.push({
    id: 'generated',
    title: 'Contrato Generado',
    description: contract.generated_by_name
      ? `Generado por ${contract.generated_by_name}`
      : 'Contrato generado automáticamente',
    timestamp: contract.created_at,
    icon: <FileText className="w-5 h-5" />,
    color: 'blue',
  });

  // Evento: Publicación
  if (contract.published_at && contract.published_by_name) {
    events.push({
      id: 'published',
      title: 'Contrato Publicado',
      description: `Publicado por ${contract.published_by_name}`,
      timestamp: contract.published_at,
      icon: <Send className="w-5 h-5" />,
      color: 'indigo',
    });
  }

  // Eventos: Firmas
  contract.signatures.forEach((signature, index) => {
    events.push({
      id: `signature-${signature.id}`,
      title: `Firma ${signature.signer_type_display}`,
      description: `Firmado por ${signature.signer_name} (${signature.signature_method_display})`,
      timestamp: signature.signed_at,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'green',
    });
  });

  // Evento: Activación
  if (contract.status === 'ACTIVE' && contract.all_signatures_complete) {
    const lastSignature = contract.signatures[contract.signatures.length - 1];
    if (lastSignature) {
      events.push({
        id: 'activated',
        title: 'Contrato Activado',
        description: 'Todas las firmas completadas, contrato activo',
        timestamp: lastSignature.signed_at,
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'green',
      });
    }
  }

  // Evento: Cancelación
  if (contract.status === 'CANCELLED') {
    events.push({
      id: 'cancelled',
      title: 'Contrato Cancelado',
      description: 'El contrato ha sido cancelado',
      timestamp: contract.updated_at,
      icon: <XCircle className="w-5 h-5" />,
      color: 'red',
    });
  }

  // Ordenar por fecha descendente
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
    red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => {
          const colors = colorClasses[event.color] || colorClasses.gray;

          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== events.length - 1 && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div>
                    <div
                      className={`relative px-1 h-10 w-10 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center ring-8 ring-white`}
                    >
                      {event.icon}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{event.title}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString('es-BO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{event.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
