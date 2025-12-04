import React, { useEffect, useState } from 'react';
import { reportApi } from '../../api/reportApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { useAppSelector } from '../../store';
import { selectToken } from '../../features/appSlice';

export default function ReportsPage(){
  const token = useAppSelector(selectToken);
  const [inventory, setInventory] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [topBooks, setTopBooks] = useState<any[]>([]);
  const [borrowStats, setBorrowStats] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [readerId, setReaderId] = useState<string>('');
  const [readerReport, setReaderReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  const load = async () => {
    setLoading(true);
    try {
      try {
        setError(undefined);
        const [inv, ov, low, top, stats] = await Promise.all([
          reportApi.inventory(), reportApi.overview(), reportApi.lowStock(3), reportApi.topBooks(5), reportApi.borrowStats(7)
        ]);
        setInventory(inv);
        setOverview(ov);
        setLowStock(low);
        setTopBooks(top);
        setBorrowStats(stats);
        setPage(1);
      } catch(e:any){
        const status = e?.response?.status;
        if (status === 401) setError('Chưa đăng nhập hoặc phiên hết hạn.');
        else if (status === 403) setError('Bạn không có quyền xem báo cáo.');
        else setError(e?.message || 'Lỗi tải báo cáo');
      }
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, [token]);

  const fetchReader = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(readerId, 10);
    if(!readerId.trim() || !Number.isInteger(parsed) || parsed <= 0){
      setError('ID bạn đọc không hợp lệ');
      return;
    }
    try {
      setError(undefined);
      const data = await reportApi.byReader(parsed);
      setReaderReport(data);
    } catch(e:any){
      const status = e?.response?.status;
      if (status === 400) setError('ID bạn đọc không hợp lệ.');
      else if (status === 404) setError('Không tìm thấy bạn đọc.');
      else if (status === 401) setError('Chưa đăng nhập hoặc phiên hết hạn.');
      else if (status === 403) setError('Bạn không có quyền xem báo cáo.');
      else setError(e?.message || 'Lỗi tải báo cáo bạn đọc');
    }
  };

  return (
    <div className="container py-3">
      <div className="page-header">
        <h2>Báo cáo</h2>
      </div>
      {loading && <Spinner/>}
      <ErrorAlert error={error} />
      <div className="table-wrap">
        {overview && (
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-3">
              <div className="panel"><div className="panel__header">Tổng lượt mượn</div><div className="p-3"><div className="display-6 m-0">{overview.totalBorrowed}</div></div></div>
            </div>
            <div className="col-12 col-md-3">
              <div className="panel"><div className="panel__header">Tổng lượt trả</div><div className="p-3"><div className="display-6 m-0">{overview.totalReturned}</div></div></div>
            </div>
            <div className="col-12 col-md-3">
              <div className="panel"><div className="panel__header">Bạn đọc giao dịch</div><div className="p-3"><div className="display-6 m-0">{overview.totalActiveReaders}</div></div></div>
            </div>
            <div className="col-12 col-md-3">
              <div className="panel"><div className="panel__header">Sách khác nhau được mượn</div><div className="p-3"><div className="display-6 m-0">{overview.totalDistinctBooksBorrowed}</div></div></div>
            </div>
          </div>
        )}

        <div className="row g-3 mb-3">
          <div className="col-12 col-md-6">
            <div className="panel">
              <div className="panel__header">Top sách mượn </div>
              <table className="table table-sm mb-0">
                <thead><tr><th>Book ID</th><th>Tiêu đề</th><th>Số lượt mượn</th></tr></thead>
                <tbody>
                  {topBooks.map(i=> (<tr key={i.bookId}><td>{i.bookId}</td><td>{i.title}</td><td>{i.count}</td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="panel">
              <div className="panel__header">Lượt mượn theo ngày </div>
              <table className="table table-sm mb-0">
                <thead><tr><th>Ngày</th><th>Lượt mượn</th></tr></thead>
                <tbody>
                  {borrowStats.map(i=> (<tr key={i.date}><td>{new Date(i.date).toLocaleDateString()}</td><td>{i.count}</td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-12 col-md-6">
            <div className="panel">
              <div className="panel__header">Sách sắp hết</div>
              <table className="table table-sm mb-0">
                <thead><tr><th>Book ID</th><th>Tiêu đề</th><th>Tồn</th></tr></thead>
                <tbody>
                  {lowStock.map(i=> (<tr key={i.bookId}><td>{i.bookId}</td><td>{i.title}</td><td>{i.stock}</td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="panel">
              <div className="panel__header d-flex justify-content-between align-items-center">
                <span>Tồn kho</span>
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label m-0">Hiển thị</label>
                  <select className="form-select form-select-sm" style={{width: 'auto'}} value={pageSize} onChange={e=>{ setPage(1); setPageSize(parseInt(e.target.value)); }}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              <table className="table table-sm mb-0">
                <thead><tr><th>Book ID</th><th>Tiêu đề</th><th>Số lượng tồn</th></tr></thead>
                <tbody>
                  {inventory.slice((page-1)*pageSize, (page-1)*pageSize + pageSize).map(i=> (
                    <tr key={i.bookId}><td>{i.bookId}</td><td>{i.title}</td><td>{i.stock}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="d-flex justify-content-between align-items-center p-2">
                <div className="text-muted small">Trang {page} / {Math.max(1, Math.ceil(inventory.length / pageSize))}</div>
                <div className="btn-group">
                  <button className="btn btn-outline-secondary btn-sm" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1, p-1))}>Trước</button>
                  <button className="btn btn-outline-secondary btn-sm" disabled={page>=Math.ceil(inventory.length / pageSize)} onClick={()=>setPage(p=>Math.min(Math.ceil(inventory.length / pageSize)||1, p+1))}>Sau</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="panel mb-3">
          <div className="panel__header d-flex justify-content-between align-items-center">
            <span>Báo cáo theo bạn đọc</span>
            <form className="d-flex align-items-center gap-2" onSubmit={fetchReader}>
              <label className="form-label m-0">Reader ID</label>
              <input type="number" min={1} step={1} className="form-control form-control-sm" style={{width:'120px'}} value={readerId} onChange={e=>setReaderId(e.target.value)} placeholder="ID"/>
              <button className="btn btn-primary btn-sm" disabled={!readerId || !Number.isInteger(parseInt(readerId,10)) || parseInt(readerId,10) <= 0}>Xem</button>
            </form>
          </div>
          {readerReport && (
            <div className="p-3">
              <div className="panel mb-3">
                <div className="panel__header">Thông tin bạn đọc</div>
                <div className="p-3">
                  <div className="row g-3">
                    <div className="col-md-3"><div className="text-muted small">ID</div><div className="fw-bold">{readerReport.reader?.id}</div></div>
                    <div className="col-md-3"><div className="text-muted small">Tên</div><div className="fw-bold">{readerReport.reader?.name}</div></div>
                    <div className="col-md-3"><div className="text-muted small">SĐT</div><div className="fw-bold">{readerReport.reader?.phone || '—'}</div></div>
                    <div className="col-md-3"><div className="text-muted small">Email</div><div className="fw-bold">{readerReport.reader?.email || '—'}</div></div>
                    <div className="col-md-3"><div className="text-muted small">Liên hệ</div><div className="fw-bold">{readerReport.reader?.contact || '—'}</div></div>
                    <div className="col-md-3"><div className="text-muted small">Giới tính</div><div className="fw-bold">{readerReport.reader?.gender || '—'}</div></div>
                    <div className="col-md-3"><div className="text-muted small">Ngày sinh</div><div className="fw-bold">{readerReport.reader?.dob ? new Date(readerReport.reader.dob).toLocaleDateString() : '—'}</div></div>
                    <div className="col-md-6"><div className="text-muted small">Địa chỉ</div><div className="fw-bold">{readerReport.reader?.address || '—'}</div></div>
                    <div className="col-12"><div className="text-muted small">Ghi chú</div><div className="fw-bold">{readerReport.reader?.note || '—'}</div></div>
                    <div className="col-md-3"><div className="text-muted small">Quota</div><div className="fw-bold">{readerReport.reader?.quota}</div></div>
                  </div>
                </div>
                <div className="p-3 pt-0">
                  <div className="text-muted small mb-1">Lịch sử mượn gần đây</div>
                  <ul className="list-unstyled m-0">
                    {readerReport.loans.slice(0,5).map((l:any)=> (
                      <li key={l.id}>
                        <span className="fw-bold">{l.book?.title}</span>
                        <span className="text-muted"> — mượn lúc {l.borrowedAt ? new Date(l.borrowedAt).toLocaleString() : '—'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="grid-2">
                <div className="panel">
                  <div className="panel__header">Phiếu đang mượn</div>
                  <table className="table table-sm">
                    <thead><tr><th>ID</th><th>Sách</th><th>Mượn lúc</th><th>Hạn trả</th></tr></thead>
                    <tbody>
                      {readerReport.loans.filter((l:any)=>!l.returnedAt).map((l:any)=> (
                        <tr key={l.id}>
                          <td>{l.id}</td>
                          <td>{l.book?.title}</td>
                          <td>{l.borrowedAt ? new Date(l.borrowedAt).toLocaleString() : ''}</td>
                          <td>{l.dueAt ? new Date(l.dueAt).toLocaleDateString() : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="panel">
                  <div className="panel__header">Phiếu đã trả</div>
                  <table className="table table-sm">
                    <thead><tr><th>ID</th><th>Sách</th><th>Mượn lúc</th><th>Trả lúc</th></tr></thead>
                    <tbody>
                      {readerReport.loans.filter((l:any)=>!!l.returnedAt).map((l:any)=> (
                        <tr key={l.id}>
                          <td>{l.id}</td>
                          <td>{l.book?.title}</td>
                          <td>{l.borrowedAt ? new Date(l.borrowedAt).toLocaleString() : ''}</td>
                          <td>{l.returnedAt ? new Date(l.returnedAt).toLocaleString() : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
