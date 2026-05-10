/**
 * Funciones auxiliares para gráficos
 */

import type { ChartConfig, ChartType } from '../types';
import { CHART_COLOR_PALETTE, DATA_LIMITS } from '../config/chartConfig';

/**
 * Obtiene el color para un índice específico
 */
export function getColorForIndex(index: number): string {
  return CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length];
}

/**
 * Prepara datos para gráfico limitando cantidad de puntos
 */
export function prepareChartData(
  data: Record<string, any>[],
  chartType: ChartType
): Record<string, any>[] {
  let maxPoints: number;

  switch (chartType) {
    case 'BAR':
    case 'HORIZONTAL_BAR':
    case 'STACKED_BAR':
      maxPoints = DATA_LIMITS.maxPointsBar;
      break;
    case 'LINE':
      maxPoints = DATA_LIMITS.maxPointsLine;
      break;
    case 'PIE':
    case 'DONUT':
      maxPoints = DATA_LIMITS.maxPointsPie;
      break;
    default:
      maxPoints = 100;
  }

  if (data.length <= maxPoints) {
    return data;
  }

  // Para gráficos de pastel/dona, tomar los top N y agrupar el resto
  if (chartType === 'PIE' || chartType === 'DONUT') {
    const sorted = [...data].sort((a, b) => {
      const aValue = Object.values(a).find(v => typeof v === 'number') as number || 0;
      const bValue = Object.values(b).find(v => typeof v === 'number') as number || 0;
      return bValue - aValue;
    });

    const topItems = sorted.slice(0, maxPoints - 1);
    const others = sorted.slice(maxPoints - 1);

    if (others.length > 0) {
      const othersSum = others.reduce((sum, item) => {
        const value = Object.values(item).find(v => typeof v === 'number') as number || 0;
        return sum + value;
      }, 0);

      const valueKey = Object.keys(topItems[0]).find(
        key => typeof topItems[0][key] === 'number'
      ) || 'value';

      topItems.push({
        [valueKey]: othersSum,
        name: 'Otros',
        label: 'Otros'
      });
    }

    return topItems;
  }

  // Para otros gráficos, tomar muestra uniforme
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
}

/**
 * Formatea valor para tooltip
 */
export function formatTooltipValue(
  value: any,
  format?: 'number' | 'currency' | 'percentage'
): string {
  if (value === null || value === undefined) {
    return '-';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return String(value);
  }

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB'
      }).format(numValue);

    case 'percentage':
      return new Intl.NumberFormat('es-BO', {
        style: 'percent',
        minimumFractionDigits: 2
      }).format(numValue / 100);

    case 'number':
    default:
      return new Intl.NumberFormat('es-BO').format(numValue);
  }
}

/**
 * Obtiene altura recomendada para el gráfico según tipo
 */
export function getRecommendedHeight(chartType: ChartType): number {
  switch (chartType) {
    case 'HORIZONTAL_BAR':
      return 500; // Más alto para barras horizontales
    case 'PIE':
    case 'DONUT':
      return 350; // Más compacto para gráficos circulares
    default:
      return 400; // Altura estándar
  }
}

/**
 * Valida configuración de gráfico
 */
export function validateChartConfig(config: ChartConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.chart_type) {
    errors.push('Tipo de gráfico no especificado');
  }

  if (!config.title) {
    errors.push('Título del gráfico no especificado');
  }

  // Validar campos según tipo de gráfico
  if (['BAR', 'LINE', 'HORIZONTAL_BAR', 'STACKED_BAR'].includes(config.chart_type)) {
    if (!config.x_field) {
      errors.push('Campo X no especificado');
    }
    if (!config.y_field) {
      errors.push('Campo Y no especificado');
    }
  }

  if (['PIE', 'DONUT'].includes(config.chart_type)) {
    if (!config.value_field) {
      errors.push('Campo de valor no especificado');
    }
    if (!config.label_field) {
      errors.push('Campo de etiqueta no especificado');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
