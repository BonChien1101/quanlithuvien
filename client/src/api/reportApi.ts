import axiosClient from './axiosClient';

// Kiểu dữ liệu dùng cho màn hình Dashboard
export interface DashboardStats {
  totalReaders: number;
  totalBooks: number;
  totalCategories: number;
  totalLoans: number;
  borrowedBooks: number;
  lowStockBooks: number;
  outOfStockBooks: number;
  overdueBooks: number;
  totalStockBooks: number;
}

export interface LoanTrend {
  date: string; // Ngày ở dạng ISO hoặc yyyy-mm-dd
  borrowed: number;
  returned: number;
}

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
  byReader(id: number){ return axiosClient.get(`/api/reports/reader/${id}`).then(r=>r.data); },
  overdueSummary(){ return axiosClient.get('/api/reports/overdue-summary').then(r=>r.data); },
  async dashboardStats(): Promise<DashboardStats> {
    const [inventory, loansAll, categories] = await Promise.all([
      this.inventory(),
      axiosClient.get('/api/loans').then(r=>r.data),
      axiosClient.get('/api/categories').then(r=>r.data).catch(()=>[])
    ]);

    const totalBooks = Array.isArray(inventory) ? inventory.length : 0;
  const outOfStockBooks = Array.isArray(inventory) ? inventory.filter((b: any)=> (b.stock||0) === 0).length : 0;
  const lowStockBooks = Array.isArray(inventory) ? inventory.filter((b: any)=> (b.stock||0) > 0 && (b.stock||0) <= 5).length : 0;
  const totalStockBooks = Array.isArray(inventory) ? inventory.reduce((sum: number, b: any)=> sum + (b.stock || 0), 0) : 0;

    const totalLoans = Array.isArray(loansAll) ? loansAll.length : 0;
    const borrowedBooks = Array.isArray(loansAll) ? loansAll.filter((l: any)=> !l.returnedAt).length : 0;
    const overdueBooks = Array.isArray(loansAll) ? loansAll.filter((l: any)=> l.isOverdue && !l.returnedAt).length : 0;
    let totalReaders = 0;
    try {
      const readers = await axiosClient.get('/api/readers').then(r=>r.data);
      totalReaders = Array.isArray(readers) ? readers.length : (readers?.total ?? 0);
    } catch { /* ignore */ }
  const totalCategories = Array.isArray(categories) ? categories.length : (categories?.total ?? 0);
  return { totalReaders, totalBooks, totalCategories, totalLoans, borrowedBooks, lowStockBooks, outOfStockBooks, overdueBooks, totalStockBooks };
  },
  async loanTrends(days = 7): Promise<LoanTrend[]> {
    // Dùng các endpoint summary/borrow-stats hiện có để tạo xu hướng trong N ngày gần đây
    const rows: Array<{ date: string; count: number }> = await this.borrowStats(days);
    // Số lượt trả theo ngày: ước lượng bằng cách lấy các loan có returnedAt trong khoảng thời gian và nhóm theo ngày
    let returnedByDay: Record<string, number> = {};
    try {
      const loansAll = await axiosClient.get('/api/loans').then(r=>r.data);
      // Nhóm theo ngày returnedAt (yyyy-mm-dd)
      for (const l of Array.isArray(loansAll) ? loansAll : []) {
        if (l.returnedAt) {
          const d = new Date(l.returnedAt);
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          returnedByDay[key] = (returnedByDay[key] || 0) + 1;
        }
      }
    } catch { /* ignore */ }
    return rows.map(r=>({ date: r.date, borrowed: r.count, returned: returnedByDay[r.date] || 0 }));
  }
};
