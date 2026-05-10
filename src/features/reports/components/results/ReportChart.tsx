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
  ResponsiveContainer
} from 'recharts';
import { AlertCircle, BarChart3 } from 'lucide-react';
import type { ChartConfig, ChartType } from '../../types';
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
  config: ChartConfig;
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
  // Validar configuración
  const validation = validateChartConfig(config);
  
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

  const chartData = prepareChartData(data, type);
  const chartHeight = height || getRecommendedHeight(type);

  return (
    <div className={styles.chartContainer}>
      {config.title && (
        <h3 className={styles.chartTitle}>{config.title}</h3>
      )}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          {renderChart(type, chartData, config)}
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
