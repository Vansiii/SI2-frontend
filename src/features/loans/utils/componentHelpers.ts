/**
 * Utilidades y helpers para componentes de CU-11
 * Separadas para evitar conflictos con fast-refresh
 */

export type BadgeTone = 'slate' | 'blue' | 'emerald' | 'rose' | 'amber' | 'orange' | 'teal' | 'red';

export const toneClasses: Record<BadgeTone, string> = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  blue: 'bg-blue-100 text-blue-700 ring-blue-200',
  emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  rose: 'bg-rose-100 text-rose-700 ring-rose-200',
  amber: 'bg-amber-100 text-amber-800 ring-amber-200',
  orange: 'bg-orange-100 text-orange-700 ring-orange-200',
  teal: 'bg-teal-100 text-teal-700 ring-teal-200',
  red: 'bg-red-100 text-red-700 ring-red-200',
};

export const iconToneClasses: Record<BadgeTone, string> = {
  slate: 'text-slate-500',
  blue: 'text-blue-600',
  emerald: 'text-emerald-600',
  rose: 'text-rose-600',
  amber: 'text-amber-600',
  orange: 'text-orange-600',
  teal: 'text-teal-600',
  red: 'text-red-600',
};

export function normalizeTone(color: string): BadgeTone {
  if (color in toneClasses) {
    return color as BadgeTone;
  }
  return 'slate';
}

export function formatCurrency(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') {
    return 'N/D';
  }
  const numeric = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(numeric)) {
    return String(value);
  }
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return 'N/D';
  }
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatDate(value?: string | null): string {
  if (!value) {
    return 'N/D';
  }
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
  }).format(new Date(value));
}
