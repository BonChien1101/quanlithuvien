import axiosClient from './axiosClient';

export const reportApi = {
  inventory(){ return axiosClient.get('/api/reports/inventory').then(r=>r.data); },
  summary(period: 'week'|'month'){ return axiosClient.get('/api/reports/summary',{ params: { period }}).then(r=>r.data); },
  byReader(id: number){ return axiosClient.get(`/api/reports/reader/${id}`).then(r=>r.data); }
};
