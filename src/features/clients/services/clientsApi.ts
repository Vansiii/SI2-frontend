/**
 * Servicio API para gestión de clientes/prestatarios
 */

import { apiClient } from '../../../utils/apiClient';
import type {
  Client,
  CreateClientData,
  UpdateClientData,
  PaginatedResponse,
} from '../types';

/**
 * Obtiene la lista paginada de clientes
 */
export async function getClients(params: { page?: number; page_size?: number } = {}): Promise<PaginatedResponse<Client>> {
  const { page = 1, page_size = 20 } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString(),
  });
  return apiClient.get<PaginatedResponse<Client>>(`/clients/?${queryParams}`);
}

/**
 * Obtiene un cliente por ID
 */
export async function getClientById(clientId: number): Promise<Client> {
  return apiClient.get<Client>(`/clients/${clientId}/`);
}

/**
 * Crea un nuevo cliente
 */
export async function createClient(data: CreateClientData): Promise<Client> {
  return apiClient.post<Client>('/clients/', data);
}

/**
 * Actualiza un cliente existente
 */
export async function updateClient(
  data: { clientId: number; updateData: UpdateClientData }
): Promise<Client> {
  return apiClient.patch<Client>(`/clients/${data.clientId}/`, data.updateData);
}

/**
 * Desactiva un cliente
 */
export async function deactivateClient(clientId: number): Promise<void> {
  return apiClient.delete<void>(`/clients/${clientId}/`);
}
