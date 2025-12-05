import axiosClient from './axiosClient';

export interface MyProfile {
  reader: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    quota: number;
    maxQuota: number;
  };
  stats: {
    borrowedCount: number;
    overdueCount: number;
    availableQuota: number;
  };
}

export interface CurrentLoan {
  id: number;
  bookId: number;
  readerId: number;
  borrowedAt: string;
  dueAt?: string;
  returnedAt?: string;
  book: {
    id: number;
    title: string;
    author: string;
    code: string;
  };
}

export const myLibraryApi = {
  getProfile() {
    return axiosClient.get<MyProfile>('/api/my-library/profile').then(r => r.data);
  },
  getCurrentLoans() {
    return axiosClient.get<CurrentLoan[]>('/api/my-library/current-loans').then(r => r.data);
  },
  getLoanHistory() {
    return axiosClient.get<CurrentLoan[]>('/api/my-library/loan-history').then(r => r.data);
  },
  requestBorrow(bookId: number, dueAt?: Date) {
    return axiosClient.post('/api/my-library/request-borrow', {
      bookId,
      dueAt: dueAt?.toISOString()
    }).then(r => r.data);
  }
};
