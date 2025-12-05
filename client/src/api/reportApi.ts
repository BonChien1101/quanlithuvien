import axiosClient from './axiosClient';

export interface DashboardStats {
  totalBooks: number;
  totalReaders: number;
  totalLoans: number;
  borrowedBooks: number;
  overdueBooks: number;
  lowStockBooks: number;
  outOfStockBooks: number;
}

export interface LoanTrend {
  date: string;
  borrowed: number;
  returned: number;
}

export const reportApi = {
  inventory(){ return axiosClient.get('/api/reports/inventory').then(r=>r.data); },
  summary(period: 'week'|'month'){ return axiosClient.get('/api/reports/summary',{ params: { period }}).then(r=>r.data); },
  byReader(id: number){ return axiosClient.get(`/api/reports/reader/${id}`).then(r=>r.data); },
  dashboardStats(){ return axiosClient.get<DashboardStats>('/api/reports/dashboard-stats').then(r=>r.data); },
  loanTrends(){ return axiosClient.get<LoanTrend[]>('/api/reports/loan-trends').then(r=>r.data); }
};
