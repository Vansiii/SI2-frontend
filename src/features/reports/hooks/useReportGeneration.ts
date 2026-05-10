/**
 * Hook para gestionar generación de reportes
 */
import { useState } from 'react';
import { reportService } from '../services';
import type {
  ReportConfig,
  ReportPreviewResponse,
  GeneratedReport,
} from '../types';

export const useReportGeneration = () => {
  const [previewing, setPreviewing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<ReportPreviewResponse | null>(
    null
  );
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const previewReport = async (config: ReportConfig) => {
    try {
      setPreviewing(true);
      setError(null);
      const data = await reportService.previewReport({ config });
      setPreviewData(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al generar vista previa';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setPreviewing(false);
    }
  };

  const generateReport = async (
    config: ReportConfig,
    saveAsTemplate?: boolean,
    templateName?: string,
    templateDescription?: string
  ) => {
    try {
      setGenerating(true);
      setError(null);
      const data = await reportService.generateReport({
        config,
        save_as_template: saveAsTemplate,
        template_name: templateName,
        template_description: templateDescription,
      });
      setGeneratedReport(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al generar reporte';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (id: string) => {
    try {
      await reportService.downloadReport(id);
    } catch (err: any) {
      const errorMsg = err.message || 'Error al descargar reporte';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const clearPreview = () => {
    setPreviewData(null);
    setError(null);
  };

  const clearGenerated = () => {
    setGeneratedReport(null);
    setError(null);
  };

  return {
    previewing,
    generating,
    previewData,
    generatedReport,
    error,
    previewReport,
    generateReport,
    downloadReport,
    clearPreview,
    clearGenerated,
  };
};
