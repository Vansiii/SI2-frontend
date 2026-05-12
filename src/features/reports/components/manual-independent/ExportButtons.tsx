/**
 * Botones de Exportación
 * 
 * Permite exportar reportes en diferentes formatos.
 */

import { Download, FileText, FileSpreadsheet, FileImage } from 'lucide-react';
import type { ReportType, ReportFilters, ExportFormat } from '../../types/manualReports.types';
import { useReportExport } from '../../hooks/useReportExport';

interface Props {
  reportType: ReportType;
  filters: ReportFilters;
}

export function ExportButtons({ reportType, filters }: Props) {
  const { exportReport, isExporting, exportingFormat, error } = useReportExport();
  
  const handleExport = (format: ExportFormat) => {
    exportReport({ reportType, filters, format });
  };
  
  const isExportingFormat = (format: ExportFormat) => {
    return isExporting && exportingFormat === format;
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Botón CSV */}
      <button
        onClick={() => handleExport('csv')}
        disabled={isExporting}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isExportingFormat('csv') ? (
          <>
            <Download className="h-4 w-4 animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Exportar CSV
          </>
        )}
      </button>
      
      {/* Botón Excel */}
      <button
        onClick={() => handleExport('xlsx')}
        disabled={isExporting}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isExportingFormat('xlsx') ? (
          <>
            <Download className="h-4 w-4 animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </>
        )}
      </button>
      
      {/* Botón PDF */}
      <button
        onClick={() => handleExport('pdf')}
        disabled={isExporting}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isExportingFormat('pdf') ? (
          <>
            <Download className="h-4 w-4 animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <FileImage className="h-4 w-4" />
            Exportar PDF
          </>
        )}
      </button>
      
      {/* Mensaje de error */}
      {error && (
        <div className="text-sm text-red-600 mt-2">
          {error}
        </div>
      )}
    </div>
  );
}

export default ExportButtons;
