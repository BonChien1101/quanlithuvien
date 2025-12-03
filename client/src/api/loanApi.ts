// API mượn trả sách.
// BACKEND cần endpoints:
//  GET /api/loans -> list tất cả lượt mượn
//  GET /api/loans/reader/{readerId} -> danh sách mượn theo độc giả
//  POST /api/loans/borrow?bookId=&readerId= -> tạo lượt mượn (check quota, tồn kho)
//  POST /api/loans/{id}/return -> trả sách (cập nhật tồn kho)
//  PUT /api/loans/{id}/due?epochMilli= -> gia hạn ngày trả
//  DELETE /api/loans/{id} -> xóa bản ghi (thường chỉ dành cho admin)
// TODO BACKEND: endpoint thống kê sách quá hạn, top sách mượn nhiều.
import axiosClient from './axiosClient';

export interface LoanDTO { id: number; book: any; reader: any; borrowedAt: string; dueAt?: string; returnedAt?: string; }
export interface NewLoanPayload { bookId: number; readerId: number; }

export const loanApi = {
  async list(){ try{ const r= await axiosClient.get<LoanDTO[]>('/api/loans'); return r.data; } catch(e:any){ if(e?.response?.status===404){ const r2= await axiosClient.get<LoanDTO[]>('/loans'); return r2.data; } throw e; } },
  async byReader(readerId: number){ try{ const r= await axiosClient.get<LoanDTO[]>(`/api/loans/reader/${readerId}`); return r.data; } catch(e:any){ if(e?.response?.status===404){ const r2= await axiosClient.get<LoanDTO[]>(`/loans/reader/${readerId}`); return r2.data; } throw e; } },
  async borrow(bookId: number, readerId: number, dueAt?: Date){ try{ const r= await axiosClient.post<LoanDTO>('/api/loans/borrow', { bookId, readerId, dueAt: dueAt?.toISOString() }); return r.data; } catch(e:any){ if(e?.response?.status===404){ const r2= await axiosClient.post<LoanDTO>('/loans/borrow', { bookId, readerId, dueAt: dueAt?.toISOString() }); return r2.data; } throw e; } },
  async returnBook(id: number){ try{ const r= await axiosClient.post<LoanDTO>(`/api/loans/${id}/return`, {}); return r.data; } catch(e:any){ if(e?.response?.status===404){ const r2= await axiosClient.post<LoanDTO>(`/loans/${id}/return`, {}); return r2.data; } throw e; } },
  async updateDue(id: number, due: Date){ try{ const r= await axiosClient.put<LoanDTO>(`/api/loans/${id}/due`, { dueAt: due.toISOString() }); return r.data; } catch(e:any){ if(e?.response?.status===404){ const r2= await axiosClient.put<LoanDTO>(`/loans/${id}/due`, { dueAt: due.toISOString() }); return r2.data; } throw e; } },
  async remove(id: number){ try{ const r= await axiosClient.delete<void>(`/api/loans/${id}`); return r.data as any; } catch(e:any){ if(e?.response?.status===404){ const r2= await axiosClient.delete<void>(`/loans/${id}`); return r2.data as any; } throw e; } }
};
