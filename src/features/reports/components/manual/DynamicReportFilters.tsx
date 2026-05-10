import React from 'react';
import type { ReportDefinition, ReportConfig, ExportFormat, FilterDefinitionExtended } from '../../types';
import { FilterInput } from './FilterInput';
import { DateRangeSelector } from '../builder/DateRangeSelector';
import { validateFilterValue } from '../../utils/helpers';
import styles from './DynamicReportFilters.module.css';

export interface DynamicReportFiltersProps {
  /** Definición del reporte */
  definition: ReportDefinition;
  
  /** Configuración actual */
  config: ReportConfig;
  
  /** Callback al cambiar configuración */
  onChange: (config: ReportConfig) => void;
}

export function DynamicReportFilters({
  definition,
  config,
  onChange
}: DynamicReportFiltersProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Convertir FilterDefinition a FilterDefinitionExtended
  const convertFilterDefinition = (def: any): FilterDefinitionExtended => {
    return {
      type: def.type,
      operators: ['equals'], // Default operator
      values: def.choices?.map((choice: string) => ({
        value: choice,
        label: choice
      })),
      required: false,
      description: def.label
    };
  };

  // Actualizar filtro específico
  const updateFilter = (field: string, value: any) => {
    const currentFilters = config.filters || [];
    
    // Buscar si ya existe el filtro
    const existingFilterIndex = currentFilters.findIndex(f => f.field === field);
    
    let newFilters;
    if (value === null || value === undefined || value === '') {
      // Remover filtro si el valor está vacío
      newFilters = currentFilters.filter(f => f.field !== field);
    } else {
      const newFilter = {
        field,
        operator: 'equals' as const,
        value
      };
      
      if (existingFilterIndex >= 0) {
        // Actualizar filtro existente
        newFilters = [...currentFilters];
        newFilters[existingFilterIndex] = newFilter;
      } else {
        // Agregar nuevo filtro
        newFilters = [...currentFilters, newFilter];
      }
    }
    
    // Validar el valor
    const filterDef = definition.available_filters.find(f => f.field === field);
    if (filterDef) {
      const extendedDef = convertFilterDefinition(filterDef);
      const validation = validateFilterValue(value, extendedDef);
      
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (validation.valid) {
          delete newErrors[field];
        } else {
          newErrors[field] = validation.error || 'Valor inválido';
        }
        return newErrors;
      });
    }
    
    onChange({
      ...config,
      filters: newFilters
    });
  };

  // Actualizar rango de fechas
  const updateDateRange = (dateRange: any) => {
    onChange({
      ...config,
      date_range: dateRange
    });
  };

  // Actualizar formato de exportación
  const updateFormat = (format: ExportFormat) => {
    // Convertir ExportFormat a ReportFormat (PDF no está soportado en config)
    const reportFormat: 'csv' | 'xlsx' = format === 'pdf' ? 'csv' : format;
    onChange({
      ...config,
      format: reportFormat
    });
  };

  // Limpiar todos los filtros
  const clearFilters = () => {
    onChange({
      ...config,
      filters: [],
      date_range: undefined
    });
    setErrors({});
  };

  // Verificar si hay filtros de fecha
  const hasDateFilters = definition.available_filters.some(
    (filter) => filter.type === 'date'
  );

  // Obtener valor actual de un filtro
  const getFilterValue = (field: string) => {
    const filter = config.filters?.find(f => f.field === field);
    return filter?.value;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Configuración del Reporte</h3>
        <button
          onClick={clearFilters}
          className={styles.clearButton}
          type="button"
        >
          Limpiar Filtros
        </button>
      </div>

      <div className={styles.filtersGrid}>
        {/* Rango de fechas (si aplica) */}
        {hasDateFilters && (
          <div className={styles.filterSection}>
            <h4 className={styles.sectionTitle}>Período</h4>
            <DateRangeSelector
              value={config.date_range || { preset: null, start_date: null, end_date: null }}
              onChange={updateDateRange}
            />
          </div>
        )}

        {/* Filtros específicos del reporte */}
        {definition.available_filters.length > 0 && (
          <div className={styles.filterSection}>
            <h4 className={styles.sectionTitle}>Filtros</h4>
            <div className={styles.filtersContainer}>
              {definition.available_filters.map((filterDef) => {
                const extendedDef = convertFilterDefinition(filterDef);
                return (
                  <FilterInput
                    key={filterDef.field}
                    field={filterDef.field}
                    definition={extendedDef}
                    value={getFilterValue(filterDef.field)}
                    onChange={(value) => updateFilter(filterDef.field, value)}
                    error={errors[filterDef.field]}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Formato de exportación */}
        <div className={styles.filterSection}>
          <h4 className={styles.sectionTitle}>Formato de Exportación</h4>
          <FormatSelector
            value={config.format || 'csv'}
            onChange={updateFormat}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Selector de formato de exportación
 */
interface FormatSelectorProps {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

function FormatSelector({ value, onChange }: FormatSelectorProps) {
  const formats: Array<{ value: ExportFormat; label: string }> = [
    { value: 'csv', label: 'CSV' },
    { value: 'xlsx', label: 'Excel (XLSX)' },
    { value: 'pdf', label: 'PDF' }
  ];

  return (
    <div className={styles.formatSelector}>
      {formats.map((format) => (
        <label key={format.value} className={styles.formatOption}>
          <input
            type="radio"
            name="format"
            value={format.value}
            checked={value === format.value}
            onChange={(e) => onChange(e.target.value as ExportFormat)}
            className={styles.formatRadio}
          />
          <span className={styles.formatLabel}>{format.label}</span>
        </label>
      ))}
    </div>
  );
}
