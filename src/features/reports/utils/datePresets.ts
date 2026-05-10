/**
 * Utilidades para presets de fechas
 */
import type { DatePreset, DateRange } from '../types';

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  today: 'Hoy',
  yesterday: 'Ayer',
  last_7_days: 'Últimos 7 días',
  last_30_days: 'Últimos 30 días',
  current_week: 'Semana actual',
  last_week: 'Semana pasada',
  current_month: 'Mes actual',
  last_month: 'Mes pasado',
  current_quarter: 'Trimestre actual',
  last_quarter: 'Trimestre pasado',
  current_year: 'Año actual',
  last_year: 'Año pasado',
  custom: 'Personalizado',
};

export const DATE_PRESETS: DatePreset[] = [
  'today',
  'yesterday',
  'last_7_days',
  'last_30_days',
  'current_week',
  'last_week',
  'current_month',
  'last_month',
  'current_quarter',
  'last_quarter',
  'current_year',
  'last_year',
  'custom',
];

/**
 * Calcula el rango de fechas para un preset dado
 */
export const calculateDateRange = (preset: DatePreset): DateRange => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  switch (preset) {
    case 'today':
      return {
        preset,
        start_date: formatDate(today),
        end_date: formatDate(today),
      };

    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        preset,
        start_date: formatDate(yesterday),
        end_date: formatDate(yesterday),
      };
    }

    case 'last_7_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return {
        preset,
        start_date: formatDate(start),
        end_date: formatDate(today),
      };
    }

    case 'last_30_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return {
        preset,
        start_date: formatDate(start),
        end_date: formatDate(today),
      };
    }

    case 'current_week': {
      const start = new Date(today);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Lunes
      start.setDate(diff);
      return {
        preset,
        start_date: formatDate(start),
        end_date: formatDate(today),
      };
    }

    case 'last_week': {
      const start = new Date(today);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1) - 7;
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return {
        preset,
        start_date: formatDate(start),
        end_date: formatDate(end),
      };
    }

    case 'current_month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        preset,
        start_date: formatDate(start),
        end_date: formatDate(today),
      };
    }

    case 'last_month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        preset,
        start_date: formatDate(start),
        end_date: formatDate(end),
      };
    }

    case 'current_quarter': {
      const quarter = Math.floor(today.getMonth() / 3);
      const start = new Date(today.getFullYear(), quarter * 3, 1);
      return {
        preset,
        start_date: formatDate(start),
        end_date: formatDate(today),
      };
    }

    case 'last_quarter': {
      const quarter = Math.floor(today.getMonth() / 3) - 1;
      const year = quarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
      const adjustedQuarter = quarter < 0 ? 3 : quarter;
      const start = new Date(year, adjustedQuarter * 3, 1);
      const end = new Date(year, adjustedQuarter * 3 + 3, 0);
      return {
        preset,
        start_date: formatDate(start),
        end_date: formatDate(end),
      };
    }

    case 'current_year': {
      const start = new Date(today.getFullYear(), 0, 1);
      return {
        preset,
        start_date: formatDate(start),
        end_date: formatDate(today),
      };
    }

    case 'last_year': {
      const start = new Date(today.getFullYear() - 1, 0, 1);
      const end = new Date(today.getFullYear() - 1, 11, 31);
      return {
        preset,
        start_date: formatDate(start),
        end_date: formatDate(end),
      };
    }

    case 'custom':
      return {
        preset,
        start_date: null,
        end_date: null,
      };

    default:
      return {
        preset: null,
        start_date: null,
        end_date: null,
      };
  }
};
