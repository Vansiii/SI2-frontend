/**
 * Servicio API para gestión de usuarios internos
 */

import { apiClient } from '../../../utils/apiClient';
import type {
  UserWithDetails,
  CreateUserData,
  UpdateUserData,
  AssignRolesData,
} from '../../../types';

/**
 * Obtiene la lista de usuarios
 */
export async function getUsers(): Promise<UserWithDetails[]> {
  return apiClient.get<UserWithDetails[]>('/users/');
}

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(userId: number): Promise<UserWithDetails> {
  return apiClient.get<UserWithDetails>(`/users/${userId}/`);
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(data: CreateUserData): Promise<UserWithDetails> {
  return apiClient.post<UserWithDetails>('/users/', data);
}

/**
 * Actualiza un usuario existente
 */
export async function updateUser(
  userId: number,
  data: UpdateUserData
): Promise<UserWithDetails> {
  return apiClient.patch<UserWithDetails>(`/users/${userId}/`, data);
}

/**
 * Desactiva un usuario
 */
export async function deactivateUser(userId: number): Promise<void> {
  return apiClient.delete<void>(`/users/${userId}/`);
}

/**
 * Asigna roles a un usuario
 */
export async function assignRoles(
  userId: number,
  data: AssignRolesData
): Promise<UserWithDetails> {
  return apiClient.put<UserWithDetails>(`/users/${userId}/roles/`, data);
}
