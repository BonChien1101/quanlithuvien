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
  const [readerError, setReaderError] = useState<string|undefined>();
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
    setReaderError(undefined);
    setReaderReport(null);
    try {
      const data = await reportApi.byReader(parseInt(readerId));
      setReaderReport(data);
    } catch(e:any){ 
      if (e?.response?.status === 404) {
        setReaderError('Mã độc giả không tồn tại');
      } else {
        setReaderError(e?.message || 'Lỗi tải báo cáo bạn đọc');
      }
    }
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
          <h5>Thống kê theo tuần</h5>
          <div className="card">
            <div className="card-body">
              <p><strong>Thời gian:</strong> {summaryWeek.start ? new Date(summaryWeek.start).toLocaleDateString('vi-VN') : 'N/A'} - {summaryWeek.end ? new Date(summaryWeek.end).toLocaleDateString('vi-VN') : 'N/A'}</p>
              <p><strong>Sách đã mượn:</strong> <span className="badge bg-primary">{summaryWeek.borrowed || 0}</span></p>
              <p><strong>Sách đã trả:</strong> <span className="badge bg-success">{summaryWeek.returned || 0}</span></p>
              <p><strong>Đang mượn:</strong> <span className="badge bg-warning">{(summaryWeek.borrowed || 0) - (summaryWeek.returned || 0)}</span></p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <h5>Thống kê theo tháng</h5>
          <div className="card">
            <div className="card-body">
              <p><strong>Thời gian:</strong> {summaryMonth.start ? new Date(summaryMonth.start).toLocaleDateString('vi-VN') : 'N/A'} - {summaryMonth.end ? new Date(summaryMonth.end).toLocaleDateString('vi-VN') : 'N/A'}</p>
              <p><strong>Sách đã mượn:</strong> <span className="badge bg-primary">{summaryMonth.borrowed || 0}</span></p>
              <p><strong>Sách đã trả:</strong> <span className="badge bg-success">{summaryMonth.returned || 0}</span></p>
              <p><strong>Đang mượn:</strong> <span className="badge bg-warning">{(summaryMonth.borrowed || 0) - (summaryMonth.returned || 0)}</span></p>
            </div>
          </div>
        </div>
      </div>
      <hr/>
      <h5>Báo cáo theo bạn đọc</h5>
      <form className="row g-2 mb-3" onSubmit={fetchReader}>
        <div className="col-auto"><input className="form-control" value={readerId} onChange={e=>setReaderId(e.target.value)} placeholder="Nhập mã độc giả"/></div>
        <div className="col-auto"><button className="btn btn-secondary" disabled={!readerId}>Xem báo cáo</button></div>
      </form>
      {readerError && (
        <div className="alert alert-danger" role="alert">
          {readerError}
        </div>
      )}
      {readerReport && (
        <div className="card">
          <div className="card-body">
            <h6>Thông tin độc giả</h6>
            <p><strong>Mã:</strong> {readerReport.reader?.id}</p>
            <p><strong>Họ tên:</strong> {readerReport.reader?.name}</p>
            <p><strong>Hạn mức:</strong> {readerReport.reader?.quota} cuốn</p>
            <hr/>
            <h6>Lịch sử mượn sách</h6>
            {readerReport.loans && readerReport.loans.length > 0 ? (
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã sách</th>
                    <th>Tên sách</th>
                    <th>Ngày mượn</th>
                    <th>Hạn trả</th>
                    <th>Ngày trả</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {readerReport.loans.map((loan: any, idx: number) => (
                    <tr key={loan.id}>
                      <td>{idx + 1}</td>
                      <td>{loan.bookId}</td>
                      <td>{loan.book?.title || 'N/A'}</td>
                      <td>{loan.borrowedAt ? new Date(loan.borrowedAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                      <td>{loan.dueAt ? new Date(loan.dueAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                      <td>{loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString('vi-VN') : '-'}</td>
                      <td>
                        {loan.returnedAt ? (
                          <span className="badge bg-success">Đã trả</span>
                        ) : (
                          <span className="badge bg-warning">Đang mượn</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted">Chưa có lịch sử mượn sách</p>
            )}
          </div>
        </div>
      )}
    </div>
  </div>;
}
