import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { AlertCircle, BarChart3 } from 'lucide-react';
import type { ChartConfig, ChartType, ChartSpecificConfig } from '../../types';
import {
  CHART_COLOR_PALETTE,
  GRID_CONFIG,
  LEGEND_CONFIG,
  AXIS_CONFIG,
  ANIMATION_CONFIG
} from '../../config/chartConfig';
import {
  prepareChartData,
  getColorForIndex,
  getRecommendedHeight,
  validateChartConfig
} from '../../utils/chartHelpers';
import { CustomTooltip } from './CustomTooltip';
import styles from './ReportChart.module.css';

export interface ReportChartProps {
  type: ChartType;
  data: Record<string, any>[];
  config: ChartConfig | ChartSpecificConfig;
  height?: number;
  loading?: boolean;
}

export function ReportChart({
  type,
  data,
  config,
  height,
  loading = false
}: ReportChartProps) {
  // Validar que config existe
  if (!config) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartError}>
          <AlertCircle />
          <p>Configuración de gráfico no disponible</p>
        </div>
      </div>
    );
  }

  // ✅ NUEVO: Detectar si es ChartSpecificConfig del backend
  const isBackendConfig = 'data_key' in config || 'x_axis' in config || 'metrics' in config;
  
  // Validar configuración solo si es ChartConfig tradicional
  if (!isBackendConfig) {
    const validation = validateChartConfig(config as ChartConfig);
    
    if (!validation.valid) {
      return (
        <div className={styles.chartContainer}>
          <div className={styles.chartError}>
            <AlertCircle />
            <p>Error en configuración del gráfico</p>
            <ul>
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartLoading}>
          <p>Cargando gráfico...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartEmpty}>
          <BarChart3 />
          <p>No hay datos para mostrar</p>
        </div>
      </div>
    );
  }

  // ✅ MODIFICADO: Usar datos directamente si es backend config
  const chartData = isBackendConfig ? data : prepareChartData(data, type);
  const chartHeight = height || getRecommendedHeight(type);

  // ✅ NUEVO: Determinar tipo de gráfico del backend config
  const chartType = isBackendConfig 
    ? ((config as ChartSpecificConfig).type || type)
    : type;

  return (
    <div className={styles.chartContainer}>
      {(config as any).title && (
        <h3 className={styles.chartTitle}>{(config as any).title}</h3>
      )}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          {isBackendConfig 
            ? renderBackendChart(chartType, chartData, config as ChartSpecificConfig)
            : renderChart(type, chartData, config as ChartConfig)
          }
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function renderChart(
  type: ChartType,
  data: Record<string, any>[],
  config: ChartConfig
): React.ReactElement {
  switch (type) {
    case 'BAR':
      return renderBarChart(data, config, false);
    case 'HORIZONTAL_BAR':
      return renderBarChart(data, config, true);
    case 'LINE':
      return renderLineChart(data, config);
    case 'PIE':
      return renderPieChart(data, config, false);
    case 'DONUT':
      return renderPieChart(data, config, true);
    case 'STACKED_BAR':
      return renderStackedBarChart(data, config);
    default:
      return <div>Tipo de gráfico no soportado</div>;
  }
}

function renderBarChart(
  data: Record<string, any>[],
  config: ChartConfig,
  horizontal: boolean
): React.ReactElement {
  const layout = horizontal ? 'horizontal' : 'vertical';

  return (
    <BarChart
      data={data}
      layout={layout}
      {...ANIMATION_CONFIG}
    >
      {config.show_grid !== false && <CartesianGrid {...GRID_CONFIG} />}
      
      {horizontal ? (
        <>
          <XAxis type="number" {...AXIS_CONFIG} />
          <YAxis type="category" dataKey={config.x_field} {...AXIS_CONFIG} />
        </>
      ) : (
        <>
          <XAxis dataKey={config.x_field} {...AXIS_CONFIG} />
          <YAxis {...AXIS_CONFIG} />
        </>
      )}
      
      <Tooltip
        content={<CustomTooltip valueFormat={config.value_format} />}
      />
      
      {config.show_legend !== false && <Legend {...LEGEND_CONFIG} />}
      
      <Bar
        dataKey={config.y_field}
        fill={config.colors?.[0] || CHART_COLOR_PALETTE[0]}
        radius={[8, 8, 0, 0]}
      />
    </BarChart>
  );
}

function renderLineChart(
  data: Record<string, any>[],
  config: ChartConfig
): React.ReactElement {
  return (
    <LineChart data={data} {...ANIMATION_CONFIG}>
      {config.show_grid !== false && <CartesianGrid {...GRID_CONFIG} />}
      
      <XAxis dataKey={config.x_field} {...AXIS_CONFIG} />
      <YAxis {...AXIS_CONFIG} />
      
      <Tooltip
        content={<CustomTooltip valueFormat={config.value_format} />}
      />
      
      {config.show_legend !== false && <Legend {...LEGEND_CONFIG} />}
      
      <Line
        type="monotone"
        dataKey={config.y_field}
        stroke={config.colors?.[0] || CHART_COLOR_PALETTE[0]}
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  );
}

function renderPieChart(
  data: Record<string, any>[],
  config: ChartConfig,
  isDonut: boolean
): React.ReactElement {
  const valueField = config.value_field || 'value';
  const labelField = config.label_field || 'name';

  return (
    <PieChart>
      <Pie
        data={data}
        dataKey={valueField}
        nameKey={labelField}
        cx="50%"
        cy="50%"
        innerRadius={isDonut ? 60 : 0}
        outerRadius={100}
        label={(entry) => entry[labelField]}
        {...ANIMATION_CONFIG}
      >
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={
              config.colors?.[index] ||
              getColorForIndex(index)
            }
          />
        ))}
      </Pie>
      
      <Tooltip
        content={<CustomTooltip valueFormat={config.value_format} />}
      />
      
      {config.show_legend !== false && <Legend {...LEGEND_CONFIG} />}
    </PieChart>
  );
}

