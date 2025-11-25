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
