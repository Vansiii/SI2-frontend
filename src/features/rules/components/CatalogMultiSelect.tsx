/**
 * Componente para selección múltiple de catálogos
 * 
 * Permite seleccionar múltiples items de un catálogo
 * con una interfaz visual de botones seleccionables.
 */

import React from 'react';
import { Check } from 'lucide-react';
import { Label } from '../../../components/ui/Label';

interface CatalogItem {
  id: number;
  code: string;
  name: string;
}

interface CatalogMultiSelectProps {
  label: string;
  items: CatalogItem[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  error?: string;
  isLoading?: boolean;
  helpText?: string;
}

/**
 * Componente de selección múltiple para catálogos
 * 
 * @example
 * ```tsx
 * <CatalogMultiSelect
 *   label="Monedas Permitidas"
 *   items={currencies}
 *   selectedIds={formData.allowed_currencies}
 *   onChange={(ids) => setFormData(prev => ({ ...prev, allowed_currencies: ids }))}
 *   isLoading={currenciesLoading}
 *   error={errors.allowed_currencies}
 * />
 * ```
 */
export function CatalogMultiSelect({
  label,
  items,
  selectedIds,
  onChange,
  disabled = false,
  error,
  isLoading = false,
  helpText,
}: CatalogMultiSelectProps) {
  const handleToggle = (id: number) => {
    if (disabled) return;
    
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-transparent">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </Label>
        {selectedIds.length > 0 && (
          <span className="text-xs font-bold text-slate-500">
            {selectedIds.length} seleccionado{selectedIds.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {helpText && (
        <p className="text-xs text-slate-600">{helpText}</p>
      )}
      
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full" />
          <span>Cargando opciones...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-slate-500 py-2">
          No hay opciones disponibles
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map(item => {
            const isSelected = selectedIds.includes(item.id);
            
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggle(item.id)}
                disabled={disabled}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${isSelected 
                    ? 'bg-(--tenant-primary) text-white shadow-md' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                `}
              >
                {isSelected && <Check className="h-4 w-4" />}
                <span>{item.name}</span>
                <span className="text-xs opacity-70">({item.code})</span>
              </button>
            );
          })}
        </div>
      )}
      
      {error && (
        <p className="text-xs font-bold text-red-500">{error}</p>
      )}
    </div>
  );
}
