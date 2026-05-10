/**
 * Catálogo completo de reportes disponibles
 */
import { useState } from 'react';
import {
  FileText,
  Users,
  FileCheck,
  Shield,
  Building2,
  UserCog,
  CreditCard,
  Receipt,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { ReportCategoryCard } from './ReportCategoryCard';
import { ReportTypeCard } from './ReportTypeCard';
import type { ReportScope, ReportCategory, ReportDefinition } from '../../types';
import { useReportCatalog } from '../../hooks';

interface ReportCatalogProps {
  scope: ReportScope;
  onSelectReport: (category: ReportCategory, reportType: string) => void;
}

// Iconos por categoría
const CATEGORY_ICONS: Record<ReportCategory, React.ReactNode> = {
  CREDITS: <CreditCard />,
  CUSTOMERS: <Users />,
  DOCUMENTS: <FileCheck />,
  IDENTITY_VERIFICATION: <Shield />,
  TENANTS: <Building2 />,
  USERS: <UserCog />,
  PLANS: <Receipt />,
  SUBSCRIPTIONS: <FileText />,
};

// Descripciones por categoría
const CATEGORY_DESCRIPTIONS: Record<ReportCategory, string> = {
  CREDITS: 'Reportes de créditos, solicitudes, desembolsos y estados',
  CUSTOMERS: 'Reportes de clientes, segmentación y análisis',
  DOCUMENTS: 'Reportes de documentos requeridos y estados',
  IDENTITY_VERIFICATION: 'Reportes de verificación de identidad y proveedores',
  TENANTS: 'Reportes de tenants, planes y configuraciones',
  USERS: 'Reportes de usuarios, roles y actividad',
  PLANS: 'Reportes de planes de suscripción y características',
  SUBSCRIPTIONS: 'Reportes de suscripciones activas e ingresos',
};

export function ReportCatalog({ scope, onSelectReport }: ReportCatalogProps) {
  const { catalog, loading, error } = useReportCatalog();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');

  // DEBUG: Logs temporales
  console.log('🔍 ReportCatalog DEBUG:', {
    scope,
    loading,
    error,
    catalog,
    hasCatalog: !!catalog,
    hasScope: catalog ? !!catalog[scope] : false,
    scopeKeys: catalog ? Object.keys(catalog) : []
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800 font-semibold mb-2">Error al cargar catálogo</p>
        <p className="text-sm text-red-600">{error}</p>
        {error.includes('autenticación') && (
          <p className="text-xs text-red-500 mt-2">
            Por favor, inicia sesión nuevamente para acceder a los reportes.
          </p>
        )}
      </div>
    );
  }

  if (!catalog || !catalog[scope]) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          No hay reportes disponibles para este scope
        </p>
      </div>
    );
  }

  const scopeData = catalog[scope];
  const categories = Object.keys(scopeData) as ReportCategory[];

  // Vista de categorías
  if (!selectedCategory) {
    const filteredCategories = categories.filter((category) => {
      if (!searchTerm) return true;
      const categoryLabel = CATEGORY_DESCRIPTIONS[category].toLowerCase();
      return categoryLabel.includes(searchTerm.toLowerCase());
    });

    return (
      <div className="space-y-6">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Grid de categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <ReportCategoryCard
              key={category}
              category={category}
              reportCount={scopeData[category].length}
              icon={CATEGORY_ICONS[category]}
              description={CATEGORY_DESCRIPTIONS[category]}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron categorías</p>
          </div>
        )}
      </div>
    );
  }

  // Vista de reportes de una categoría
  const reports = scopeData[selectedCategory];
  const filteredReports = reports.filter((report) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      report.name.toLowerCase().includes(searchLower) ||
      report.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setSearchTerm('');
          }}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </button>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
            {CATEGORY_ICONS[selectedCategory]}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {CATEGORY_DESCRIPTIONS[selectedCategory].split(',')[0]}
            </h2>
            <p className="text-sm text-gray-500">
              {reports.length} {reports.length === 1 ? 'reporte' : 'reportes'}{' '}
              disponibles
            </p>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar reporte..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Lista de reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <ReportTypeCard
            key={report.report_type}
            report={report}
            onClick={() => onSelectReport(selectedCategory, report.report_type)}
          />
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron reportes</p>
        </div>
      )}
    </div>
  );
}
