import { apiClient } from './client';

export interface CommentResponse {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  authorName: string | null;
}

export interface EvidenceResponse {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: string;
  uploadedById: string;
  uploadedByName: string | null;
}

export interface InvestigationNoteResponse {
  id: string;
  title: string;
  content: string;
  isRootCause: boolean;
  createdAt: string;
  authorId: string;
  authorName: string | null;
}

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
  projectId: string;
  correlationId: string | null;
  comments: CommentResponse[];
  evidences: EvidenceResponse[];
  investigationNotes: InvestigationNoteResponse[];
}

export interface CreateBugRequest {
  title: string;
  description: string;
  priority: string;
  projectId: string;
  correlationId?: string | null;
  assignedToId?: string | null;
}

export interface UpdateBugRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedToId?: string | null;
}

export const bugsApi = {
  getAll: async (): Promise<BugResponse[]> => {
    const response = await apiClient.get<BugResponse[]>('/bugs');
    return response.data;
  },
  
  getById: async (id: string): Promise<BugResponse> => {
    const response = await apiClient.get<BugResponse>(`/bugs/${id}`);
    return response.data;
  },
  
  create: async (data: CreateBugRequest): Promise<BugResponse> => {
    const response = await apiClient.post<BugResponse>('/bugs', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBugRequest): Promise<BugResponse> => {
    const response = await apiClient.put<BugResponse>(`/bugs/${id}`, data);
    return response.data;
  },

  addComment: async (id: string, body: string): Promise<CommentResponse> => {
    const response = await apiClient.post<CommentResponse>(`/bugs/${id}/comments`, { body });
    return response.data;
  },

  addEvidence: async (id: string, data: { type: string; title: string; content: string }): Promise<EvidenceResponse> => {
    const response = await apiClient.post<EvidenceResponse>(`/bugs/${id}/evidence`, data);
    return response.data;
  },

  addInvestigationNote: async (id: string, data: { title: string; content: string; isRootCause: boolean }): Promise<InvestigationNoteResponse> => {
    const response = await apiClient.post<InvestigationNoteResponse>(`/bugs/${id}/notes`, data);
    return response.data;
  }
};
