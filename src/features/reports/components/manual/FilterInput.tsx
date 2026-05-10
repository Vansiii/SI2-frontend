import type { FilterDefinitionExtended } from '../../types';
import { getFilterLabel } from '../../utils/helpers';
import styles from './FilterInput.module.css';

export interface FilterInputProps {
  /** Nombre del campo */
  field: string;
  
  /** Definición del filtro */
  definition: FilterDefinitionExtended;
  
  /** Valor actual */
  value: any;
  
  /** Callback al cambiar valor */
  onChange: (value: any) => void;
  
  /** Está deshabilitado */
  disabled?: boolean;
  
  /** Mensaje de error */
  error?: string;
}

export function FilterInput({
  field,
  definition,
  value,
  onChange,
  disabled = false,
  error
}: FilterInputProps) {
  const label = getFilterLabel(field);
  const isRequired = definition.required || false;

  // Validar valor al cambiar
  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  // Renderizar input según tipo
  const renderInput = () => {
    switch (definition.type) {
      case 'choice':
        return renderChoiceInput();
      
      case 'date':
      case 'datetime':
        return renderDateInput();
      
      case 'integer':
      case 'decimal':
        return renderNumberInput();
      
      case 'boolean':
        return renderBooleanInput();
      
      case 'text':
      default:
        return renderTextInput();
    }
  };

  // Input de selección (choice)
  const renderChoiceInput = () => {
    const isMultiple = definition.operators?.includes('in');
    const choices = definition.values || [];

    if (isMultiple) {
      return (
        <select
          multiple
          value={Array.isArray(value) ? value : []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            handleChange(selected);
          }}
          disabled={disabled}
          className={styles.select}
          size={Math.min(choices.length, 5)}
        >
          {choices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <select
        value={value || ''}
        onChange={(e) => handleChange(e.target.value || null)}
        disabled={disabled}
        className={styles.select}
      >
        <option value="">Seleccionar...</option>
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    );
  };

  // Input de fecha
  const renderDateInput = () => {
    const inputType = definition.type === 'datetime' ? 'datetime-local' : 'date';
    
    return (
      <input
        type={inputType}
        value={value || ''}
        onChange={(e) => handleChange(e.target.value || null)}
        disabled={disabled}
        className={styles.input}
      />
    );
  };

  // Input numérico
  const renderNumberInput = () => {
    const step = definition.type === 'decimal' ? '0.01' : '1';
    
    return (
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          if (val === '') {
            handleChange(null);
          } else {
            const numVal = definition.type === 'integer' 
              ? parseInt(val, 10) 
              : parseFloat(val);
            handleChange(isNaN(numVal) ? null : numVal);
          }
        }}
        step={step}
        disabled={disabled}
        className={styles.input}
        placeholder={`Ingrese ${label.toLowerCase()}`}
      />
    );
  };

  // Input booleano
  const renderBooleanInput = () => {
    return (
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => handleChange(e.target.checked)}
          disabled={disabled}
          className={styles.checkbox}
        />
        <span>{label}</span>
      </label>
    );
  };

  // Input de texto
  const renderTextInput = () => {
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => handleChange(e.target.value || null)}
        disabled={disabled}
        className={styles.input}
        placeholder={`Ingrese ${label.toLowerCase()}`}
      />
    );
  };

  // Para checkbox, no mostrar label arriba
  if (definition.type === 'boolean') {
    return (
      <div className={styles.filterGroup}>
        {renderInput()}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  }

  return (
    <div className={styles.filterGroup}>
      <label className={styles.label}>
        {label}
        {isRequired && <span className={styles.required}>*</span>}
      </label>
      {renderInput()}
      {definition.description && (
        <p className={styles.description}>{definition.description}</p>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
