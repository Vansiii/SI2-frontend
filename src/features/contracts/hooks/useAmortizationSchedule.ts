/**
 * Hook para gestionar tabla de amortización
 */

import { useState, useEffect, useCallback } from 'react';
import { contractsApi } from '../services/contractsApi';
import type { AmortizationScheduleItem, PaymentSummary } from '../types';

export const useAmortizationSchedule = (contractId?: number) => {
  const [schedule, setSchedule] = useState<AmortizationScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    if (!contractId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await contractsApi.getAmortizationSchedule(contractId);
      setSchedule(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar la tabla de amortización';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (contractId) {
      fetchSchedule();
    }
  }, [contractId, fetchSchedule]);

  return {
    schedule,
    loading,
    error,
    refetch: fetchSchedule,
  };
};

export const usePaymentSummary = (contractId?: number) => {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!contractId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await contractsApi.getPaymentSummary(contractId);
      setSummary(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el resumen de pagos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (contractId) {
      fetchSummary();
    }
  }, [contractId, fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
};
