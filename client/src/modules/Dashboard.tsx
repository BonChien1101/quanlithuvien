
import React, { useEffect, useState } from 'react';
import { bookApi } from '../api/bookApi';
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
        setRecentBooks(booksData.slice(-5));
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
    labels: ['Quá hạn', 'Sắp hết', 'Hết hàng'],
    datasets: [{
      label: 'Số lượng',
      data: [stats.overdueBooks, stats.lowStockBooks, stats.outOfStockBooks],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(201, 203, 207, 0.8)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(201, 203, 207, 1)'
      ],
      borderWidth: 1
    }]
  };

  return (
    <div>
      <h2>Dashboard</h2>
      {error && <ErrorAlert error={error} />}
      
      {/* Thống kê tổng quan */}
      <div className="card-grid mt-3">
        <div className="stat-card">
          <div className="stat-card__value">{stats.totalReaders}</div>
          <div className="stat-card__label">Độc giả</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.totalBooks}</div>
          <div className="stat-card__label">Tổng sách</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.totalLoans}</div>
          <div className="stat-card__label">Tổng lượt mượn</div>
        </div>
        <div className="stat-card stat-card--accent">
          <div className="stat-card__value">{stats.borrowedBooks}</div>
          <div className="stat-card__label">Đang mượn</div>
        </div>
      </div>

      {/* Thống kê chi tiết - Cảnh báo */}
      <div className="card-grid mt-3">
        <div className="stat-card" style={{borderLeft: '4px solid #dc3545'}}>
          <div className="stat-card__value" style={{color: '#dc3545'}}>{stats.overdueBooks}</div>
          <div className="stat-card__label">Sách quá hạn</div>
        </div>
        <div className="stat-card" style={{borderLeft: '4px solid #ffc107'}}>
          <div className="stat-card__value" style={{color: '#ffc107'}}>{stats.lowStockBooks}</div>
          <div className="stat-card__label">Sách sắp hết (≤5)</div>
        </div>
        <div className="stat-card" style={{borderLeft: '4px solid #6c757d'}}>
          <div className="stat-card__value" style={{color: '#6c757d'}}>{stats.outOfStockBooks}</div>
          <div className="stat-card__label">Hết hàng</div>
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
