import React, { useEffect, useState } from 'react';
import { reportApi } from '../../api/reportApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { useAppSelector } from '../../store';
import { selectToken } from '../../features/appSlice';

export default function ReportsPage(){
  const token = useAppSelector(selectToken);
  const [inventory, setInventory] = useState<any[]>([]);
  const [summaryWeek, setSummaryWeek] = useState<any>({});
  const [summaryMonth, setSummaryMonth] = useState<any>({});
  const [readerId, setReaderId] = useState<string>('');
  const [readerReport, setReaderReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  const load = async () => {
    setLoading(true);
    try {
      try {
        setError(undefined);
        const [inv, week, month] = await Promise.all([
          reportApi.inventory(), reportApi.summary('week'), reportApi.summary('month')
        ]);
        setInventory(inv);
        setSummaryWeek(week);
        setSummaryMonth(month);
      } catch(e:any){ setError(e?.message || 'Lỗi tải báo cáo'); }
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, [token]);

  const fetchReader = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!readerId.trim()) return;
    try {
      setError(undefined);
      const data = await reportApi.byReader(parseInt(readerId));
      setReaderReport(data);
    } catch(e:any){ setError(e?.message || 'Lỗi tải báo cáo bạn đọc'); }
  };

  return <div className="container py-3">
    <div className="page-header">
      <h2>Báo cáo</h2>
    </div>
    {loading && <Spinner/>}
    <ErrorAlert error={error} />
    <div className="table-wrap">
      <h5>Tồn kho</h5>
      <table className="table table-sm">
        <thead><tr><th>Book ID</th><th>Tiêu đề</th><th>Số lượng tồn</th></tr></thead>
        <tbody>
          {inventory.map(i=> <tr key={i.bookId}><td>{i.bookId}</td><td>{i.title}</td><td>{i.stock}</td></tr>)}
        </tbody>
      </table>
      <div className="row">
        <div className="col-md-6">
          <h6>Tuần</h6>
          <pre className="bg-light p-2 small">{JSON.stringify(summaryWeek, null, 2)}</pre>
        </div>
        <div className="col-md-6">
          <h6>Tháng</h6>
          <pre className="bg-light p-2 small">{JSON.stringify(summaryMonth, null, 2)}</pre>
        </div>
      </div>
      <hr/>
      <h5>Báo cáo theo bạn đọc</h5>
      <form className="row g-2" onSubmit={fetchReader}>
        <div className="col-auto"><input className="form-control" value={readerId} onChange={e=>setReaderId(e.target.value)} placeholder="Reader ID"/></div>
        <div className="col-auto"><button className="btn btn-secondary" disabled={!readerId}>Xem</button></div>
      </form>
      {readerReport && <pre className="bg-light p-2 mt-2 small">{JSON.stringify(readerReport, null, 2)}</pre>}
    </div>
  </div>;
}
