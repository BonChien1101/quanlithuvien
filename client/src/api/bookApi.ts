// API sách - ánh xạ các endpoint backend.
// BACKEND endpoints bắt buộc:
//  GET /api/books -> list()
//  GET /api/books/search?title=&author= -> search()
//  POST /api/books -> create()
//  PUT /api/books/{id} -> update()
//  POST /api/books/{id}/toggle -> toggle()
//  DELETE /api/books/{id} -> remove()
import axiosClient from './axiosClient';

export interface BookDTO { id: number; code?: string; title: string; author?: string; imageUrl?: string; stock: number; categoryId?: number; hidden?: boolean; category?: { id: number; name: string }; }

export const bookApi = {
  // Lấy toàn bộ sách
  async list(includeHidden?: boolean){
  const rs = await axiosClient.get('/api/books', { params: { includeHidden: includeHidden ? 1 : 0 } });
  const data = rs.data;
  // Support both plain array and paginated shape { items: BookDTO[] }
  return (Array.isArray(data) ? data : (data?.items ?? [])) as BookDTO[];
  },
  // Tìm kiếm theo tiêu đề / tác giả 
  async search(title?: string, author?: string, includeHidden?: boolean){
  const rs = await axiosClient.get('/api/books/search', { params: { title, author, includeHidden: includeHidden ? 1 : 0 } });
  const data = rs.data;
  return (Array.isArray(data) ? data : (data?.items ?? [])) as BookDTO[];
  },
  async get(id: number){
    const rs = await axiosClient.get(`/api/books/${id}`);
    return rs.data as BookDTO;
  },
  // Tạo sách mới
  async create(data: { code: string; title: string; author: string; stock: number; categoryId: number; imageUrl?: string }){
    const rs = await axiosClient.post('/api/books', data);
    return rs.data as BookDTO;
  },
  // Cập nhật sách
  async update(id: number, data: { code: string; title: string; author: string; stock: number; categoryId: number; imageUrl?: string }){
    const rs = await axiosClient.put(`/api/books/${id}`, data);
    return rs.data as BookDTO;
  },
  // Xóa vĩnh viễn
  async remove(id: number){
    const rs = await axiosClient.delete(`/api/books/${id}`);
    return rs.data;
  },
  // Ẩn / hiện sách 
  async toggle(id: number){
    const rs = await axiosClient.post(`/api/books/${id}/toggle`);
    return rs.data as BookDTO;
  }
};
