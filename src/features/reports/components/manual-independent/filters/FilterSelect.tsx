/**
 * Componente de Selector para Filtros
 * 
 * Selector reutilizable con búsqueda para filtros de reportes.
 */

import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { FilterOption } from '../../../hooks/useFilterOptions';

interface Props {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  options: FilterOption[];
  placeholder?: string;
  displayField?: 'name' | 'email' | 'document';
  secondaryField?: 'code' | 'email' | 'document' | 'city';
  isLoading?: boolean;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  displayField = 'name',
  secondaryField,
  isLoading = false,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filtrar opciones según el término de búsqueda
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    
    const term = searchTerm.toLowerCase();
    return options.filter(option => {
      const primary = option[displayField]?.toString().toLowerCase() || '';
      const secondary = secondaryField ? option[secondaryField]?.toString().toLowerCase() || '' : '';
      return primary.includes(term) || secondary.includes(term);
    });
  }, [options, searchTerm, displayField, secondaryField]);

  // Obtener la opción seleccionada
  const selectedOption = options.find(opt => opt.id === value);

  const handleSelect = (optionId: number) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      {/* Selector Principal */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {isLoading ? 'Cargando...' : selectedOption ? selectedOption[displayField] : placeholder}
          </span>
          
          <div className="flex items-center gap-1">
            {selectedOption && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded"
                title="Limpiar"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
            {/* Búsqueda */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de opciones */}
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={`w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors ${
                      option.id === value ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    <div className="font-medium">{option[displayField]}</div>
                    {secondaryField && option[secondaryField] && (
                      <div className="text-sm text-gray-500">{option[secondaryField]}</div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay para cerrar el dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default FilterSelect;
