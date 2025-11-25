import axiosClient from './axiosClient';

export interface BookDTO { id: number; code: string; title: string; author: string; category?: { id: number }; stock: number; hidden?: boolean; }
export interface NewBookPayload { code: string; title: string; author: string; categoryId?: number; stock: number; }

export const bookApi = {
  list(){ return axiosClient.get<BookDTO[]>('/api/books').then(r=>r.data); },
  search(title?: string, author?: string){ return axiosClient.get<BookDTO[]>('/api/books/search',{ params: { title, author }}).then(r=>r.data); },
  create(b: NewBookPayload){ return axiosClient.post<BookDTO>('/api/books', b).then(r=>r.data); },
  update(id: number, b: NewBookPayload){ return axiosClient.put<BookDTO>(`/api/books/${id}`, b).then(r=>r.data); },
  toggle(id: number){ return axiosClient.post<BookDTO>(`/api/books/${id}/toggle`, {}).then(r=>r.data); },
  remove(id: number){ return axiosClient.delete<void>(`/api/books/${id}`).then(r=>r.data); }
};
