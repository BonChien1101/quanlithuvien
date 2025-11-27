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
  list(){ return axiosClient.get<LoanDTO[]>('/api/loans').then(r=>r.data); },
  byReader(readerId: number){ return axiosClient.get<LoanDTO[]>(`/api/loans/reader/${readerId}`).then(r=>r.data); },
  borrow(bookId: number, readerId: number){ return axiosClient.post<LoanDTO>('/api/loans/borrow', null, { params: { bookId, readerId }}).then(r=>r.data); },
  returnBook(id: number){ return axiosClient.post<LoanDTO>(`/api/loans/${id}/return`, {}).then(r=>r.data); },
  updateDue(id: number, due: Date){ return axiosClient.put<LoanDTO>(`/api/loans/${id}/due`, null, { params: { epochMilli: due.getTime() }}).then(r=>r.data); },
  remove(id: number){ return axiosClient.delete<void>(`/api/loans/${id}`).then(r=>r.data); }
};
