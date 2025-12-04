import axiosClient from './axiosClient';

export interface Category { id?: number; name: string; hidden?: boolean; bookCount?: number; }

export const categoryApi = { // danh muc
  list(){ return axiosClient.get('/api/categories').then(r=>{
    const data = r.data;
    return (Array.isArray(data) ? data : (data?.items ?? [])) as Category[];
  }); },
  create(c: Category){ return axiosClient.post<Category>('/api/categories', c).then(r=>r.data); },
  update(id: number, c: Category){ return axiosClient.put<Category>(`/api/categories/${id}`, c).then(r=>r.data); },
  toggle(id: number){ return axiosClient.post<Category>(`/api/categories/${id}/toggle`, {}).then(r=>r.data); },
  remove(id: number){ return axiosClient.delete<void>(`/api/categories/${id}`).then(r=>r.data); }
};
