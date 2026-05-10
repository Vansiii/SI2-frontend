/**
 * Hook para gestionar el catálogo de reportes
 */
import { useState, useEffect } from 'react';
import { reportService } from '../services';
import type { ReportCatalog, ReportDefinition } from '../types';

export const useReportCatalog = () => {
  const [catalog, setCatalog] = useState<ReportCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getCatalog();
      setCatalog(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar catálogo de reportes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  return {
    catalog,
    loading,
    error,
    reload: loadCatalog,
  };
};

export const useReportDefinition = (
  scope: string,
  category: string,
  reportType: string,
  enabled: boolean = true
) => {
  const [definition, setDefinition] = useState<ReportDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDefinition = async () => {
    if (!enabled || !scope || !category || !reportType) return;

    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getReportDefinition(
        scope,
        category,
        reportType
      );
      setDefinition(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar definición de reporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDefinition();
  }, [scope, category, reportType, enabled]);

  return {
    definition,
    loading,
    error,
    reload: loadDefinition,
  };
};
