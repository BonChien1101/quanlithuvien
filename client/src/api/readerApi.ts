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
  async list(){ 
    try { const r = await axiosClient.get<ReaderDTO[]>('/api/readers'); return r.data; }
    catch(e:any){ if(e?.response?.status===404){ const r2 = await axiosClient.get<ReaderDTO[]>('/readers'); return r2.data; } throw e; }
  },
  async get(id: number){
    try { const r = await axiosClient.get<ReaderDTO>(`/api/readers/${id}`); return r.data; }
    catch(e:any){ if(e?.response?.status===404){ const r2 = await axiosClient.get<ReaderDTO>(`/readers/${id}`); return r2.data; } throw e; }
  },
  async create(r: NewReaderPayload){ 
    try { const r1 = await axiosClient.post<ReaderDTO>('/api/readers', r); return r1.data; }
    catch(e:any){ if(e?.response?.status===404){ const r2 = await axiosClient.post<ReaderDTO>('/readers', r); return r2.data; } throw e; }
  },
  async update(id: number, r: NewReaderPayload){ 
    try { const r1 = await axiosClient.put<ReaderDTO>(`/api/readers/${id}`, r); return r1.data; }
    catch(e:any){ if(e?.response?.status===404){ const r2 = await axiosClient.put<ReaderDTO>(`/readers/${id}`, r); return r2.data; } throw e; }
  },
  async remove(id: number){ 
    try { const r = await axiosClient.delete<void>(`/api/readers/${id}`); return r.data as any; }
    catch(e:any){ if(e?.response?.status===404){ const r2 = await axiosClient.delete<void>(`/readers/${id}`); return r2.data as any; } throw e; }
  }
};
