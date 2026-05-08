import { useState, useRef, useEffect } from 'react';
import { Check, Pipette, X, Palette } from 'lucide-react';

interface ColorPickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  description?: string;
  presetColors?: string[];
}

const DEFAULT_PRESET_COLORS = [
  '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', // Blues
  '#0EA5E9', '#06B6D4', '#22D3EE', '#67E8F9', // Cyans
  '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', // Greens
  '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', // Ambers
  '#EF4444', '#F87171', '#FCA5A5', '#FECACA', // Reds
  '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', // Purples
  '#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8', // Pinks
  '#0F172A', '#1E293B', '#334155', '#475569', // Slates
];

function isValidHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());
}

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith('#')) {
    return `#${trimmed.toUpperCase()}`;
  }

  const body = trimmed.slice(1);
  if (body.length === 3) {
    return `#${body
      .split('')
      .map((char) => char + char)
      .join('')
      .toUpperCase()}`;
  }

  return `#${body.toUpperCase()}`;
}

export function ColorPicker({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = '#000000',
  description,
  presetColors = DEFAULT_PRESET_COLORS,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (isValidHexColor(newValue)) {
      onChange(normalizeHex(newValue));
    }
  };

  const handleInputBlur = () => {
    if (isValidHexColor(inputValue)) {
      onChange(normalizeHex(inputValue));
    } else {
      setInputValue(value);
    }
  };

  const handlePresetClick = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  const handleColorButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNativePickerClick = () => {
    colorInputRef.current?.click();
  };

  const handleNativePickerChange = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  const currentColor = isValidHexColor(inputValue) ? normalizeHex(inputValue) : '#CCCCCC';

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>

      <div className="relative" ref={dropdownRef}>
        {/* Input principal con preview de color */}
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={handleColorButtonClick}
            className={`
              h-11 w-11 rounded-xl border-2 transition-all duration-200 flex-shrink-0 relative
              ${error ? 'border-red-300' : 'border-slate-200 hover:border-blue-400'}
              ${isOpen ? 'ring-2 ring-blue-100 border-blue-400' : ''}
              shadow-sm hover:shadow-md group
            `}
            style={{ backgroundColor: currentColor }}
            aria-label="Abrir selector de color"
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Palette className="h-5 w-5 text-white drop-shadow-lg" />
            </div>
            <span className="sr-only">Color actual: {currentColor}</span>
          </button>

          <div className="flex-1 relative">
            <input
              id={id}
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={handleInputBlur}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className={`
                w-full h-11 px-4 pr-10 rounded-xl border-2 transition-all duration-200
                font-mono text-sm font-medium
                ${error 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                  : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                }
                focus:outline-none focus:ring-2
                bg-white shadow-sm
              `}
            />
            {isValidHexColor(inputValue) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Check className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleNativePickerClick}
            className="h-11 px-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 
                     bg-white hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md
                     flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <Pipette className="h-4 w-4" />
            <span className="hidden sm:inline">Avanzado</span>
          </button>
        </div>

        {/* Dropdown con paleta de colores predefinidos - Posición dinámica */}
        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl border-2 border-slate-200 shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Colores predefinidos</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-8 gap-2 mb-3">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handlePresetClick(color)}
                  className={`
                    h-10 w-full rounded-lg border-2 transition-all duration-200
                    hover:scale-110 hover:shadow-lg relative
                    ${currentColor.toUpperCase() === color.toUpperCase() 
                      ? 'border-slate-900 ring-2 ring-slate-300' 
                      : 'border-slate-200 hover:border-slate-400'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {currentColor.toUpperCase() === color.toUpperCase() && (
                    <Check className="h-4 w-4 mx-auto text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                Haz clic en un color o usa el botón "Avanzado" para más opciones
              </p>
            </div>
          </div>
        )}

        {/* Input nativo de color (oculto pero funcional) */}
        <input
          ref={colorInputRef}
          type="color"
          value={currentColor}
          onChange={(e) => handleNativePickerChange(e.target.value)}
          className="absolute opacity-0 pointer-events-none"
          style={{ width: '1px', height: '1px' }}
          tabIndex={-1}
        />
      </div>

      {/* Descripción */}
      {description && !error && (
        <p className="mt-2 text-xs text-slate-500">{description}</p>
      )}

      {/* Error */}
      {error && (
        <p className="mt-2 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
