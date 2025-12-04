
import React, { useEffect, useState } from 'react';
import { bookApi } from '../api/bookApi';
import { readerApi } from '../api/readerApi';
import { loanApi } from '../api/loanApi';
import { Spinner } from '../components/Spinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { useAppSelector } from '../store';
import { selectRoles } from '../features/appSlice';

interface Stat { label: string; value: number; icon?: string; dark?: boolean; }

export default function Dashboard(){
  const roles = useAppSelector(selectRoles);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [recentReaders, setRecentReaders] = useState<any[]>([]);
  const [error, setError] = useState<string|undefined>();

  useEffect(()=>{
    const load = async () => {
      console.log('Dashboard loading...');
      setLoading(true); setError(undefined);
      const results = await Promise.allSettled([
        bookApi.list(),
        readerApi.list(),
        loanApi.list()
      ]);
      console.log('Dashboard API results:', results);
      const [booksR, readersR, loansR] = results;
      const hasError = results.some(r=>r.status==='rejected');
      if(hasError){
        console.warn('Dashboard load failed', results);
        setError('BACKEND');
      }
      const books = booksR.status==='fulfilled'?booksR.value:[];
      const readers = readersR.status==='fulfilled'?readersR.value:[];
      const loans = loansR.status==='fulfilled'?loansR.value:[];
      console.log('Dashboard data:', {books: books.length, readers: readers.length, loans: loans.length});
      const hiddenBooks = books.filter((b:any)=>b.hidden).length;
      const totalStock = books.reduce((sum:number,b:any)=> sum + (b.stock||0), 0);
      const baseStats: Stat[] = [
        { label: 'Độc giả', value: readers.length },
        { label: 'Sách', value: books.length },
        { label: 'Lượt mượn', value: loans.length },
        { label: 'Tổng tồn kho', value: totalStock },
      ];
      const isPrivileged = roles.includes('ADMIN') || roles.includes('LIBRARIAN');
      const statsFinal = isPrivileged ? [...baseStats, { label: 'Sách ẩn', value: hiddenBooks }] : baseStats;
      setStats(statsFinal);
      setRecentBooks(books.slice(-5));
      setRecentReaders(readers.slice(-5));
      setLoading(false);
      console.log('Dashboard loaded successfully');
    };
    load();
  },[]);

  if (loading) return <Spinner />;

  return (
    <div>
      <h2>Dashboard</h2>
  {error && <ErrorAlert error={error} />}
      <div className="card-grid mt-3">
        {stats.map((s,i)=>(
          <div key={i} className={`stat-card ${i===stats.length-1?'stat-card--accent':''}`}>
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid-2 mt-4">
        <div className="panel">
          <div className="panel__header">Sách mới</div>
          <table className="table table-sm align-middle">
            <thead><tr><th>Ảnh</th><th>Tên sách</th><th>Tác giả</th></tr></thead>
            <tbody>{recentBooks.map((b:any)=>(
              <tr key={b.id}>
                <td style={{width:64}}>{b.imageUrl ? <img src={b.imageUrl} alt={b.title} className="thumb thumb--sm" /> : null}</td>
                <td>{b.title}</td>
                <td>{b.author}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel__header">Bạn đọc mới</div>
          <table className="table table-sm">
            <thead><tr><th>Tên</th><th>Liên hệ</th></tr></thead>
            <tbody>{recentReaders.map((r:any)=>(<tr key={r.id}><td>{r.name}</td><td>{r.phone || r.email || r.contact}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
