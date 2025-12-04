// API sách - ánh xạ các endpoint backend.
// BACKEND endpoints bắt buộc:
//  GET /api/books -> list()
//  GET /api/books/search?title=&author= -> search()
//  POST /api/books -> create()
//  PUT /api/books/{id} -> update()
//  POST /api/books/{id}/toggle -> toggle()
//  DELETE /api/books/{id} -> remove()
import axiosClient from './axiosClient';

export interface BookDTO { id: number; code: string; title: string; author: string; imageUrl?: string; category?: { id: number }; stock: number; hidden?: boolean; }
export interface NewBookPayload { code: string; title: string; author: string; imageUrl?: string; categoryId?: number; stock: number; }

export const bookApi = {
  // Lấy toàn bộ sách
  list(){ return axiosClient.get<BookDTO[]>('/api/books').then(r=>r.data); },
  // Tìm kiếm theo tiêu đề / tác giả 
  search(title?: string, author?: string){ return axiosClient.get<BookDTO[]>('/api/books/search',{ params: { title, author }}).then(r=>r.data); },
  // Tạo sách mới
  create(b: NewBookPayload){ return axiosClient.post<BookDTO>('/api/books', b).then(r=>r.data); },
  // Cập nhật sách
  update(id: number, b: NewBookPayload){ return axiosClient.put<BookDTO>(`/api/books/${id}`, b).then(r=>r.data); },
  // Ẩn / hiện sách 
  toggle(id: number){ return axiosClient.post<BookDTO>(`/api/books/${id}/toggle`, {}).then(r=>r.data); },
  // Xóa vĩnh viễn
  remove(id: number){ return axiosClient.delete<void>(`/api/books/${id}`).then(r=>r.data); }
};
