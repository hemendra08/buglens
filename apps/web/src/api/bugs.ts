import { apiClient } from './client';

export interface BugResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string | null;
  createdById: string;
  createdByName: string;
  assignedToId: string | null;
  assignedToName: string | null;
}

export interface CreateBugRequest {
  title: string;
  description: string;
  priority: string;
  assignedToId?: string | null;
}

export const bugsApi = {
  getAll: async (): Promise<BugResponse[]> => {
    const response = await apiClient.get<BugResponse[]>('/bugs');
    return response.data;
  },
  
  create: async (data: CreateBugRequest): Promise<BugResponse> => {
    const response = await apiClient.post<BugResponse>('/bugs', data);
    return response.data;
  }
};
