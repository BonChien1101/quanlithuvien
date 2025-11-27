// API độc giả - endpoints quản lý độc giả.
// BACKEND cần:
//  GET /api/readers -> list
//  POST /api/readers -> create
//  PUT /api/readers/{id} -> update
//  DELETE /api/readers/{id} -> remove
// TODO BACKEND: endpoint thống kê theo độc giả / top mượn nhiều nhất.
import axiosClient from './axiosClient';

export interface ReaderDTO { id: number; name: string; email: string; quota: number; }
export interface NewReaderPayload { name: string; email: string; quota: number; }

export const readerApi = {
  list(){ return axiosClient.get<ReaderDTO[]>('/api/readers').then(r=>r.data); },
  create(r: NewReaderPayload){ return axiosClient.post<ReaderDTO>('/api/readers', r).then(r2=>r2.data); },
  update(id: number, r: NewReaderPayload){ return axiosClient.put<ReaderDTO>(`/api/readers/${id}`, r).then(r2=>r2.data); },
  remove(id: number){ return axiosClient.delete<void>(`/api/readers/${id}`).then(r=>r.data); }
};
