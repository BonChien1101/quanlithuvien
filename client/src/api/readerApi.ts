// API độc giả - endpoints quản lý độc giả.
// BACKEND cần:
//  GET /api/readers -> list
//  POST /api/readers -> create
//  PUT /api/readers/{id} -> update
//  DELETE /api/readers/{id} -> remove
// TODO BACKEND: endpoint thống kê theo độc giả / top mượn nhiều nhất.
import axiosClient from './axiosClient';

export interface ReaderDTO {
  id: number;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string; // ISO date yyyy-mm-dd
  address?: string;
  note?: string;
  quota: number;
}
export interface NewReaderPayload {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string; // ISO date yyyy-mm-dd
  address?: string;
  note?: string;
  quota: number;
}

export const readerApi = {
  async list(params?: { q?: string; page?: number; limit?: number }){ 
  const r = await axiosClient.get('/api/readers', { params });
  const data: any = r.data;
  return (Array.isArray(data) ? data : (data?.items ?? [])) as ReaderDTO[];
  },
  async get(id: number){
  const r = await axiosClient.get<ReaderDTO>(`/api/readers/${id}`); return r.data;
  },
  async create(r: NewReaderPayload){ 
  const r1 = await axiosClient.post<ReaderDTO>('/api/readers', r); return r1.data;
  },
  async update(id: number, r: NewReaderPayload){ 
  const r1 = await axiosClient.put<ReaderDTO>(`/api/readers/${id}`, r); return r1.data;
  },
  async remove(id: number){ 
  const r = await axiosClient.delete<void>(`/api/readers/${id}`); return r.data as any;
  }
};
