import axiosClient from './axiosClient';

export interface Category { id?: number; name: string; hidden?: boolean; }

export const categoryApi = {
  list(){ return axiosClient.get<Category[]>('/api/categories').then(r=>r.data); },
  create(c: Category){ return axiosClient.post<Category>('/api/categories', c).then(r=>r.data); },
  update(id: number, c: Category){ return axiosClient.put<Category>(`/api/categories/${id}`, c).then(r=>r.data); },
  toggle(id: number){ return axiosClient.post<Category>(`/api/categories/${id}/toggle`, {}).then(r=>r.data); },
  remove(id: number){ return axiosClient.delete<void>(`/api/categories/${id}`).then(r=>r.data); }
};
