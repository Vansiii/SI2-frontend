/**
 * Hook personalizado para gestionar verificación de identidad
 */

import { useState, useCallback, useEffect } from 'react';
import { identityVerificationService } from '../services/identityVerificationService';
import type {
  IdentityVerification,
  StartVerificationRequest,
} from '../types/identityVerification';

interface UseIdentityVerificationState {
  verification: IdentityVerification | null;
  loading: boolean;
  error: Error | null;
}

interface UseIdentityVerificationReturn extends UseIdentityVerificationState {
  startVerification: (request: StartVerificationRequest) => Promise<IdentityVerification | null>;
  refreshVerification: () => Promise<void>;
  getMyVerification: () => Promise<void>;
}

/**
 * Hook para gestionar la verificación de identidad del usuario actual
 */
export function useIdentityVerification(): UseIdentityVerificationReturn {
  const [verification, setVerification] = useState<IdentityVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Cargar la verificación actual del usuario
   */
  const getMyVerification = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await identityVerificationService.getMyVerification();
      setVerification(data);
    } catch (err) {
      setError(err as Error);
      setVerification(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Iniciar una nueva verificación de identidad
   */
  const startVerification = useCallback(
    async (request: StartVerificationRequest): Promise<IdentityVerification | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await identityVerificationService.startVerification(request);
        
        // Retornar los datos de respuesta (puede que sea incompleto)
        const newVerification: IdentityVerification = {
          id: response.id,
          user: 0, // No disponible en respuesta
          institution: 0,
          institution_name: '',
          provider: response.provider,
          provider_session_id: '',
          status: response.status,
          decision: 'PENDING',
          document_type: '',
          document_number: '',
          full_name: '',
          country: '',
          error_message: '',
          verification_url: response.verification_url,
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setVerification(newVerification);
        return newVerification;
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Refrescar el estado de la verificación actual
   */
  const refreshVerification = useCallback(async () => {
    if (!verification) return;

    setLoading(true);
    setError(null);
    try {
      const updated = await identityVerificationService.refreshVerification(verification.id);
      setVerification(updated);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [verification]);

  return {
    verification,
    loading,
    error,
    startVerification,
    refreshVerification,
    getMyVerification,
  };
}

/**
 * Hook para cargar una verificación específica por ID
 */
export function useIdentityVerificationById(id: number | null) {
  const [verification, setVerification] = useState<IdentityVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchVerification = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await identityVerificationService.getVerification(id);
        setVerification(data);
      } catch (err) {
        setError(err as Error);
        setVerification(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [id]);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await identityVerificationService.refreshVerification(id);
      setVerification(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    verification,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook para hacer polling del estado de una verificación
 */
export function useIdentityVerificationPolling(
  verificationId: number | null,
  intervalMs: number = 5000,
  maxAttempts: number = 60
) {
  const [verification, setVerification] = useState<IdentityVerification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!verificationId || !isPolling || attempts >= maxAttempts) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await identityVerificationService.getVerification(verificationId);
        setVerification(data);

        // Dejar de hacer polling si está completado
        if (data.status !== 'PENDING' && data.status !== 'IN_PROGRESS') {
          setIsPolling(false);
        }

        setAttempts((prev) => prev + 1);
      } catch (err) {
        setError(err as Error);
      }
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [verificationId, intervalMs, maxAttempts, attempts, isPolling]);

  const startPolling = useCallback(() => {
    setIsPolling(true);
    setAttempts(0);
    setError(null);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  return {
    verification,
    error,
    isPolling,
    startPolling,
    stopPolling,
    attempts,
  };
}
