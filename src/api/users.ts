import { apiClient } from './client';
import type { AdminUser, CreateUserRequest, UpdateUserRequest, UserListResponse } from './types';

export async function listUsers(page: number, limit: number): Promise<UserListResponse> {
  const response = await apiClient.get<UserListResponse>('/users', { params: { page, limit } });
  return response.data;
}

export async function createUser(request: CreateUserRequest): Promise<AdminUser> {
  const response = await apiClient.post<AdminUser>('/users', request);
  return response.data;
}

export async function updateUser(id: string, request: UpdateUserRequest): Promise<AdminUser> {
  const response = await apiClient.patch<AdminUser>(`/users/${id}`, request);
  return response.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
