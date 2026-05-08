import { useState, useCallback } from 'react';
import {
  uploadLogo,
  uploadFavicon,
  uploadCover,
  deleteBrandingFile,
  updateBrandingColors,
  type UpdateBrandingColorsData,
} from '../services/brandingApi';
import type { TenantBranding } from '../../../types';

export function useBranding() {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingFile, setDeletingFile] = useState<'logo' | 'favicon' | 'cover' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadLogo = useCallback(async (file: File): Promise<TenantBranding> => {
    setIsUploading(true);
    setError(null);
    try {
      const response = await uploadLogo(file);
      return response.branding;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir el logo';
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleUploadFavicon = useCallback(async (file: File): Promise<TenantBranding> => {
    setIsUploading(true);
    setError(null);
    try {
      const response = await uploadFavicon(file);
      return response.branding;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir el favicon';
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleUploadCover = useCallback(async (file: File): Promise<TenantBranding> => {
    setIsUploading(true);
    setError(null);
    try {
      const response = await uploadCover(file);
      return response.branding;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir el cover';
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDeleteFile = useCallback(
    async (category: 'logo' | 'favicon' | 'cover'): Promise<TenantBranding> => {
      setDeletingFile(category);
      setError(null);
      try {
        const response = await deleteBrandingFile(category);
        return response.branding;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al eliminar el archivo';
        setError(message);
        throw err;
      } finally {
        setDeletingFile(null);
      }
    },
    []
  );

  const handleUpdateColors = useCallback(async (data: UpdateBrandingColorsData): Promise<TenantBranding> => {
    setIsUploading(true);
    setError(null);
    try {
      const response = await updateBrandingColors(data);
      return response.branding;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar los colores';
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isUploading,
    deletingFile,
    error,
    clearError,
    uploadLogo: handleUploadLogo,
    uploadFavicon: handleUploadFavicon,
    uploadCover: handleUploadCover,
    deleteFile: handleDeleteFile,
    updateColors: handleUpdateColors,
  };
}
