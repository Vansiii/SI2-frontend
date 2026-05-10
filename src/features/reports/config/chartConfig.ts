/**
 * Configuración global de gráficos con Recharts
 */

// Paleta de colores principal
export const CHART_COLORS = {
  primary: '#0088FE',
  secondary: '#00C49F',
  tertiary: '#FFBB28',
  quaternary: '#FF8042',
  quinary: '#8884D8',
  senary: '#FF6B6B',
  septenary: '#4ECDC4',
  octonary: '#95E1D3',
  nonary: '#F38181',
  denary: '#AA96DA'
};

// Array de colores para uso en gráficos
export const CHART_COLOR_PALETTE = Object.values(CHART_COLORS);

// Configuración de grid
export const GRID_CONFIG = {
  strokeDasharray: '3 3',
  stroke: '#e0e0e0',
  opacity: 0.5
};

// Configuración de tooltips
export const TOOLTIP_CONFIG = {
  contentStyle: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  labelStyle: {
    color: '#333333',
    fontWeight: 600,
    marginBottom: '8px'
  },
  itemStyle: {
    color: '#666666',
    padding: '4px 0'
  },
  cursor: {
    fill: 'rgba(0, 0, 0, 0.05)'
  }
};

// Configuración de leyenda
export const LEGEND_CONFIG = {
  wrapperStyle: {
    paddingTop: '20px'
  },
  iconType: 'circle' as const,
  iconSize: 10
};

// Configuración de ejes
export const AXIS_CONFIG = {
  tick: {
    fill: '#666666',
    fontSize: 12
  },
  axisLine: {
    stroke: '#e0e0e0'
  },
  tickLine: {
    stroke: '#e0e0e0'
  }
};

// Configuración de animación
export const ANIMATION_CONFIG = {
  animationDuration: 800,
  animationEasing: 'ease-in-out' as const
};

// Configuración de responsive
export const RESPONSIVE_CONFIG = {
  minHeight: 300,
  defaultHeight: 400,
  maxHeight: 600,
  aspectRatio: 16 / 9
};

// Límite de datos para gráficos
export const DATA_LIMITS = {
  maxPointsBar: 50,
  maxPointsLine: 100,
  maxPointsPie: 10,
  maxPointsDonut: 10
};
