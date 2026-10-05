import { apiClient } from './client';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const usersApi = {
  getAll: async (): Promise<UserSummary[]> => {
    const response = await apiClient.get<UserSummary[]>('/users');
    return response.data;
  }
};