function renderStackedBarChart(
  data: Record<string, any>[],
  config: ChartConfig
): React.ReactElement {
  const stackFields = config.stack_fields || [config.y_field];

  return (
    <BarChart data={data} {...ANIMATION_CONFIG}>
      {config.show_grid !== false && <CartesianGrid {...GRID_CONFIG} />}
      
      <XAxis dataKey={config.x_field} {...AXIS_CONFIG} />
      <YAxis {...AXIS_CONFIG} />
      
      <Tooltip
        content={<CustomTooltip valueFormat={config.value_format} />}
      />
      
      {config.show_legend !== false && <Legend {...LEGEND_CONFIG} />}
      
      {stackFields.map((field, index) => (
        <Bar
          key={field}
          dataKey={field}
          stackId="stack"
          fill={config.colors?.[index] || getColorForIndex(index)}
        />
      ))}
    </BarChart>
  );
}

// ============================================================================
// ✅ NUEVO: Renderizado basado en configuración del backend
// ============================================================================

/**
 * Renderiza gráfico basado en ChartSpecificConfig del backend
 */
function renderBackendChart(
  type: string,
  data: Record<string, any>[],
  config: ChartSpecificConfig
): React.ReactElement {
  const normalizedType = type.toLowerCase();

  switch (normalizedType) {
    case 'donut':
      return renderBackendDonutChart(data, config);
    case 'pie':
      return renderBackendPieChart(data, config);
    case 'bar':
      return renderBackendBarChart(data, config, false);
    case 'horizontal_bar':
      return renderBackendBarChart(data, config, true);
    case 'line':
      return renderBackendLineChart(data, config);
    case 'area':
      return renderBackendAreaChart(data, config);
    case 'gauge':
      return renderBackendGaugeChart(data, config);
    default:
      console.warn(`Tipo de gráfico no soportado: ${type}`);
      return <div>Tipo de gráfico no soportado: {type}</div>;
  }
}

/**
 * Renderiza Donut Chart con configuración del backend
 */
function renderBackendDonutChart(
  data: Record<string, any>[],
  config: ChartSpecificConfig
): React.ReactElement {
  const dataKey = config.data_key || 'value';
  const nameKey = config.name_key || 'name';
  const colors = config.colors || CHART_COLOR_PALETTE;

  return (
    <PieChart>
      <Pie
        data={data}
        dataKey={dataKey}
        nameKey={nameKey}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={100}
        label={(entry) => `${entry[nameKey]}: ${entry[dataKey]}`}
        {...ANIMATION_CONFIG}
      >
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={colors[index % colors.length]}
          />
        ))}
      </Pie>
      <Tooltip />
      <Legend {...LEGEND_CONFIG} />
    </PieChart>
  );
}

/**
 * Renderiza Pie Chart con configuración del backend
 */
function renderBackendPieChart(
  data: Record<string, any>[],
  config: ChartSpecificConfig
): React.ReactElement {
  const dataKey = config.data_key || 'value';
  const nameKey = config.name_key || 'name';
  const colors = config.colors || CHART_COLOR_PALETTE;

  return (
    <PieChart>
      <Pie
        data={data}
        dataKey={dataKey}
        nameKey={nameKey}
        cx="50%"
        cy="50%"
        outerRadius={100}
        label={(entry) => `${entry[nameKey]}: ${entry[dataKey]}`}
        {...ANIMATION_CONFIG}
      >
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={colors[index % colors.length]}
          />
        ))}
      </Pie>
      <Tooltip />
      <Legend {...LEGEND_CONFIG} />
    </PieChart>
  );
}

/**
 * Renderiza Bar Chart con configuración del backend
 */
