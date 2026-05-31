/**
 * Hook para gestionar firmas de contratos
 */

import { useState, useEffect, useCallback } from 'react';
import { contractsApi } from '../services/contractsApi';
import type { ContractSignRequest, SignatureStatus } from '../types';

export const useContractSignature = (contractId?: number) => {
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignatureStatus = useCallback(async () => {
    if (!contractId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await contractsApi.getSignatureStatus(contractId);
      setSignatureStatus(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el estado de firmas';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (contractId) {
      fetchSignatureStatus();
    }
  }, [contractId, fetchSignatureStatus]);

  return {
    signatureStatus,
    loading,
    error,
    refetch: fetchSignatureStatus,
  };
};

export const useSignContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signContract = async (
    contractId: number,
    data: ContractSignRequest
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await contractsApi.sign(contractId, data);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al firmar el contrato';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    signContract,
    loading,
    error,
  };
};
