import React, { useEffect, useState } from 'react';
import { bookApi } from '../api/bookApi';
import { categoryApi } from '../api/categoryApi';
import { readerApi } from '../api/readerApi';
import { loanApi } from '../api/loanApi';
import { reportApi, DashboardStats, LoanTrend } from '../api/reportApi';
import { Spinner } from '../components/Spinner';
import { ErrorAlert } from '../components/ErrorAlert';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Stat { label: string; value: number; icon?: string; dark?: boolean; }

export default function Dashboard(){
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<LoanTrend[]>([]);
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [error, setError] = useState<string|undefined>();
  const [modal, setModal] = useState<{ open: boolean; title: string; kind: 'categories'|'titles'|'stock'|'low'|'out'|'borrowed'|null; loading: boolean; data: any[]; error?: string }>({ open: false, title: '', kind: null, loading: false, data: [] });

  useEffect(()=>{
    const load = async () => {
      console.log('Dashboard loading...');
      setLoading(true); setError(undefined);
      try {
  const [statsData, trendsData, booksData] = await Promise.all([
          reportApi.dashboardStats(),
          reportApi.loanTrends(),
          bookApi.list()
        ]);
        console.log('Dashboard stats:', statsData);
        console.log('Dashboard trends:', trendsData);
        setStats(statsData);
        setTrends(trendsData);
        const newest = [...booksData].sort((a: any, b: any)=>{
          const da = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const db = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return db - da;
        }).slice(0,5);
        setRecentBooks(newest);
        setLoading(false);
        console.log('Dashboard loaded successfully');
      } catch (e: any) {
        console.error('Dashboard load failed:', e);
        setError('BACKEND');
        setLoading(false);
      }
    };
    load();
  },[]);

  const openDetails = async (kind: 'categories'|'titles'|'stock'|'low'|'out'|'borrowed') => {
    const titles: Record<string,string> = {
      categories: 'Danh sách thể loại',
      titles: 'Danh sách đầu sách',
      stock: 'Tổng số sách (theo tồn kho)',
      low: 'Sách sắp hết (≤5)',
      out: 'Sách hết hàng',
      borrowed: 'Sách đang mượn'
    };
    setModal({ open: true, title: titles[kind], kind, loading: true, data: [], error: undefined });
    try {
      if (kind === 'categories') {
        const items = await categoryApi.list();
        setModal(m => ({ ...m, loading: false, data: items }));
      } else if (kind === 'titles') {
        const items = await bookApi.list();
        setModal(m => ({ ...m, loading: false, data: items }));
      } else if (kind === 'stock') {
        const items = await reportApi.inventory();
        const normalized = (Array.isArray(items) ? items : []).map((b: any)=>({ code: b.code, title: b.title, stock: b.stock }));
        setModal(m => ({ ...m, loading: false, data: normalized }));
      } else if (kind === 'low') {
        const items = await reportApi.lowStock(5);
        const filtered = (Array.isArray(items) ? items : []).filter((b:any)=> (b.stock||0) > 0 && (b.stock||0) <= 5);
        setModal(m => ({ ...m, loading: false, data: filtered }));
      } else if (kind === 'out') {
        const inv = await reportApi.inventory();
        const items = (Array.isArray(inv) ? inv : []).filter((b:any)=>(b.stock||0)===0);
        setModal(m => ({ ...m, loading: false, data: items }));
      } else if (kind === 'borrowed') {
        const loans = await loanApi.list();
        const active = (Array.isArray(loans) ? loans : []).filter((l:any)=>!l.returnedAt);
        setModal(m => ({ ...m, loading: false, data: active }));
      }
    } catch (e:any) {
      setModal(m => ({ ...m, loading: false, error: e?.message || 'Lỗi tải dữ liệu' }));
    }
  };

  if (loading) return <Spinner />;
  if (!stats) return <div>Không có dữ liệu</div>;

  // Biểu đồ xu hướng mượn/trả
  const trendChartData = {
    labels: trends.map(t => {
      const date = new Date(t.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'Sách mượn',
        data: trends.map(t => t.borrowed),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3
      },
      {
        label: 'Sách trả',
        data: trends.map(t => t.returned),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3
      }
    ]
  };

  // Biểu đồ tròn trạng thái sách
  const stockChartData = {
    labels: ['Đang mượn', 'Sắp hết', 'Hết hàng', 'Còn đủ'],
    datasets: [{
      data: [
        stats.borrowedBooks,
        stats.lowStockBooks,
        stats.outOfStockBooks,
        stats.totalBooks - stats.borrowedBooks - stats.lowStockBooks - stats.outOfStockBooks
      ],
      backgroundColor: [
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(201, 203, 207, 0.8)',
        'rgba(75, 192, 192, 0.8)'
      ],
      borderColor: [
        'rgba(255, 206, 86, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(201, 203, 207, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Biểu đồ cột cảnh báo
  const alertChartData = {
    labels: ['Sắp hết', 'Hết hàng'],
    datasets: [{
      label: 'Số lượng',
      data: [stats.lowStockBooks, stats.outOfStockBooks],
      backgroundColor: [
        'rgba(255, 206, 86, 0.8)',
        'rgba(201, 203, 207, 0.8)'
      ],
      borderColor: [
        'rgba(255, 206, 86, 1)',
        'rgba(201, 203, 207, 1)'
      ],
      borderWidth: 1
    }]
  };

  return (
    <div>
      <h2>Tổng quan</h2>
      {error && <ErrorAlert error={error} />}
      
      <div className="card-grid mt-3">
        {/* Tổng thể loại */}
        <div className="stat-card" style={{cursor:'pointer'}} onClick={()=>openDetails('categories')}>
          <div className="stat-card__value">{stats.totalCategories}</div>
          <div className="stat-card__label">Tổng thể loại</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.totalBooks}</div>
          <div className="stat-card__label">Số đầu sách</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.totalStockBooks}</div>
          <div className="stat-card__label">Tổng số sách</div>
        </div>
        {/* Sách sắp hết */}
        <div className="stat-card" style={{borderLeft: '4px solid #ffc107', cursor:'pointer'}} onClick={()=>openDetails('low')}>
          <div className="stat-card__value" style={{color: '#ffc107'}}>{stats.lowStockBooks}</div>
          <div className="stat-card__label">Sách sắp hết (≤5)</div>
        </div>
        {/* Sách hết hàng */}
        <div className="stat-card" style={{borderLeft: '4px solid #6c757d', cursor:'pointer'}} onClick={()=>openDetails('out')}>
          <div className="stat-card__value" style={{color: '#6c757d'}}>{stats.outOfStockBooks}</div>
          <div className="stat-card__label">Hết hàng</div>
        </div>
      </div>

      <div className="card-grid mt-3">
        {/* Tổng độc giả */}
        <div className="stat-card">
          <div className="stat-card__value">{stats.totalReaders}</div>
          <div className="stat-card__label">Độc giả</div>
        </div>
        {/* Tổng lượt mượn */}
        <div className="stat-card">
          <div className="stat-card__value">{stats.totalLoans}</div>
          <div className="stat-card__label">Tổng lượt mượn</div>
        </div>
  <div className="stat-card stat-card--accent" style={{cursor:'pointer'}} onClick={()=>openDetails('borrowed')}>
          <div className="stat-card__value">{stats.borrowedBooks}</div>
          <div className="stat-card__label">Đang mượn</div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid-2 mt-4" style={{gap: '1rem'}}>
        <div className="panel">
          <div className="panel__header">Xu hướng mượn/trả (7 ngày)</div>
          <div style={{padding: '1rem'}}>
            <Line data={trendChartData} options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' as const },
                title: { display: false }
              },
              scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
              }
            }} />
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">Cảnh báo</div>
          <div style={{padding: '1rem'}}>
            <Bar data={alertChartData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false }
              },
              scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Modal hiển thị chi tiết */}
      {modal.open && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}} onClick={()=>setModal(m=>({...m, open:false}))}>
          <div style={{background:'#fff', width:'min(960px, 96vw)', maxHeight:'90vh', borderRadius:8, overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'12px 16px', borderBottom:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div style={{fontSize:18, fontWeight:600}}>{modal.title}</div>
              <button onClick={()=>setModal(m=>({...m, open:false}))} style={{border:'none', background:'transparent', fontSize:22, lineHeight:1, cursor:'pointer'}} aria-label="Đóng">×</button>
            </div>
            <div style={{padding:'12px 16px', overflow:'auto'}}>
              {modal.loading ? (
                <div>Đang tải...</div>
              ) : modal.error ? (
                <ErrorAlert error={modal.error} />
              ) : (
                <>
                  {modal.kind === 'categories' && (
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Tên thể loại</th>
                          <th style={{textAlign:'right'}}>Số đầu sách</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modal.data.map((c:any)=> (
                          <tr key={c.id}>
                            <td>{c.name}</td>
                            <td style={{textAlign:'right'}}>{c.bookCount ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {modal.kind === 'titles' && (
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Mã</th>
                          <th>Tên sách</th>
                          <th>Tác giả</th>
                          <th>Thể loại</th>
                          <th style={{textAlign:'right'}}>Tồn kho</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modal.data.map((b:any)=> (
                          <tr key={b.id}>
                            <td>{b.code}</td>
                            <td>{b.title}</td>
                            <td>{b.author}</td>
                            <td>{b.category?.name || ''}</td>
                            <td style={{textAlign:'right'}}>{b.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {modal.kind === 'stock' && (
                    <>
                      <div style={{marginBottom:8}}>Tổng đầu mục: {stats?.totalBooks} · Tổng số sách: {stats?.totalStockBooks}</div>
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Mã</th>
                            <th>Tên sách</th>
                            <th style={{textAlign:'right'}}>Tồn kho</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modal.data.map((b:any, idx:number)=> (
                            <tr key={idx}>
                              <td>{b.code}</td>
                              <td>{b.title}</td>
                              <td style={{textAlign:'right'}}>{b.stock}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                  {modal.kind === 'low' && (
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Mã</th>
                          <th>Tên sách</th>
                          <th style={{textAlign:'right'}}>Tồn kho</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modal.data.map((b:any)=> (
                          <tr key={b.bookId ?? b.id}>
                            <td>{b.code}</td>
                            <td>{b.title}</td>
                            <td style={{textAlign:'right'}}>{b.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {modal.kind === 'out' && (
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Mã</th>
                          <th>Tên sách</th>
                          <th style={{textAlign:'right'}}>Tồn kho</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modal.data.map((b:any)=> (
                          <tr key={b.bookId ?? b.id}>
                            <td>{b.code}</td>
                            <td>{b.title}</td>
                            <td style={{textAlign:'right'}}>{b.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {modal.kind === 'borrowed' && (
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Tên sách</th>
                          <th>Độc giả</th>
                          <th>Mượn lúc</th>
                          <th>Hạn trả</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modal.data.map((l:any)=> (
                          <tr key={l.id}>
                            <td>{l.book?.title || ''}</td>
                            <td>{l.reader?.name || ''}</td>
                            <td>{l.borrowedAt ? new Date(l.borrowedAt).toLocaleString() : ''}</td>
                            <td>{l.dueAt ? new Date(l.dueAt).toLocaleDateString() : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid-2 mt-4" style={{gap: '1rem'}}>
        <div className="panel">
          <div className="panel__header">Phân bổ trạng thái sách</div>
          <div style={{padding: '1rem', maxWidth: '400px', margin: '0 auto'}}>
            <Doughnut data={stockChartData} options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' as const }
              }
            }} />
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">Sách mới nhất</div>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Tên sách</th>
                <th>Tác giả</th>
                <th>Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {recentBooks.map((b:any)=>(
                <tr key={b.id}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: b.stock === 0 ? '#6c757d' : b.stock <= 5 ? '#ffc107' : '#28a745',
                      color: 'white'
                    }}>
                      {b.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
