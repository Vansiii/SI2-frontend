/**
 * Hook para gestionar plantillas de reportes
 */
import { useState, useEffect } from 'react';
import { templateService } from '../services';
import type {
  ReportTemplate,
  CreateTemplateData,
  UpdateTemplateData,
} from '../types';

export const useTemplates = (autoLoad: boolean = true) => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    currentPage: 1,
  });

  const loadTemplates = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await templateService.getTemplates(page);
      setTemplates(data.results);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
        currentPage: page,
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (data: CreateTemplateData) => {
    try {
      setError(null);
      const template = await templateService.createTemplate(data);
      await loadTemplates(pagination.currentPage);
      return template;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al crear plantilla';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateTemplate = async (id: string, data: UpdateTemplateData) => {
    try {
      setError(null);
      const template = await templateService.updateTemplate(id, data);
      await loadTemplates(pagination.currentPage);
      return template;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al actualizar plantilla';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setError(null);
      await templateService.deleteTemplate(id);
      await loadTemplates(pagination.currentPage);
    } catch (err: any) {
      const errorMsg = err.message || 'Error al eliminar plantilla';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const useTemplate = async (id: string, overrides?: any) => {
    try {
      setError(null);
      const report = await templateService.useTemplate(id, overrides);
      return report;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al usar plantilla';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadTemplates();
    }
  }, [autoLoad]);

  return {
    templates,
    loading,
    error,
    pagination,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
  };
};
