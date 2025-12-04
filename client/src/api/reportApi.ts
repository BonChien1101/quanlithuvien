import axiosClient from './axiosClient';

export const reportApi = {
  inventory(){ return axiosClient.get('/api/reports/inventory').then(r=>r.data); },
  lowStock(threshold = 3){ return axiosClient.get('/api/reports/inventory/low',{ params: { threshold } }).then(r=>r.data); },
  overview(extra?: Record<string, any>){ return axiosClient.get('/api/reports/overview',{ params: extra }).then(r=>r.data); },
    topBooks(limit=5, extra?: Record<string, any>){ return axiosClient.get('/api/reports/top-books',{ params: { limit, ...(extra||{}) } }).then(r=>r.data); },
    borrowStats(days=7){ return axiosClient.get('/api/reports/borrow-stats',{ params: { days } }).then(r=>r.data); },
  summary(period: 'week'|'month', extra?: Record<string, any>){
  const params = { period, ...(extra||{}), _ts: Date.now() };
    return axiosClient.get('/api/reports/summary',{ params }).then(r=>r.data);
  },
  byReader(id: number){ return axiosClient.get(`/api/reports/reader/${id}`).then(r=>r.data); }
};
