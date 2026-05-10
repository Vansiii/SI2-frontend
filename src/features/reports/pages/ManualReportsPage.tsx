/**
 * Página completa para reportes manuales
 * Con filtros completos, vista previa y generación en 3 formatos
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Building2, 
  Globe, 
  Filter,
  Eye,
  Download,
  FileSpreadsheet,
  FileDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import type { ReportScope, ReportCategory, ReportConfig, ExportFormat, ReportFormat } from '../types';
import { ReportDataTable } from '../components/results/ReportDataTable';
import { reportService } from '../services/reportService';

// Definición estática de reportes disponibles (SOLO los que existen en el backend)
interface ReportOption {
  value: string;
  label: string;
}

interface ReportCategoriesStructure {
  TENANT: {
    CREDITS: ReportOption[];
    CUSTOMERS: ReportOption[];
    DOCUMENTS: ReportOption[];
    IDENTITY_VERIFICATION: ReportOption[];
  };
  SAAS: {
    TENANTS: ReportOption[];
    USERS: ReportOption[];
    PLANS: ReportOption[];
  };
}

const REPORT_CATEGORIES: ReportCategoriesStructure = {
  TENANT: {
    CREDITS: [
      { value: 'loans_by_status', label: 'Créditos por Estado' },
      { value: 'loans_by_product', label: 'Créditos por Producto' },
      { value: 'loans_by_branch', label: 'Créditos por Sucursal' },
      { value: 'loans_by_date_range', label: 'Créditos por Rango de Fechas' },
      { value: 'active_loans', label: 'Créditos Activos' },
    ],
    CUSTOMERS: [
      { value: 'customers_registered', label: 'Clientes Registrados' },
      { value: 'customers_by_status', label: 'Clientes por Estado' },
      { value: 'customers_with_active_loans', label: 'Clientes con Créditos Activos' },
    ],
    DOCUMENTS: [
      { value: 'applications_with_pending_documents', label: 'Solicitudes con Documentos Pendientes' },
    ],
    IDENTITY_VERIFICATION: [
      { value: 'verifications_by_status', label: 'Verificaciones por Estado' },
    ],
  },
  SAAS: {
    TENANTS: [
      { value: 'tenants_by_plan', label: 'Tenants por Plan' },
      { value: 'tenants_by_status', label: 'Tenants por Estado' },
    ],
    USERS: [
      { value: 'users_by_role', label: 'Usuarios por Rol' },
      { value: 'users_by_status', label: 'Usuarios por Estado' },
    ],
    PLANS: [
      { value: 'plans_overview', label: 'Resumen de Planes' },
    ],
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  CREDITS: 'Créditos',
  CUSTOMERS: 'Clientes',
  DOCUMENTS: 'Documentos',
  IDENTITY_VERIFICATION: 'Verificación de Identidad',
  TENANTS: 'Tenants',
  USERS: 'Usuarios',
  PLANS: 'Planes',
};

export function ManualReportsPage() {
  const navigate = useNavigate();
  
  // Estado de selección
  const [selectedScope, setSelectedScope] = useState<ReportScope>('TENANT');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | ''>('');
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  
  // Estado de filtros
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [branch, setBranch] = useState<string>('');
  const [product, setProduct] = useState<string>('');
  const [employmentType, setEmploymentType] = useState<string>('');
  const [customerStatus, setCustomerStatus] = useState<string>('');
  const [segment, setSegment] = useState<string>('');
  const [documentStatus, setDocumentStatus] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<ReportFormat>('csv');
  
  // Estado de vista previa
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  // Estado de generación
  const [generating, setGenerating] = useState(false);
  const [generatingFormat, setGeneratingFormat] = useState<ExportFormat | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Resetear cuando cambia el reporte
  useEffect(() => {
    setPreviewData([]);
    setPreviewColumns([]);
    setTotalRows(0);
    setPreviewError(null);
    setGenerateError(null);
    // Limpiar filtros
    setDateFrom('');
    setDateTo('');
    setStatus('');
    setRiskLevel('');
    setMinAmount('');
    setMaxAmount('');
    setBranch('');
    setProduct('');
    setEmploymentType('');
    setCustomerStatus('');
    setSegment('');
    setDocumentStatus('');
    setDocumentType('');
  }, [selectedReportType]);

  // Obtener categorías y reportes disponibles
  const availableCategories = Object.keys(REPORT_CATEGORIES[selectedScope]);
  const availableReportTypes: ReportOption[] = selectedCategory
    ? (REPORT_CATEGORIES[selectedScope][selectedCategory as keyof typeof REPORT_CATEGORIES[typeof selectedScope]] as ReportOption[] || [])
    : [];

  // Manejar cambio de scope
  const handleScopeChange = (scope: ReportScope) => {
    setSelectedScope(scope);
    setSelectedCategory('');
    setSelectedReportType('');
  };

  // Manejar cambio de categoría
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category as ReportCategory);
    setSelectedReportType('');
  };

  // Construir configuración del reporte con filtros actuales
  const buildReportConfig = (): ReportConfig | null => {
    if (!selectedCategory || !selectedReportType) return null;

    const filters: any[] = [];

    // Agregar filtros según valores
    if (status) filters.push({ field: 'status', operator: 'in', value: [status] });
    if (riskLevel) filters.push({ field: 'risk_level', operator: 'in', value: [riskLevel] });
    if (minAmount) filters.push({ field: 'requested_amount', operator: 'gte', value: parseFloat(minAmount) });
    if (maxAmount) filters.push({ field: 'requested_amount', operator: 'lte', value: parseFloat(maxAmount) });
    if (branch) filters.push({ field: 'branch_id', operator: 'in', value: [parseInt(branch)] });
    if (product) filters.push({ field: 'product_id', operator: 'in', value: [parseInt(product)] });
    if (employmentType) filters.push({ field: 'employment_type', operator: 'in', value: [employmentType] });
    if (customerStatus) filters.push({ field: 'kyc_status', operator: 'in', value: [customerStatus] });
    if (segment) filters.push({ field: 'risk_level', operator: 'in', value: [segment] });
    if (documentStatus) filters.push({ field: 'document_status', operator: 'in', value: [documentStatus] });
    if (documentType) filters.push({ field: 'document_type', operator: 'in', value: [documentType] });

    // Agregar filtro de rango de fechas si existe
    if (dateFrom && dateTo) {
      filters.push({
        field: 'created_at',
        operator: 'between',
        value: [dateFrom, dateTo]
      });
    } else if (dateFrom) {
      filters.push({
        field: 'created_at',
        operator: 'gte',
        value: dateFrom
      });
    } else if (dateTo) {
      filters.push({
        field: 'created_at',
        operator: 'lte',
        value: dateTo
      });
    }

    // Columnas por defecto según el tipo de reporte
    const defaultColumns = getDefaultColumnsForReport(selectedReportType);

    return {
      scope: selectedScope,
      category: selectedCategory as ReportCategory,
      report_type: selectedReportType,
      filters,
      columns: defaultColumns,
      format: exportFormat
    };
  };

  // Obtener columnas por defecto según el tipo de reporte
  const getDefaultColumnsForReport = (reportType: string): string[] => {
    const columnMap: Record<string, string[]> = {
      // CREDITS - Usar columnas exactas del catálogo del backend
      'loans_by_status': ['application_number', 'status', 'client_name', 'product_name', 'requested_amount', 'created_at'],
      'loans_by_product': ['product_name', 'product_code', 'total_applications', 'approved_count', 'total_approved_amount', 'approval_rate'],
      'loans_by_branch': ['branch_name', 'total_applications', 'approved_count', 'total_approved_amount', 'approval_rate'],
      'loans_by_date_range': ['application_number', 'status', 'client_name', 'product_name', 'requested_amount', 'created_at'],
      'active_loans': ['application_number', 'client_name', 'product_name', 'approved_amount', 'approved_at'],
      
      // CUSTOMERS - Usar columnas exactas del catálogo del backend
      'customers_registered': ['document_number', 'full_name', 'email', 'mobile_phone', 'kyc_status', 'created_at'],
      'customers_by_status': ['document_number', 'full_name', 'email', 'kyc_status', 'is_active', 'created_at'],
      'customers_with_active_loans': ['client_name', 'client_email', 'total_active_loans', 'total_approved_amount'],
      
      // DOCUMENTS - Usar columnas exactas del catálogo del backend
      'applications_with_pending_documents': ['application_number', 'client_name', 'product_name', 'pending_documents_count', 'completion_percentage'],
      
      // IDENTITY_VERIFICATION - Usar columnas exactas del catálogo del backend
      'verifications_by_status': ['client_name', 'client_document', 'status', 'decision', 'started_at', 'completed_at'],
    };

    return columnMap[reportType] || ['application_number', 'created_at'];
  };

  // Generar vista previa
  const handleGeneratePreview = async () => {
    const config = buildReportConfig();
    if (!config) {
      setPreviewError('Por favor selecciona una categoría y tipo de reporte');
      return;
    }

    // Validar rangos de fechas
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setPreviewError('La fecha desde debe ser menor o igual a la fecha hasta');
      return;
    }

    // Validar rangos de montos
    if (minAmount && maxAmount && parseFloat(minAmount) > parseFloat(maxAmount)) {
      setPreviewError('El monto mínimo debe ser menor o igual al monto máximo');
      return;
    }

    setLoadingPreview(true);
    setPreviewError(null);

    try {
      console.log('🔍 Enviando configuración:', config);
      
      const response = await reportService.previewReport({
        config,
        page: 1,
        page_size: 50 // Mostrar primeras 50 filas
      });

      console.log('✅ Respuesta del backend:', response);

      setPreviewData(response.preview_rows);
      setPreviewColumns(response.columns);
      setTotalRows(response.total_rows);

      if (response.preview_rows.length === 0) {
        setPreviewError('No se encontraron registros con los filtros aplicados');
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setPreviewError(err.message || 'Error al generar vista previa');
      setPreviewData([]);
      setPreviewColumns([]);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Generar reporte completo
  const handleGenerateReport = async (format: ExportFormat) => {
    const config = buildReportConfig();
    if (!config) {
      setGenerateError('Por favor selecciona una categoría y tipo de reporte');
      return;
    }

    setGenerating(true);
    setGeneratingFormat(format);
    setGenerateError(null);

    try {
      const reportFormat: ReportFormat = format === 'pdf' ? 'csv' : format;
      const downloadConfig: ReportConfig = { 
        ...config, 
        format: reportFormat 
      };

      const response = await reportService.generateReport({
        config: downloadConfig
      });

      // Descargar archivo
      if (response.file_resource?.download_url) {
        window.open(response.file_resource.download_url, '_blank');
      } else if (response.id) {
        await reportService.downloadReport(response.id);
      }
    } catch (err: any) {
      setGenerateError(err.message || 'Error al generar el reporte');
    } finally {
      setGenerating(false);
      setGeneratingFormat(null);
    }
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setStatus('');
    setRiskLevel('');
    setMinAmount('');
    setMaxAmount('');
    setBranch('');
    setProduct('');
    setEmploymentType('');
    setCustomerStatus('');
    setSegment('');
    setDocumentStatus('');
    setDocumentType('');
    setExportFormat('csv');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/reports')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reportes Manuales
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Configura filtros, previsualiza datos y genera reportes en múltiples formatos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SECCIÓN 1: CONFIGURACIÓN Y FILTROS */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Configuración del Reporte
            </h2>
          </div>

          {/* Selector de Scope */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Alcance del Reporte
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleScopeChange('TENANT')}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                  selectedScope === 'TENANT'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Tenant</div>
                  <div className="text-xs opacity-75">Créditos, Clientes, Documentos</div>
                </div>
              </button>

              <button
                onClick={() => handleScopeChange('SAAS')}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                  selectedScope === 'SAAS'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Globe className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">SaaS</div>
                  <div className="text-xs opacity-75">Tenants, Usuarios, Planes</div>
                </div>
              </button>
            </div>
          </div>

          {/* Selectores de Categoría y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar categoría...</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category] || category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Reporte
              </label>
              <select
                id="reportType"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                disabled={!selectedCategory}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar tipo de reporte...</option>
                {availableReportTypes.map((report) => (
                  <option key={report.value} value={report.value}>
                    {report.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtros Dinámicos */}
          {selectedReportType && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Filtros Adicionales</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Rango de Fechas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filtros específicos para Créditos */}
                {selectedCategory === 'CREDITS' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Todos</option>
                        <option value="DRAFT">Borrador</option>
                        <option value="SUBMITTED">Enviado</option>
                        <option value="IN_REVIEW">En Revisión</option>
                        <option value="APPROVED">Aprobado</option>
                        <option value="REJECTED">Rechazado</option>
                        <option value="DISBURSED">Desembolsado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nivel de Riesgo
                      </label>
                      <select 
                        value={riskLevel}
                        onChange={(e) => setRiskLevel(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Todos</option>
                        <option value="LOW">Bajo</option>
                        <option value="MEDIUM">Medio</option>
                        <option value="HIGH">Alto</option>
                        <option value="VERY_HIGH">Muy Alto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto Mínimo
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto Máximo
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sucursal
                      </label>
                      <select 
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Todas</option>
                        <option value="1">Sucursal Central</option>
                        <option value="2">Sucursal Norte</option>
                        <option value="3">Sucursal Sur</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Producto
                      </label>
                      <select 
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Todos</option>
                        <option value="1">Crédito Personal</option>
                        <option value="2">Crédito Hipotecario</option>
                        <option value="3">Crédito Vehicular</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Empleo
                      </label>
                      <select 
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Todos</option>
                        <option value="EMPLOYED">Empleado</option>
                        <option value="SELF_EMPLOYED">Independiente</option>
                        <option value="BUSINESS_OWNER">Empresario</option>
                        <option value="RETIRED">Jubilado</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Filtros específicos para Clientes */}
                {selectedCategory === 'CUSTOMERS' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado del Cliente
                      </label>
                      <select 
                        value={customerStatus}
                        onChange={(e) => setCustomerStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Todos</option>
                        <option value="ACTIVE">Activo</option>
                        <option value="INACTIVE">Inactivo</option>
                        <option value="SUSPENDED">Suspendido</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Segmento
                      </label>
                      <select 
                        value={segment}
                        onChange={(e) => setSegment(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Todos</option>
                        <option value="PREMIUM">Premium</option>
                        <option value="STANDARD">Estándar</option>
                        <option value="BASIC">Básico</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Filtros específicos para Documentos */}
                {selectedCategory === 'DOCUMENTS' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado del Documento
                      </label>
                      <select 
                        value={documentStatus}
                        onChange={(e) => setDocumentStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Todos</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="APPROVED">Aprobado</option>
                        <option value="REJECTED">Rechazado</option>
                        <option value="OBSERVED">Observado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Documento
                      </label>
                      <select 
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Todos</option>
                        <option value="ID">Identificación</option>
                        <option value="INCOME">Comprobante de Ingresos</option>
                        <option value="ADDRESS">Comprobante de Domicilio</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Formato de Exportación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato de Exportación
                  </label>
                  <select 
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as ReportFormat)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel (XLSX)</option>
                  </select>
                </div>
              </div>

              {/* Botón Limpiar Filtros */}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}

          {/* Botón de Vista Previa */}
          {selectedReportType && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleGeneratePreview}
                disabled={loadingPreview || !selectedCategory || !selectedReportType}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingPreview ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Cargando vista previa...
                  </>
                ) : (
                  <>
                    <Eye className="h-5 w-5" />
                    Generar Vista Previa
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* SECCIÓN 2: VISTA PREVIA DE DATOS */}
        {(previewData.length > 0 || previewError || loadingPreview) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Vista Previa de Datos
                </h2>
              </div>
              {totalRows > 0 && (
                <span className="text-sm text-gray-600">
                  Mostrando {previewData.length} de {totalRows.toLocaleString()} registros
                </span>
              )}
            </div>

            {previewError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mb-4">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">{previewError}</p>
              </div>
            )}

            {previewData.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <ReportDataTable
                  data={previewData}
                  columns={previewColumns}
                  pagination={true}
                  pageSize={10}
                  sortable={true}
                />
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN 3: BOTONES DE GENERACIÓN */}
        {previewData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Download className="h-6 w-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Generar Reporte Completo
              </h2>
            </div>

            {generateError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mb-4">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">{generateError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Botón CSV */}
              <button
                onClick={() => handleGenerateReport('csv')}
                disabled={generating}
                className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating && generatingFormat === 'csv' ? (
                  <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                ) : (
                  <FileText className="h-6 w-6 text-green-600" />
                )}
                <div className="text-left">
                  <div className="font-semibold text-gray-900">CSV</div>
                  <div className="text-xs text-gray-600">Archivo de texto separado por comas</div>
                </div>
              </button>

              {/* Botón XLSX */}
              <button
                onClick={() => handleGenerateReport('xlsx')}
                disabled={generating}
                className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating && generatingFormat === 'xlsx' ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                ) : (
                  <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                )}
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Excel</div>
                  <div className="text-xs text-gray-600">Hoja de cálculo de Microsoft Excel</div>
                </div>
              </button>

              {/* Botón PDF */}
              <button
                onClick={() => handleGenerateReport('pdf')}
                disabled={generating}
                className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating && generatingFormat === 'pdf' ? (
                  <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                ) : (
                  <FileDown className="h-6 w-6 text-red-600" />
                )}
                <div className="text-left">
                  <div className="font-semibold text-gray-900">PDF</div>
                  <div className="text-xs text-gray-600">Documento portátil de Adobe</div>
                </div>
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-600 text-center">
              El reporte completo incluirá todos los {totalRows.toLocaleString()} registros
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
