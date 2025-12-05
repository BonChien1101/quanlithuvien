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
  const [pageSize, setPageSize] = useState<number>(5);

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
      setReaderError('ID bạn đọc không hợp lệ');
      setReaderReport(null);
      return;
    }
    try {
      setReaderError(undefined);
      const data = await reportApi.byReader(parsed);
      setReaderReport(data);
    } catch(e:any){
      const status = e?.response?.status;
      if (status === 400) setReaderError('ID bạn đọc không hợp lệ.');
      else if (status === 404) setReaderError('Không tìm thấy bạn đọc.');
      else if (status === 401) setReaderError('Chưa đăng nhập hoặc phiên hết hạn.');
      else if (status === 403) setReaderError('Bạn không có quyền xem báo cáo.');
      else setReaderError(e?.message || 'Lỗi tải báo cáo bạn đọc');
      setReaderReport(null);
    }
  };

  // Tạo ánh xạ bookId -> code từ inventory
  const bookIdToCode = React.useMemo(()=>{
    const map: Record<number, string> = {};
    inventory.forEach(b => {
      if (b.bookId && b.code) map[b.bookId] = b.code;
    });
    return map;
  }, [inventory]);

  return (
  <div className="container py-3" style={{background:'#f8fafc', minHeight:'100vh'}}>
      <div className="page-header mb-4">
        <h2 className="fw-bold text-primary">Báo cáo tổng hợp</h2>
      </div>
      {loading && <Spinner/>}
      <ErrorAlert error={error} />
  <div className="table-wrap" style={{marginBottom: '2rem'}}>
        {overview && (
          <div className="row g-4 mb-4">
            {[{
              label: 'Tổng lượt mượn', value: overview.totalBorrowed, color: 'primary'
            },{
              label: 'Tổng lượt trả', value: overview.totalReturned, color: 'success'
            },{
              label: 'Bạn đọc giao dịch', value: overview.totalActiveReaders, color: 'info'
            },{
              label: 'Sách khác nhau được mượn', value: overview.totalDistinctBooksBorrowed, color: 'warning'
            }].map((item, idx)=>(
              <div className="col-12 col-md-3" key={idx}>
                <div className="panel shadow-sm border rounded-4" style={{background:'#fff', minHeight:120}}>
                  <div className="panel__header fw-bold fs-5 text-secondary text-center mb-2">{item.label}</div>
                  <div className={`p-3 text-center`}>
                    <div className={`display-6 m-0 text-${item.color}`}>{item.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

  <div className="row g-4 mb-4" style={{marginBottom:'2rem'}}>
          <div className="col-12 col-lg-3 d-flex">
            <div className="panel shadow-sm border rounded-4 flex-fill d-flex flex-column" style={{background:'#fff', minHeight:260, marginBottom: '1rem', border:'1px solid #e0e0e0'}}>
              <div className="panel__header fw-bold fs-5 mb-3 text-center" style={{letterSpacing:1, background:'#e3f2fd', color:'#1565c0', borderRadius:'8px', padding:'8px 12px'}}>Top sách mượn</div>
              <div className="flex-fill">
                <table className="table table-sm mb-0" style={{fontSize:'0.97rem', marginBottom:'0.5rem'}}>
                  <thead style={{borderBottom:'2px solid #e0e0e0'}}><tr><th style={{borderRight:'1px solid #e0e0e0'}}>ID</th><th style={{borderRight:'1px solid #e0e0e0'}}>Tiêu đề</th><th>Số lượt mượn</th></tr></thead>
                  <tbody>
                    {topBooks.map(i=> (<tr key={i.bookId}><td>{i.bookId}</td><td>{i.title}</td><td>{i.count}</td></tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-3 d-flex">
            <div className="panel shadow-sm border rounded-4 flex-fill d-flex flex-column" style={{background:'#fff', minHeight:260, marginBottom: '1rem', border:'1px solid #e0e0e0'}}>
              <div className="panel__header fw-bold fs-5 mb-3 text-center" style={{letterSpacing:1, background:'#e3f2fd', color:'#1565c0', borderRadius:'8px', padding:'8px 12px'}}>Lượt mượn theo ngày</div>
              <div className="flex-fill">
                <table className="table table-sm mb-0" style={{fontSize:'0.97rem', marginBottom:'0.5rem'}}>
                  <thead style={{borderBottom:'2px solid #e0e0e0'}}><tr><th style={{borderRight:'1px solid #e0e0e0'}}>Ngày</th><th>Lượt mượn</th></tr></thead>
                  <tbody>
                    {borrowStats.map(i=> (<tr key={i.date}><td>{new Date(i.date).toLocaleDateString()}</td><td>{i.count}</td></tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-3 d-flex">
            <div className="panel shadow-sm border rounded-4 flex-fill d-flex flex-column" style={{background:'#fff', minHeight:260, marginBottom: '1rem', border:'1px solid #e0e0e0'}}>
              <div className="panel__header fw-bold fs-5 mb-3 text-center" style={{letterSpacing:1, background:'#e3f2fd', color:'#1565c0', borderRadius:'8px', padding:'8px 12px'}}>Sách sắp hết</div>
              <div className="flex-fill">
                <table className="table table-sm mb-0" style={{fontSize:'0.97rem', marginBottom:'0.5rem'}}>
                  <thead style={{borderBottom:'2px solid #e0e0e0'}}><tr><th style={{borderRight:'1px solid #e0e0e0'}}>Mã sách</th><th style={{borderRight:'1px solid #e0e0e0'}}>Tiêu đề</th><th>Tồn</th></tr></thead>
                  <tbody>
                    {lowStock.map(i=> (
                      <tr key={i.bookId}>
                        <td>{bookIdToCode[i.bookId] || <span className="text-muted">(không mã)</span>}</td>
                        <td>{i.title}</td>
                        <td>{i.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-3 d-flex">
            <div className="panel shadow-sm border rounded-4 flex-fill d-flex flex-column" style={{background:'#fff', minHeight:260, marginBottom: '1rem', border:'1px solid #e0e0e0'}}>
              <div className="panel__header fw-bold fs-5 mb-3 text-center" style={{letterSpacing:1, background:'#e3f2fd', color:'#1565c0', borderRadius:'8px', padding:'8px 12px'}}>Tồn kho</div>
              <div className="flex-fill">
                <table className="table table-sm mb-0" style={{fontSize:'0.97rem', marginBottom:'0.5rem'}}>
                  <thead style={{borderBottom:'2px solid #e0e0e0'}}><tr><th style={{borderRight:'1px solid #e0e0e0'}}>Mã sách</th><th style={{borderRight:'1px solid #e0e0e0'}}>Tiêu đề</th><th>Số lượng tồn</th></tr></thead>
                  <tbody>
                    {inventory.slice((page-1)*pageSize, (page-1)*pageSize + pageSize).map(i=> (
                      <tr key={i.bookId}>
                        <td>{i.code || <span className="text-muted">(không mã)</span>}</td>
                        <td>{i.title}</td>
                        <td>{i.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center p-2">
                <div className="text-muted small">Trang {page} / {Math.max(1, Math.ceil(inventory.length / pageSize))}</div>
                <div className="btn-group">
                  <button className="btn btn-outline-secondary btn-sm" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1, p-1))}>Trước</button>
                  <button className="btn btn-outline-secondary btn-sm" disabled={page>=Math.ceil(inventory.length / pageSize)} onClick={()=>setPage(p=>Math.min(Math.ceil(inventory.length / pageSize)||1, p+1))}>Sau</button>
                </div>
              </div>
              <div className="d-flex justify-content-end align-items-center gap-2 p-2">
                <label className="form-label m-0">Hiển thị</label>
                <select className="form-select form-select-sm" style={{width: 'auto'}} value={pageSize} onChange={e=>{ setPage(1); setPageSize(parseInt(e.target.value)); }}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
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
          {readerError && (
            <div className="alert alert-warning my-2 py-2 px-3">{readerError}</div>
          )}
          {readerReport && !readerError && (
            <div className="p-3">
              <div className="panel mb-3">
                <div className="panel__header">Thông tin bạn đọc</div>
                <div className="p-3">
                  <div className="row g-3">
                    <div className="col-md-3"><div className="text-muted small">ID</div><div className="fw-bold">{readerReport.reader?.id}</div></div>
                    <div className="col-md-3"><div className="text-muted small">Tên</div><div className="fw-bold">{readerReport.reader?.name}</div></div>
                    <div className="col-md-3"><div className="text-muted small">SĐT</div><div className="fw-bold">{readerReport.reader?.phone || '—'}</div></div>
                    <div className="col-md-3"><div className="text-muted small">Email</div><div className="fw-bold">{readerReport.reader?.email || '—'}</div></div>

                    <div className="col-md-3"><div className="text-muted small">Giới tính</div><div className="fw-bold">{
                      readerReport.reader?.gender === 'male' ? 'Nam'
                      : readerReport.reader?.gender === 'female' ? 'Nữ'
                      : readerReport.reader?.gender ? 'Khác' : '—'
                    }</div></div>
                    <div className="col-md-3"><div className="text-muted small">Ngày sinh</div><div className="fw-bold">{readerReport.reader?.dob ? new Date(readerReport.reader.dob).toLocaleDateString() : '—'}</div></div>
                    <div className="col-md-3"><div className="text-muted small">Địa chỉ</div><div className="fw-bold">{readerReport.reader?.address || '—'}</div></div>
                    <div className="col-md-3"><div className="text-muted small">Quota</div><div className="fw-bold">{readerReport.reader?.quota}</div></div>
                    <div className="col-12"><div className="text-muted small">Ghi chú</div><div className="fw-bold">{readerReport.reader?.note || '—'}</div></div>
                  </div>
                </div>
                <div className="p-3 pt-0">
                  <div className="text-muted small mb-1">Lịch sử mượn gần đây</div>
                  <div className="row g-2">
                    {[...readerReport.loans]
                      .sort((a:any,b:any)=>new Date(b.borrowedAt).getTime()-new Date(a.borrowedAt).getTime())
                      .slice(0,3)
                      .map((l:any)=> (
                        <div key={l.id} className="col-md-4">
                          <div className="card shadow-sm border-0 h-100">
                            <div className="card-body py-2 px-3">
                              <div className="fw-bold mb-1">{l.book?.title}</div>
                              <div className="text-muted small">Mượn lúc: {l.borrowedAt ? new Date(l.borrowedAt).toLocaleString() : '—'}</div>
                              <div className="text-muted small">Trả lúc: {l.returnedAt ? new Date(l.returnedAt).toLocaleString() : 'Chưa trả'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
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
