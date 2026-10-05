import { apiClient } from './client';

export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  ownerId: string;
  ownerName: string | null;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export const projectsApi = {
  getAll: async (): Promise<ProjectResponse[]> => {
    const response = await apiClient.get<ProjectResponse[]>('/projects');
    return response.data;
  },
  
  getById: async (id: string): Promise<ProjectResponse> => {
    const response = await apiClient.get<ProjectResponse>(`/projects/${id}`);
    return response.data;
  },
  
  create: async (data: CreateProjectRequest): Promise<ProjectResponse> => {
    const response = await apiClient.post<ProjectResponse>('/projects', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  }
};
