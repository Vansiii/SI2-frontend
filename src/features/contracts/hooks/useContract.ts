/**
 * Hook para gestionar contratos
 */

import { useState, useEffect, useCallback } from 'react';
import { contractsApi } from '../services/contractsApi';
import type { Contract, ContractCreateRequest } from '../types';

export const useContract = (id?: number) => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContract = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await contractsApi.get(id);
      setContract(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el contrato';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchContract();
    }
  }, [id, fetchContract]);

  return {
    contract,
    loading,
    error,
    refetch: fetchContract,
  };
};

export const useContractList = (filters?: {
  status?: string;
  search?: string;
  page?: number;
}) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await contractsApi.list(filters);
      setContracts(data.results);
      setCount(data.count);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar los contratos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return {
    contracts,
    count,
    loading,
    error,
    refetch: fetchContracts,
  };
};

export const useGenerateContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContract = async (data: ContractCreateRequest): Promise<Contract | null> => {
    setLoading(true);
    setError(null);

    try {
      const contract = await contractsApi.generateFromApplication(data);
      return contract;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al generar el contrato';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateContract,
    loading,
    error,
  };
};

export const usePublishContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publishContract = async (id: number): Promise<Contract | null> => {
    setLoading(true);
    setError(null);

    try {
      const contract = await contractsApi.publish(id);
      return contract;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al publicar el contrato';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    publishContract,
    loading,
    error,
  };
};

export const useCancelContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelContract = async (id: number, reason: string): Promise<Contract | null> => {
    setLoading(true);
    setError(null);

    try {
      const contract = await contractsApi.cancel(id, reason);
      return contract;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar el contrato';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    cancelContract,
    loading,
    error,
  };
};
