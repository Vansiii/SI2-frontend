import { Sparkles, Check } from 'lucide-react';

interface ColorPalette {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  category: 'professional' | 'modern' | 'vibrant' | 'elegant';
}

interface ColorPaletteSuggestionsProps {
  onApplyPalette: (colors: ColorPalette['colors']) => void;
  currentColors?: ColorPalette['colors'];
}

const SUGGESTED_PALETTES: ColorPalette[] = [
  {
    name: 'Azul Corporativo',
    description: 'Profesional y confiable, ideal para instituciones financieras',
    category: 'professional',
    colors: {
      primary: '#2563EB',
      secondary: '#0F172A',
      accent: '#0EA5E9',
      background: '#F8FAFC',
      text: '#0F172A',
    },
  },
  {
    name: 'Verde Financiero',
    description: 'Transmite crecimiento y estabilidad económica',
    category: 'professional',
    colors: {
      primary: '#10B981',
      secondary: '#064E3B',
      accent: '#34D399',
      background: '#F0FDF4',
      text: '#064E3B',
    },
  },
  {
    name: 'Púrpura Moderno',
    description: 'Innovador y tecnológico, para fintech modernas',
    category: 'modern',
    colors: {
      primary: '#8B5CF6',
      secondary: '#1E1B4B',
      accent: '#A78BFA',
      background: '#FAF5FF',
      text: '#1E1B4B',
    },
  },
  {
    name: 'Naranja Energético',
    description: 'Dinámico y accesible, ideal para microfinanzas',
    category: 'vibrant',
    colors: {
      primary: '#F59E0B',
      secondary: '#78350F',
      accent: '#FBBF24',
      background: '#FFFBEB',
      text: '#78350F',
    },
  },
  {
    name: 'Índigo Elegante',
    description: 'Sofisticado y premium, para banca privada',
    category: 'elegant',
    colors: {
      primary: '#4F46E5',
      secondary: '#1E1B4B',
      accent: '#818CF8',
      background: '#F5F3FF',
      text: '#1E1B4B',
    },
  },
  {
    name: 'Teal Contemporáneo',
    description: 'Fresco y moderno, equilibrio perfecto',
    category: 'modern',
    colors: {
      primary: '#14B8A6',
      secondary: '#134E4A',
      accent: '#5EEAD4',
      background: '#F0FDFA',
      text: '#134E4A',
    },
  },
  {
    name: 'Rojo Dinámico',
    description: 'Audaz y llamativo, para destacar',
    category: 'vibrant',
    colors: {
      primary: '#EF4444',
      secondary: '#7F1D1D',
      accent: '#F87171',
      background: '#FEF2F2',
      text: '#7F1D1D',
    },
  },
  {
    name: 'Gris Minimalista',
    description: 'Limpio y profesional, enfoque en contenido',
    category: 'elegant',
    colors: {
      primary: '#475569',
      secondary: '#0F172A',
      accent: '#64748B',
      background: '#F8FAFC',
      text: '#0F172A',
    },
  },
];

const CATEGORY_LABELS = {
  professional: 'Profesional',
  modern: 'Moderno',
  vibrant: 'Vibrante',
  elegant: 'Elegante',
};

function colorsMatch(colors1?: ColorPalette['colors'], colors2?: ColorPalette['colors']): boolean {
  if (!colors1 || !colors2) return false;
  return (
    colors1.primary.toUpperCase() === colors2.primary.toUpperCase() &&
    colors1.secondary.toUpperCase() === colors2.secondary.toUpperCase() &&
    colors1.accent.toUpperCase() === colors2.accent.toUpperCase() &&
    colors1.background.toUpperCase() === colors2.background.toUpperCase() &&
    colors1.text.toUpperCase() === colors2.text.toUpperCase()
  );
}

export function ColorPaletteSuggestions({ onApplyPalette, currentColors }: ColorPaletteSuggestionsProps) {
  const groupedPalettes = SUGGESTED_PALETTES.reduce((acc, palette) => {
    if (!acc[palette.category]) {
      acc[palette.category] = [];
    }
    acc[palette.category].push(palette);
    return acc;
  }, {} as Record<ColorPalette['category'], ColorPalette[]>);

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm p-6 md:p-7 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Paletas sugeridas</h2>
          <p className="text-sm text-slate-500">Combinaciones armoniosas listas para usar</p>
        </div>
      </div>

      {Object.entries(groupedPalettes).map(([category, palettes]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {CATEGORY_LABELS[category as ColorPalette['category']]}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {palettes.map((palette) => {
              const isActive = colorsMatch(currentColors, palette.colors);
              
              return (
                <button
                  key={palette.name}
                  type="button"
                  onClick={() => onApplyPalette(palette.colors)}
                  className={`
                    relative group text-left p-4 rounded-xl border-2 transition-all duration-200
                    ${isActive 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' 
                      : 'border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/50'
                    }
                    hover:shadow-md
                  `}
                >
                  {isActive && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{palette.name}</h4>
                    <p className="text-xs text-slate-500">{palette.description}</p>
                  </div>

                  <div className="flex gap-1.5">
                    <div
                      className="h-8 flex-1 rounded-lg border border-slate-200/50 shadow-sm"
                      style={{ backgroundColor: palette.colors.primary }}
                      title={`Primario: ${palette.colors.primary}`}
                    />
                    <div
                      className="h-8 flex-1 rounded-lg border border-slate-200/50 shadow-sm"
                      style={{ backgroundColor: palette.colors.secondary }}
                      title={`Secundario: ${palette.colors.secondary}`}
                    />
                    <div
                      className="h-8 flex-1 rounded-lg border border-slate-200/50 shadow-sm"
                      style={{ backgroundColor: palette.colors.accent }}
                      title={`Acento: ${palette.colors.accent}`}
                    />
                    <div
                      className="h-8 flex-1 rounded-lg border border-slate-200/50 shadow-sm"
                      style={{ backgroundColor: palette.colors.background }}
                      title={`Fondo: ${palette.colors.background}`}
                    />
                    <div
                      className="h-8 flex-1 rounded-lg border border-slate-200/50 shadow-sm"
                      style={{ backgroundColor: palette.colors.text }}
                      title={`Texto: ${palette.colors.text}`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          💡 Haz clic en cualquier paleta para aplicarla instantáneamente
        </p>
      </div>
    </div>
  );
}
