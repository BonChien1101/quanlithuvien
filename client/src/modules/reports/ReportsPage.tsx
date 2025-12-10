import React, { useEffect, useState } from 'react';
import { reportApi } from '../../api/reportApi';
import { loanApi } from '../../api/loanApi';
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
  const [summary, setSummary] = useState<{ period: 'week'|'month'; start: string; end: string; borrowed: number; returned: number } | null>(null);
  const [summaryPeriod, setSummaryPeriod] = useState<'week'|'month'>('week');
  const [summaryYear, setSummaryYear] = useState<number>(new Date().getFullYear());
  const [summaryMonth, setSummaryMonth] = useState<number>(new Date().getMonth()+1);
  // tuần
  const [summaryWeekStart, setSummaryWeekStart] = useState<string>('');
  const [summaryWeekEnd, setSummaryWeekEnd] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [overdueSummary, setOverdueSummary] = useState<{ currentlyOverdue: number; returnedLate: number } | null>(null);
  const [currentLoans, setCurrentLoans] = useState<any[]>([]);
  const [allLoans, setAllLoans] = useState<any[]>([]);

  const [readerId, setReaderId] = useState<string>('');
  const [readerReport, setReaderReport] = useState<any>(null);
  const [readerError, setReaderError] = useState<string|undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  const [curLoansPage, setCurLoansPage] = useState<number>(1);
  const [curLoansPageSize, setCurLoansPageSize] = useState<number>(5); 
  const [overduePage, setOverduePage] = useState<number>(1);
  const [overduePageSize, setOverduePageSize] = useState<number>(5);
  const [returnedLatePage, setReturnedLatePage] = useState<number>(1);
  const [returnedLatePageSize, setReturnedLatePageSize] = useState<number>(5);
  const [lowPage, setLowPage] = useState<number>(1);
  const [lowPageSize, setLowPageSize] = useState<number>(5);
  const [borrowPage, setBorrowPage] = useState<number>(1);
  const [borrowPageSize, setBorrowPageSize] = useState<number>(5);

  // Định dạng ngày/giờ theo vi-VN
  const fmtDate = (v?: string) => (v ? new Date(v).toLocaleDateString('vi-VN') : '');
  const fmtDateTime = (v?: string) => (v ? new Date(v).toLocaleString('vi-VN', { hour12: false }) : '');

  const overviewCards = React.useMemo(() => {
    if (!overview) return [] as Array<{ label: string; value: number; color: string }>;
    return [
      { label: 'Tổng lượt mượn', value: overview.totalBorrowed, color: 'primary' },
      { label: 'Tổng lượt trả', value: overview.totalReturned, color: 'success' },
      { label: 'Bạn đọc giao dịch', value: overview.totalActiveReaders, color: 'info' },
      { label: 'Sách khác nhau được mượn', value: overview.totalDistinctBooksBorrowed, color: 'warning' }
    ];
  }, [overview]);

  const load = async () => {
    setLoading(true);
    try {
      try {
        setError(undefined);
        const [inv, ov, low, top, stats, overdue, loans, sum] = await Promise.all([
          reportApi.inventory(),
          reportApi.overview(),
          reportApi.lowStock(5),
          reportApi.topBooks(5),
          reportApi.borrowStats(7), 
          reportApi.overdueSummary(), 
          loanApi.list(),
          reportApi.summary('week')
        ]);
        setInventory(inv);
        setOverview(ov);
        setLowStock(low);
        setTopBooks(top);
        setBorrowStats(stats);
        setOverdueSummary(overdue);
        setAllLoans(loans);
        setCurrentLoans(loans.filter((l:any)=>!l.returnedAt));
  setSummary(sum);
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

  // Fetch summary when controls change
  useEffect(()=>{
    const fetchSummary = async () => {
      try {
        setError(undefined);
        if (summaryPeriod === 'month') {
          const y = summaryYear;
          const m = summaryMonth;
          const data = await reportApi.summary('month', { year: y, month: m });
          setSummary(data);
        } else {
          // Nếu user chọn ngày bắt đầu/kết thúc thì dùng, nếu không sẽ mặc định tuần gần đây
          const start = summaryWeekStart ? new Date(summaryWeekStart) : null;
          const end = summaryWeekEnd ? new Date(summaryWeekEnd) : null;
          let extra: Record<string, any> | undefined = undefined;
          if (start || end) {
            const s = start ? new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)).toISOString() : undefined;
            const e = end ? new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)).toISOString() : undefined;
            extra = { ...(s?{ start: s }:{}), ...(e?{ end: e }:{}) };
          }
          const data = await reportApi.summary('week', extra);
          setSummary(data);
        }
      } catch (e:any) {
        const status = e?.response?.status;
        if (status === 401) setError('Chưa đăng nhập hoặc phiên hết hạn.');
        else if (status === 403) setError('Bạn không có quyền xem báo cáo.');
        else setError(e?.message || 'Lỗi tải báo cáo tóm tắt');
        setSummary(null);
      }
    };
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryPeriod, summaryYear, summaryMonth, summaryWeekStart, summaryWeekEnd]);

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

  // bookid -> code
  const bookIdToCode = React.useMemo(()=>{
    const map: Record<number, string> = {};
    inventory.forEach(b => {
      if (b.bookId && b.code) map[b.bookId] = b.code;
    });
    return map;
  }, [inventory]);

  const overdueLoans = React.useMemo(()=>{
    const now = Date.now();
    return currentLoans.filter((l:any)=> l.dueAt && new Date(l.dueAt).getTime() < now);
  }, [currentLoans]);

  const returnedLateLoans = React.useMemo(()=>{
    return allLoans.filter((l:any)=> !!l.returnedAt && !!l.dueAt && new Date(l.returnedAt).getTime() > new Date(l.dueAt).getTime());
  }, [allLoans]);

  // làm mới trang khi danh sách thay đổi
  useEffect(()=>{ setCurLoansPage(1); }, [currentLoans, curLoansPageSize]);
  useEffect(()=>{ setOverduePage(1); }, [overdueLoans, overduePageSize]);
  useEffect(()=>{ setReturnedLatePage(1); }, [returnedLateLoans, returnedLatePageSize]);
  useEffect(()=>{ setLowPage(1); }, [lowStock, lowPageSize]);
  useEffect(()=>{ setBorrowPage(1); }, [borrowStats, borrowPageSize]);

  return (
    <div className="container py-3" style={{background:'#f8fafc'}}>
      <div className="page-header mb-3">
        <h2 className="fw-bold text-primary">Báo cáo tổng hợp</h2>
      </div>
      {loading && <Spinner/>}
      <ErrorAlert error={error} />
      <div className="row g-3 mb-3">
        {overviewCards.map((item, idx) => (
          <div className="col-12 col-md-6 col-lg-3" key={idx}>
            <div className="panel shadow-sm border rounded-4 h-100" style={{background:'#fff'}}>
              <div className="panel__header fw-bold fs-6 text-secondary text-center mb-1">{item.label}</div>
              <div className={`p-3 text-center`}>
                <div className={`display-6 m-0 text-${item.color}`}>{item.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tóm tắt theo tuần/tháng */}
      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="panel shadow-sm border rounded-4" style={{background:'#fff'}}>
            <div className="panel__header fw-bold fs-6 d-flex align-items-center justify-content-between" style={{letterSpacing:1, background:'#e3f2fd', color:'#1565c0', borderRadius:'8px', padding:'8px 12px'}}>
              <span>Tóm tắt theo kỳ</span>
              <div className="d-flex align-items-center gap-2">
                <select className="form-select form-select-sm" style={{width:'auto'}} value={summaryPeriod} onChange={e=>setSummaryPeriod(e.target.value as 'week'|'month')}>
                  <option value="week">Theo tuần</option>
                  <option value="month">Theo tháng</option>
                </select>
                {summaryPeriod === 'month' && (
                  <>
                    <input type="number" className="form-control form-control-sm" style={{width:'100px'}} value={summaryYear} min={2000} max={3000} onChange={e=>setSummaryYear(parseInt(e.target.value||String(new Date().getFullYear()),10))} placeholder="Năm" />
                    <select className="form-select form-select-sm" style={{width:'auto'}} value={summaryMonth} onChange={e=>setSummaryMonth(parseInt(e.target.value,10))}>
                      {Array.from({length:12}, (_,i)=>i+1).map(m=> (<option key={m} value={m}>Tháng {m}</option>))}
                    </select>
                  </>
                )}
                {summaryPeriod === 'week' && (
                  <>
                    <input type="date" className="form-control form-control-sm" style={{width:'160px'}} value={summaryWeekStart} onChange={e=>setSummaryWeekStart(e.target.value)} placeholder="Bắt đầu" />
                    <input type="date" className="form-control form-control-sm" style={{width:'160px'}} value={summaryWeekEnd} onChange={e=>setSummaryWeekEnd(e.target.value)} placeholder="Kết thúc" />
                  </>
                )}
              </div>
            </div>
            <div className="p-3">
              {!summary && <div className="text-muted">Đang tải tóm tắt...</div>}
              {summary && (
                <div className="row g-3">
                  <div className="col-12 col-md-3">
                    <div className="panel shadow-sm border rounded-4 h-100" style={{background:'#fff'}}>
                      <div className="panel__header fw-bold fs-6 text-secondary text-center mb-1">Khoảng thời gian</div>
                      <div className="p-3 text-center">
                        <div className="small text-muted">{new Date(summary.start).toLocaleDateString('vi-VN')} — {new Date(summary.end).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div className="panel shadow-sm border rounded-4 h-100" style={{background:'#fff'}}>
                      <div className="panel__header fw-bold fs-6 text-secondary text-center mb-1">Lượt mượn</div>
                      <div className="p-3 text-center">
                        <div className="display-6 m-0 text-primary">{summary.borrowed}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div className="panel shadow-sm border rounded-4 h-100" style={{background:'#fff'}}>
                      <div className="panel__header fw-bold fs-6 text-secondary text-center mb-1">Lượt trả</div>
                      <div className="p-3 text-center">
                        <div className="display-6 m-0 text-success">{summary.returned}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div className="panel shadow-sm border rounded-4 h-100" style={{background:'#fff'}}>
                      <div className="panel__header fw-bold fs-6 text-secondary text-center mb-1">Kỳ</div>
                      <div className="p-3 text-center">
                        <div className="display-6 m-0 text-info">{summary.period === 'week' ? 'Tuần' : 'Tháng'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-3 d-flex">
          <div className="panel shadow-sm border rounded-4 flex-fill d-flex flex-column" style={{background:'#fff'}}>
            <div className="panel__header fw-bold fs-6 mb-2 text-center" style={{letterSpacing:1, background:'#e3f2fd', color:'#1565c0', borderRadius:'8px', padding:'8px 12px'}}>Top sách mượn</div>
            <div className="flex-fill">
              <table className="table table-sm mb-0" style={{fontSize:'0.95rem'}}>
                <thead><tr><th>ID</th><th>Tiêu đề</th><th>Lượt mượn</th></tr></thead>
                <tbody>
                  {topBooks.map(i=> (<tr key={i.bookId}><td>{i.bookId}</td><td>{i.title}</td><td>{i.count}</td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-3 d-flex">
          <div className="panel shadow-sm border rounded-4 flex-fill d-flex flex-column" style={{background:'#fff'}}>
            <div className="panel__header fw-bold fs-6 mb-2 text-center" style={{letterSpacing:1, background:'#e3f2fd', color:'#1565c0', borderRadius:'8px', padding:'8px 12px'}}>Lượt mượn theo ngày</div>
            <div className="flex-fill">
              <table className="table table-sm mb-0" style={{fontSize:'0.95rem'}}>
                <thead><tr><th>Ngày</th><th>Lượt mượn</th></tr></thead>
                <tbody>
                  {borrowStats
                    .slice((borrowPage-1)*borrowPageSize, (borrowPage-1)*borrowPageSize + borrowPageSize)
                    .map(i=> (<tr key={i.date}><td>{new Date(i.date).toLocaleDateString('vi-VN')}</td><td>{i.count}</td></tr>))}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-between align-items-center p-2">
              <div className="text-muted small">Trang {borrowPage} / {Math.max(1, Math.ceil(borrowStats.length / borrowPageSize))}</div>
              <div className="btn-group">
                <button className="btn btn-outline-secondary btn-sm" disabled={borrowPage<=1} onClick={()=>setBorrowPage(p=>Math.max(1, p-1))}>Trước</button>
                <button className="btn btn-outline-secondary btn-sm" disabled={borrowPage>=Math.ceil(borrowStats.length / borrowPageSize)} onClick={()=>setBorrowPage(p=>Math.min(Math.ceil(borrowStats.length / borrowPageSize)||1, p+1))}>Sau</button>
              </div>
            </div>
            <div className="d-flex justify-content-end align-items-center gap-2 p-2">
              <label className="form-label m-0">Hiển thị</label>
              <select className="form-select form-select-sm" style={{width: 'auto'}} value={borrowPageSize} onChange={e=>{ setBorrowPage(1); setBorrowPageSize(parseInt(e.target.value)); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-3 d-flex">
          <div className="panel shadow-sm border rounded-4 flex-fill d-flex flex-column" style={{background:'#fff'}}>
            <div className="panel__header fw-bold fs-6 mb-2 text-center" style={{letterSpacing:1, background:'#e3f2fd', color:'#1565c0', borderRadius:'8px', padding:'8px 12px'}}>Sách sắp hết</div>
            <div className="flex-fill">
              <table className="table table-sm mb-0" style={{fontSize:'0.95rem'}}>
                <thead><tr><th>Mã sách</th><th>Tiêu đề</th><th>Tồn</th></tr></thead>
                <tbody>
                  {lowStock
                    .slice((lowPage-1)*lowPageSize, (lowPage-1)*lowPageSize + lowPageSize)
                    .map(i=> (
                      <tr key={i.bookId}>
                        <td>{bookIdToCode[i.bookId] || <span className="text-muted">(không mã)</span>}</td>
                        <td>{i.title}</td>
                        <td>{i.stock}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-between align-items-center p-2">
              <div className="text-muted small">Trang {lowPage} / {Math.max(1, Math.ceil(lowStock.length / lowPageSize))}</div>
              <div className="btn-group">
                <button className="btn btn-outline-secondary btn-sm" disabled={lowPage<=1} onClick={()=>setLowPage(p=>Math.max(1, p-1))}>Trước</button>
                <button className="btn btn-outline-secondary btn-sm" disabled={lowPage>=Math.ceil(lowStock.length / lowPageSize)} onClick={()=>setLowPage(p=>Math.min(Math.ceil(lowStock.length / lowPageSize)||1, p+1))}>Sau</button>
              </div>
            </div>
            <div className="d-flex justify-content-end align-items-center gap-2 p-2">
              <label className="form-label m-0">Hiển thị</label>
              <select className="form-select form-select-sm" style={{width: 'auto'}} value={lowPageSize} onChange={e=>{ setLowPage(1); setLowPageSize(parseInt(e.target.value)); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-3 d-flex">
          <div className="panel shadow-sm border rounded-4 flex-fill d-flex flex-column" style={{background:'#fff'}}>
            <div className="panel__header fw-bold fs-6 mb-2 text-center" style={{letterSpacing:1, background:'#e3f2fd', color:'#1565c0', borderRadius:'8px', padding:'8px 12px'}}>Tồn kho</div>
            <div className="flex-fill">
              <table className="table table-sm mb-0" style={{fontSize:'0.95rem'}}>
                <thead><tr><th>Mã sách</th><th>Tiêu đề</th><th>Tồn</th></tr></thead>
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

      <div className="row g-3 mt-1">
        <div className="col-12">
          <div className="panel shadow-sm border rounded-4" style={{background:'#fff'}}>
            <div className="panel__header fw-bold fs-6 mb-2 text-center" style={{letterSpacing:1, background:'#fdecea', color:'#c62828', borderRadius:'8px', padding:'8px 12px'}}>Quá hạn</div>
            <div className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="text-muted">Đang quá hạn</div>
                <div className="badge bg-danger fs-6">{overdueSummary ? overdueSummary.currentlyOverdue : 0}</div>
              </div>
              <div className="table-responsive">
                <table className="table table-sm mb-0" style={{fontSize:'0.95rem'}}>
                  <thead><tr><th>ID</th><th>Sách</th><th>Bạn đọc (ID)</th><th>Mượn lúc</th><th>Hạn trả</th></tr></thead>
                  <tbody>
                    {[...overdueLoans]
                      .sort((a:any,b:any)=>new Date(b.dueAt).getTime()-new Date(a.dueAt).getTime())
                      .slice((overduePage-1)*overduePageSize, (overduePage-1)*overduePageSize + overduePageSize)
                      .map((l:any)=> (
                        <tr key={l.id}>
                          <td>{l.id}</td>
                          <td>{l.book?.title}</td>
                          <td style={{whiteSpace:'nowrap'}}>{l.reader?.name}{l.reader?.id ? ` (${l.reader.id})` : ''}</td>
                          <td>{fmtDateTime(l.borrowedAt)}</td>
                          <td className="text-danger fw-bold">{fmtDate(l.dueAt)}</td>
                        </tr>
                      ))}
                    {overdueLoans.length === 0 && (
                      <tr><td colSpan={5} className="text-center text-muted">Không có phiếu quá hạn</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ if(overduePage>1){ setOverduePage(p=>p-1); } }} disabled={overduePage<=1}>Trước</button>
                  <span>Trang {overduePage}</span>
                  <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ setOverduePage(p=>p+1); }} disabled={overdueLoans.length <= overduePage*overduePageSize}>Sau</button>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span>Hiển thị</span>
                  <select className="form-select form-select-sm" style={{width:'auto'}} value={overduePageSize} onChange={e=>setOverduePageSize(parseInt(e.target.value))}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Đã trả trễ  */}
      <div className="row g-3 mt-1">
        <div className="col-12">
          <div className="panel shadow-sm border rounded-4" style={{background:'#fff'}}>
            <div className="panel__header fw-bold fs-6 text-center" style={{letterSpacing:1, background:'#fff3e0', color:'#f57c00', borderRadius:'8px', padding:'8px 12px'}}>Đã trả trễ</div>
            <div className="p-2">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="text-muted">Tổng trả trễ</div>
                <div className="badge bg-warning text-dark fs-6">{overdueSummary ? overdueSummary.returnedLate : 0}</div>
              </div>
              <div className="table-responsive">
                <table className="table table-sm mb-0" style={{fontSize:'0.95rem'}}>
                  <thead><tr><th>ID</th><th>Sách</th><th>Bạn đọc (ID)</th><th>Mượn lúc</th><th>Trả lúc</th><th>Hạn trả</th></tr></thead>
                  <tbody>
                    {[...returnedLateLoans]
                      .sort((a:any,b:any)=>new Date(b.returnedAt).getTime()-new Date(a.returnedAt).getTime())
                      .slice((returnedLatePage-1)*returnedLatePageSize, (returnedLatePage-1)*returnedLatePageSize + returnedLatePageSize)
                      .map((l:any)=> (
                        <tr key={l.id}>
                          <td>{l.id}</td>
                          <td>{l.book?.title}</td>
                          <td style={{whiteSpace:'nowrap'}}>{l.reader?.name}{l.reader?.id ? ` (${l.reader.id})` : ''}</td>
                          <td>{fmtDateTime(l.borrowedAt)}</td>
                          <td className="text-warning fw-bold">{fmtDateTime(l.returnedAt)}</td>
                          <td>{fmtDate(l.dueAt)}</td>
                        </tr>
                      ))}
                    {returnedLateLoans.length === 0 && (
                      <tr><td colSpan={6} className="text-center text-muted">Không có phiếu trả trễ</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center pt-2">
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ if(returnedLatePage>1){ setReturnedLatePage(p=>p-1); } }} disabled={returnedLatePage<=1}>Trước</button>
                  <span>Trang {returnedLatePage}</span>
                  <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ setReturnedLatePage(p=>p+1); }} disabled={returnedLateLoans.length <= returnedLatePage*returnedLatePageSize}>Sau</button>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span>Hiển thị</span>
                  <select className="form-select form-select-sm" style={{width:'auto'}} value={returnedLatePageSize} onChange={e=>setReturnedLatePageSize(parseInt(e.target.value))}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sách đang mượn giữ nguyên phía sau */}
      <div className="row g-3 mt-1">
        <div className="col-12">
          <div className="panel shadow-sm border rounded-4" style={{background:'#fff'}}>
            <div className="panel__header fw-bold fs-6 text-center" style={{letterSpacing:1, background:'#e8f5e9', color:'#2e7d32', borderRadius:'8px', padding:'8px 12px', marginBottom: 0}}>Sách đang mượn</div>
            <div className="p-1">
               <div className="d-flex align-items-center justify-content-between">
                 <div className="text-muted">Tổng đang mượn</div>
                 <div className="badge bg-success fs-6">{currentLoans.length}</div>
               </div>
               <table className="table table-sm mb-0" style={{fontSize:'0.95rem'}}>
                 <thead><tr><th>ID</th><th>Sách</th><th>Bạn đọc</th><th>Mượn lúc</th><th>Hạn trả</th></tr></thead>
                 <tbody>
                   {[...currentLoans]
                     .sort((a:any,b:any)=>new Date(b.borrowedAt).getTime()-new Date(a.borrowedAt).getTime())
                     .slice((curLoansPage-1)*curLoansPageSize, (curLoansPage-1)*curLoansPageSize + curLoansPageSize)
                     .map((l:any)=> (
                       <tr key={l.id}>
                         <td>{l.id}</td>
                         <td>{l.book?.title}</td>
                         <td>{l.reader?.name}</td>
                         <td>{fmtDateTime(l.borrowedAt)}</td>
                         <td>{fmtDate(l.dueAt)}</td>
                       </tr>
                     ))}
                 </tbody>
               </table>
               <div className="d-flex justify-content-between align-items-center pt-1">
                 <div className="d-flex align-items-center gap-2">
                   <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ if(curLoansPage>1){ setCurLoansPage(p=>p-1); } }} disabled={curLoansPage<=1}>Trước</button>
                   <span>Trang {curLoansPage}</span>
                   <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ setCurLoansPage(p=>p+1); }} disabled={currentLoans.length <= curLoansPage*curLoansPageSize}>Sau</button>
                 </div>
                 <div className="d-flex align-items-center gap-2">
                   <span>Hiển thị</span>
                   <select className="form-select form-select-sm" style={{width: 'auto'}} value={curLoansPageSize} onChange={e=>setCurLoansPageSize(parseInt(e.target.value))}>
                     <option value={5}>5</option>
                     <option value={10}>10</option>
                     <option value={20}>20</option>
                   </select>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>

      <div className="panel mt-3">
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
                            <div className="text-muted small">Mượn lúc: {fmtDateTime(l.borrowedAt) || '—'}</div>
                            <div className="text-muted small">Trả lúc: {fmtDateTime(l.returnedAt) || 'Chưa trả'}</div>
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
                        <td>{fmtDateTime(l.borrowedAt)}</td>
                        <td>{fmtDate(l.dueAt)}</td>
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
                        <td>{fmtDateTime(l.borrowedAt)}</td>
                        <td>{fmtDateTime(l.returnedAt)}</td>
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
  );
}
