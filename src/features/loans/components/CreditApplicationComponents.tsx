/**
 * CU-11: Componentes React para Gestionar Originación de Créditos
 * 
 * Componentes principales para interfaz de prestatario y backoffice
 */

import React, { type ReactNode } from 'react';
import type {
  LoanApplication,
  LoanApplicationComment,
  LoanApplicationDocument,
  LoanApplicationTimelineEvent,
} from '../services/loansApi';
import {
  formatApplicationNumber,
  getDocumentsStatusColor,
  getIdentityStatusColor,
  getStatusColor,
} from '../services/loansApi';
import {
  toneClasses,
  normalizeTone,
  formatCurrency,
  formatDateTime,
} from '../utils/componentHelpers';

// Re-export helpers for backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
export { formatCurrency, formatDateTime } from '../utils/componentHelpers';

export function Badge({
  label,
  color,
}: {
  label: string;
  color: string;
}): React.ReactNode {
  const tone = normalizeTone(color);
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}

export function CreditApplicationStatusBadge({ status, label }: { status: string; label?: string }): React.ReactNode {
  return <Badge label={label || status} color={getStatusColor(status)} />;
}

export function IdentityStatusBadge({ status, label }: { status?: string | null; label?: string }): React.ReactNode {
  return <Badge label={label || status || 'N/D'} color={getIdentityStatusColor(status)} />;
}

export function DocumentsStatusBadge({ status, label }: { status?: string | null; label?: string }): React.ReactNode {
  return <Badge label={label || status || 'N/D'} color={getDocumentsStatusColor(status)} />;
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}): React.ReactNode {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  color = 'slate',
}: {
  label: string;
  value: string;
  helper?: string;
  color?: string;
}): React.ReactNode {
  // Color parameter reserved for future styling enhancements
  void color;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-3 h-1.5 w-14 rounded-full`} />
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      {helper ? <div className="mt-1 text-sm text-slate-500">{helper}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M7 7h10v10H7z" />
            <path d="M7 12h10M12 7v10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

export function ApplicationSummaryCard({ application }: { application: LoanApplication }): React.ReactNode {
  return (
    <div className="rounded-4xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-slate-400">Solicitud</div>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{formatApplicationNumber(application.application_number)}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            {application.product_name} · {application.client_name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CreditApplicationStatusBadge status={application.status} label={application.status_display} />
          {application.identity_verification_status ? (
            <IdentityStatusBadge
              status={application.identity_verification_status}
              label={application.identity_verification_display || application.identity_verification_status}
            />
          ) : null}
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Monto" value={formatCurrency(application.requested_amount)} />
        <MiniStat label="Plazo" value={`${application.term_months} meses`} />
        <MiniStat label="Ingreso" value={formatCurrency(application.monthly_income)} />
        <MiniStat label="Score" value={application.credit_score !== null && application.credit_score !== undefined ? String(application.credit_score) : 'Pendiente'} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }): React.ReactNode {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs font-medium uppercase text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export function ApplicationDetailsGrid({ application }: { application: LoanApplication }): React.ReactNode {
  const items = [
    { label: 'Propósito', value: application.purpose || 'N/D' },
    { label: 'Tipo de empleo', value: application.employment_type_display || application.employment_type || 'N/D' },
    { label: 'Descripción laboral', value: application.employment_description || 'N/D' },
    { label: 'Relación deuda/ingreso', value: application.debt_to_income_ratio || 'N/D' },
    { label: 'Monto aprobado', value: formatCurrency(application.approved_amount) },
    { label: 'Tasa aprobada', value: application.approved_interest_rate ? `${application.approved_interest_rate}%` : 'N/D' },
    { label: 'Cuota mensual', value: formatCurrency(application.monthly_payment) },
    { label: 'Sucursal', value: application.branch?.name || application.branch?.code || 'N/D' },
  ];

  return (
    <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <dt className="text-xs font-medium uppercase text-slate-500">{item.label}</dt>
          <dd className="mt-2 text-sm font-semibold text-slate-900">{item.value}</dd>
        </div>
      ))}
      </dl>
    );
  }

export function ApplicationTimeline({ events }: { events: LoanApplicationTimelineEvent[] }): React.ReactNode {
  if (!events.length) {
    return <EmptyState title="Sin eventos" description="Aún no se ha registrado actividad en esta solicitud." />;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const tone = normalizeTone(getStatusColor(event.new_status));
        return (
          <div key={event.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`mt-1 h-3 w-3 rounded-full ${tone === 'emerald' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">{event.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                </div>
                <div className="text-xs text-slate-500">{formatDateTime(event.created_at)}</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                {event.actor_name ? <span>Por {event.actor_name}</span> : null}
                {event.actor_role ? <span>Rol {event.actor_role}</span> : null}
                <span>{event.is_visible_to_borrower ? 'Visible al cliente' : 'Interno'}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ApplicationComments({ comments }: { comments: LoanApplicationComment[] }): React.ReactNode {
  if (!comments.length) {
    return <EmptyState title="Sin comentarios" description="Todavía no hay notas asociadas a esta solicitud." />;
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">{comment.user_name}</span>
            <span className="text-xs text-slate-500">{formatDateTime(comment.created_at)}</span>
            <Badge label={comment.is_internal ? 'Interno' : 'Público'} color={comment.is_internal ? 'amber' : 'emerald'} />
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{comment.comment}</p>
        </div>
      ))}
    </div>
  );
}

export function ApplicationDocuments({ documents }: { documents: LoanApplicationDocument[] }): React.ReactNode {
  if (!documents.length) {
    return <EmptyState title="Sin documentos" description="La solicitud no tiene archivos cargados todavía." />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {documents.map((document) => (
        <div key={document.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">{document.file_name}</div>
              <div className="mt-1 text-xs uppercase text-slate-500">{document.document_type}</div>
            </div>
            <Badge label={document.is_verified ? 'Verificado' : 'Pendiente'} color={document.is_verified ? 'emerald' : 'amber'} />
          </div>
          <div className="mt-3 text-sm text-slate-600">{document.description || 'Sin descripción'}</div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>{document.uploaded_by_name || 'Sistema'}</span>
            <span>{formatDateTime(document.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ApplicationHeader({
  application,
}: {
  application: LoanApplication;
}): React.ReactNode {
  return (
    <div className="space-y-6">
      <ApplicationSummaryCard application={application} />
      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard label="Solicitado" value={formatCurrency(application.requested_amount)} color="blue" />
        <MetricCard label="Plazo" value={`${application.term_months} meses`} color="amber" />
        <MetricCard label="Identidad" value={application.identity_verification_display || application.identity_verification_status || 'N/D'} color="emerald" />
        <MetricCard label="Documentos" value={application.documents_status_display || application.documents_status || 'N/D'} color="teal" />
      </div>
    </div>
  );
}