function renderBackendBarChart(
  data: Record<string, any>[],
  config: ChartSpecificConfig,
  horizontal: boolean
): React.ReactElement {
  const xAxis = config.x_axis || 'name';
  const yAxes = config.y_axes || [];
  const layout = horizontal ? 'horizontal' : 'vertical';

  // Si no hay y_axes, usar y_axis o data_key
  const bars = yAxes.length > 0 
    ? yAxes 
    : [{
        key: config.y_axis || config.data_key || 'value',
        color: config.color || CHART_COLOR_PALETTE[0],
        label: config.label || 'Valor'
      }];

  return (
    <BarChart
      data={data}
      layout={layout}
      {...ANIMATION_CONFIG}
    >
      <CartesianGrid {...GRID_CONFIG} />
      
      {horizontal ? (
        <>
          <XAxis type="number" {...AXIS_CONFIG} />
          <YAxis type="category" dataKey={xAxis} {...AXIS_CONFIG} />
        </>
      ) : (
        <>
          <XAxis dataKey={xAxis} {...AXIS_CONFIG} />
          <YAxis {...AXIS_CONFIG} />
        </>
      )}
      
      <Tooltip />
      <Legend {...LEGEND_CONFIG} />
      
      {bars.map((bar, index) => (
        <Bar
          key={bar.key}
          dataKey={bar.key}
          fill={bar.color}
          name={bar.label}
          radius={[8, 8, 0, 0]}
        />
      ))}
    </BarChart>
  );
}

/**
 * Renderiza Line Chart con configuración del backend
 */
function renderBackendLineChart(
  data: Record<string, any>[],
  config: ChartSpecificConfig
): React.ReactElement {
  const xAxis = config.x_axis || 'name';
  const yAxes = config.y_axes || [];

  // Si no hay y_axes, usar y_axis o data_key
  const lines = yAxes.length > 0 
    ? yAxes 
    : [{
        key: config.y_axis || config.data_key || 'value',
        color: config.color || CHART_COLOR_PALETTE[0],
        label: config.label || 'Valor'
      }];

  return (
    <LineChart data={data} {...ANIMATION_CONFIG}>
      <CartesianGrid {...GRID_CONFIG} />
      
      <XAxis dataKey={xAxis} {...AXIS_CONFIG} />
      <YAxis {...AXIS_CONFIG} />
      
      <Tooltip />
      <Legend {...LEGEND_CONFIG} />
      
      {lines.map((line, index) => (
        <Line
          key={line.key}
          type="monotone"
          dataKey={line.key}
          stroke={line.color}
          strokeWidth={2}
          name={line.label}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      ))}
    </LineChart>
  );
}

/**
 * Renderiza Area Chart con configuración del backend
 */
function renderBackendAreaChart(
  data: Record<string, any>[],
  config: ChartSpecificConfig
): React.ReactElement {
  const xAxis = config.x_axis || 'name';
  const yAxes = config.y_axes || [];

  // Si no hay y_axes, usar y_axis o data_key
  const areas = yAxes.length > 0 
    ? yAxes 
    : [{
        key: config.y_axis || config.data_key || 'value',
        color: config.color || CHART_COLOR_PALETTE[0],
        label: config.label || 'Valor',
        fill: true
      }];

  return (
    <LineChart data={data} {...ANIMATION_CONFIG}>
      <CartesianGrid {...GRID_CONFIG} />
      
      <XAxis dataKey={xAxis} {...AXIS_CONFIG} />
      <YAxis {...AXIS_CONFIG} />
      
      <Tooltip />
      <Legend {...LEGEND_CONFIG} />
      
      {areas.map((area, index) => (
        <Line
          key={area.key}
          type="monotone"
          dataKey={area.key}
          stroke={area.color}
          strokeWidth={2}
          name={area.label}
          fill={area.fill ? area.color : 'none'}
          fillOpacity={0.3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      ))}
    </LineChart>
  );
}

/**
 * Renderiza Gauge Chart con configuración del backend
 */
function renderBackendGaugeChart(
  data: Record<string, any>[],
  config: ChartSpecificConfig
): React.ReactElement {
  const metrics = config.metrics || [];

  if (metrics.length === 0) {
    return <div>No hay métricas configuradas para el gauge</div>;
  }

  // Preparar datos para RadialBarChart
  const gaugeData = metrics.map((metric, index) => {
    const value = data[0]?.[metric.key] || 0;
    return {
      name: metric.label,
      value: value,
      fill: metric.color
    };
  });

  return (
    <RadialBarChart
      width={400}
      height={300}
      cx="50%"
      cy="50%"
      innerRadius="10%"
      outerRadius="80%"
      data={gaugeData}
      startAngle={180}
      endAngle={0}
    >
      <RadialBar
        minAngle={15}
        label={{ position: 'insideStart', fill: '#fff' }}
        background
        clockWise
        dataKey="value"
      />
      <Legend 
        iconSize={10}
        layout="vertical"
        verticalAlign="middle"
        align="right"
      />
      <Tooltip />
    </RadialBarChart>
  );
}
