import React, { useEffect, useState } from 'react';
import { loanApi, LoanDTO } from '../../api/loanApi';
import { bookApi, BookDTO } from '../../api/bookApi';
import { readerApi, ReaderDTO } from '../../api/readerApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { useAppSelector } from '../../store';
import { selectToken } from '../../features/appSlice';

type Loan = LoanDTO;
type Book = BookDTO;
type Reader = ReaderDTO;

export default function LoansPage(){
  const token = useAppSelector(selectToken);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [bookId, setBookId] = useState<number>();
  const [readerId, setReaderId] = useState<number>();
  const [dueDraft, setDueDraft] = useState<Record<number, string>>({});
  //  trạng thái hiển thị modal yêu cầu mượn sách
  const [showRequest, setShowRequest] = useState(false);
  const [reqReaderId, setReqReaderId] = useState<number|undefined>(undefined);
  const [reqDueDate, setReqDueDate] = useState<string>('');
  const [cart, setCart] = useState<Array<{ bookId: number; qty: number }>>([]);
  // Tính toán thông tin bạn đọc đã chọn và quota còn lại
  const selectedReader = readers.find(r => r.id === (reqReaderId || -1));
  const totalRequestedQty = cart.reduce((sum, c) => sum + Math.max(1, Math.floor(c.qty)), 0);
  const remainingQuota = (selectedReader?.quota ?? 0) - totalRequestedQty;
  // Phân trang và tìm kiếm
  const [pageActive, setPageActive] = useState(1);
  const [limitActive, setLimitActive] = useState(5); // Giới hạn số lượng đang mượn
  const [pageReturned, setPageReturned] = useState(1);
  const [limitReturned, setLimitReturned] = useState(5); // Giới hạn số lượng trả về
  // tìm kiếm cho cả hai bảng
  const [qBookActive, setQBookActive] = useState('');
  const [qReaderActive, setQReaderActive] = useState('');
  const [qBookReturned, setQBookReturned] = useState('');
  const [qReaderReturned, setQReaderReturned] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  const load = async () => {
    setLoading(true);
    try {
  try {
    setError(undefined);
    const [l,b,r] = await Promise.all([loanApi.list(), bookApi.list(), readerApi.list()]);
    setLoans(l);
    setBooks(b);
    setReaders(r);
  } catch(e:any){ setError(e?.message || 'Lỗi tải dữ liệu'); }
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, [token]);
//reset trang khi thay đổi truy vấn tìm kiếm
  useEffect(()=>{ setPageActive(1); }, [limitActive]);
  useEffect(()=>{ setPageReturned(1); }, [limitReturned]);
  // reset trang khi thay đổi truy vấn tìm kiếm
  useEffect(()=>{ setPageActive(1); }, [qBookActive, qReaderActive]);
  useEffect(()=>{ setPageReturned(1); }, [qBookReturned, qReaderReturned]);

  const borrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!bookId || !readerId) return;
  try {
    setError(undefined);
    await loanApi.borrow(bookId, readerId);
  } catch(e:any){ setError(e?.message || 'Lỗi mượn sách'); }
    setBookId(undefined); setReaderId(undefined);
    load();
  };
  //  hàm xử lý gửi yêu cầu mượn sách
  const submitRequestBorrow = async () => {
    if (!reqReaderId) { setError('Vui lòng chọn bạn đọc'); return; }
    if (!reqDueDate) { setError('Vui lòng nhập hạn trả'); return; }
    if (cart.length === 0) { setError('Chưa chọn sách'); return; }
  
    if (selectedReader && remainingQuota < 0) { setError('Yêu cầu vượt quá quota của bạn đọc'); return; }
    // số lượng tồn kho cho mỗi mục (qty không được vượt quá tồn kho hiện tại và tồn kho phải > 0)
    const insufficient = cart.find(item => {
      const bk = books.find(b=>b.id===item.bookId);
      const stk = bk?.stock ?? 0;
      return stk <= 0 || item.qty > stk;
    });
    if (insufficient) { setError('Số lượng yêu cầu vượt quá tồn kho hoặc sách đã hết'); return; }
    try {
      setError(undefined);
      const dueAt = reqDueDate ? new Date(reqDueDate) : undefined;
      if (dueAt && isNaN(dueAt.getTime())) { setError('Ngày hạn trả không hợp lệ'); return; }
      for (const item of cart) {
        const times = Math.max(1, Math.floor(item.qty));
        for (let i = 0; i < times; i++) {
          await loanApi.borrow(item.bookId, reqReaderId!, dueAt);
        }
      }
      setShowRequest(false);
      setReqReaderId(undefined);
      setReqDueDate('');
      setCart([]);
      load();
    } catch (e:any) {
      setError(e?.response?.data?.message || e?.message || 'Lỗi yêu cầu mượn');
    }
  };
  const doReturn = async (id: number) => { try { setError(undefined); await loanApi.returnBook(id); load(); } catch(e:any){ setError(e?.message || 'Lỗi trả sách'); } };
  const updateDue = async (id: number, dueText: string) => {
    try {
      setError(undefined);
      const date = new Date(dueText);
      if (isNaN(date.getTime())) { setError('Ngày hạn trả không hợp lệ'); return; }
      await loanApi.updateDue(id, date);
      load();
    } catch(e:any){ setError(e?.message || 'Lỗi gia hạn'); }
  };

  const toInputDate = (d?: string | Date | null) => {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
// giao diện chính
  return (
  <div className="container py-3">
    <div className="mb-3">
      <button className="btn btn-outline-primary" onClick={()=>{ setShowRequest(true); setReqReaderId(undefined); setCart([]); setReqDueDate(''); }}>Yêu cầu mượn</button>
    </div>
    <hr/>
    {loading && <Spinner/>}
    <ErrorAlert error={error} />
    <div>
      <div className="panel mb-3">
        <div className="panel__header">Phiếu đang mượn</div>
        <div className="table-wrap">
          <div className="row g-2 mb-2">
            <div className="col"><input className="form-control form-control-sm" placeholder="Tên sách" value={qBookActive} onChange={e=>setQBookActive(e.target.value)} /></div>
            <div className="col"><input className="form-control form-control-sm" placeholder="Tên độc giả" value={qReaderActive} onChange={e=>setQReaderActive(e.target.value)} /></div>
          </div>
          <table className="table table-sm align-middle mb-0">
            <thead><tr><th>ID</th><th>Sách</th><th>Bạn đọc (ID)</th><th>Hạn trả</th><th>Thao tác</th></tr></thead>
            <tbody>
              {loans
                .filter(l=> !l.returnedAt)
                .filter(l=> (l.book?.title || '').toLowerCase().includes(qBookActive.toLowerCase()))
                .filter(l=> (l.reader?.name || '').toLowerCase().includes(qReaderActive.toLowerCase()))
                .slice((pageActive-1)*limitActive, pageActive*limitActive)
                .map(l=> (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.book?.title}</td>
                  <td>{l.reader?.name} {l.reader?.id ? (<span className="text-muted">({l.reader?.id})</span>) : null}</td>
                  <td>
                    {l.dueAt ? new Date(l.dueAt).toLocaleDateString() : ''}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-secondary" onClick={()=>{
                        const newDateStr = prompt('Nhập hạn trả mới (YYYY-MM-DD):', l.dueAt ? new Date(l.dueAt).toISOString().slice(0,10) : '');
                        if (!newDateStr) return;
                        const newDate = new Date(newDateStr);
                        if (isNaN(newDate.getTime())) { alert('Ngày không hợp lệ'); return; }
                        updateDue(l.id, newDateStr);
                      }}>Sửa hạn</button>
                      <button className="btn btn-outline-danger" onClick={()=>{
                        if (!confirm('Xóa lượt mượn này? Sách sẽ được trả về kho nếu chưa trả.')) return;
                        loanApi.remove(l.id)
                          .then(()=>{ alert('Đã xóa lượt mượn'); load(); })
                          .catch(err=>{ alert(err?.response?.data?.message || 'Lỗi xóa lượt mượn'); });
                      }}>Xóa</button>
                      <button className="btn btn-success" onClick={()=>doReturn(l.id)}>Trả</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ if(pageActive>1){ setPageActive(p=>p-1); } }} disabled={pageActive<=1}>Trước</button>
              <span>Trang {pageActive}</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ setPageActive(p=>p+1); }} disabled={loans.filter(l=>!l.returnedAt).length <= pageActive*limitActive}>Sau</button>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span>Hiển thị</span>
              <select className="form-select form-select-sm" style={{width:'auto'}} value={limitActive} onChange={e=>setLimitActive(parseInt(e.target.value))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>
 
      <div className="panel">
        <div className="panel__header">Phiếu đã trả</div>
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <div className="row g-2 mb-2">
            <div className="col"><input className="form-control form-control-sm" placeholder="Tên sách" value={qBookReturned} onChange={e=>setQBookReturned(e.target.value)} /></div>
            <div className="col"><input className="form-control form-control-sm" placeholder="Tên độc giả" value={qReaderReturned} onChange={e=>setQReaderReturned(e.target.value)} /></div>
          </div>
          <table className="table table-sm align-middle mb-0">
            <thead><tr><th>ID</th><th>Sách</th><th>Bạn đọc (ID)</th><th>Hạn trả</th><th>Trạng thái</th><th>Trả lúc</th></tr></thead>
            <tbody>
              {loans
                .filter(l=> !!l.returnedAt)
                .filter(l=> (l.book?.title || '').toLowerCase().includes(qBookReturned.toLowerCase()))
                .filter(l=> (l.reader?.name || '').toLowerCase().includes(qReaderReturned.toLowerCase()))
                .slice((pageReturned-1)*limitReturned, pageReturned*limitReturned)
                .map(l=> (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.book?.title}</td>
                  <td>{l.reader?.name} {l.reader?.id ? (<span className="text-muted">({l.reader?.id})</span>) : null}</td>
                  <td>{l.dueAt ? new Date(l.dueAt).toLocaleDateString(): ''}</td>
                  <td>
                    {(l.dueAt && new Date(l.dueAt).getTime() < (l.returnedAt ? new Date(l.returnedAt).getTime() : Date.now()))
                      ? <span className="badge bg-warning">Trả trễ</span>
                      : <span className="badge bg-success">Đúng hạn</span>}
                  </td>
                  <td>{l.returnedAt ? new Date(l.returnedAt).toLocaleString(): ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ if(pageReturned>1){ setPageReturned(p=>p-1); } }} disabled={pageReturned<=1}>Trước</button>
              <span>Trang {pageReturned}</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ setPageReturned(p=>p+1); }} disabled={loans.filter(l=>!!l.returnedAt).length <= pageReturned*limitReturned}>Sau</button>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span>Hiển thị</span>
              <select className="form-select form-select-sm" style={{width:'auto'}} value={limitReturned} onChange={e=>setLimitReturned(parseInt(e.target.value))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Modal yêu cầu mượn sách */}
    {showRequest && (
      <div className="modal d-block" tabIndex={-1} style={{background:'rgba(0,0,0,0.3)'}}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Yêu cầu mượn sách</h5>
              <button type="button" className="btn-close" onClick={()=>setShowRequest(false)}></button>
            </div>
            <div className="modal-body">
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Bạn đọc</label>
                    <select className="form-select" value={reqReaderId||''} onChange={e=>setReqReaderId(parseInt(e.target.value))}>
                    <option value="">-- Chọn bạn đọc --</option>
                    {readers.map(r=> <option key={r.id} value={r.id}>{r.name} ({r.id})</option>)}
                  </select>
                  {selectedReader && (
                    <div className="mt-2 small">
                      <span className="text-muted">Quota hiện tại: </span>
                      <span className={remainingQuota < 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                        {selectedReader.quota}
                      </span>
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Hạn trả</label>
                  <input type="date" className="form-control" value={reqDueDate} onChange={e=>setReqDueDate(e.target.value)} />
                </div>
              </div>
              <div className="panel">
                <div className="panel__header">Chọn sách và số lượng</div>
                <div className="p-2">
                  <div className="row g-2 align-items-end">
                    <div className="col-md-8">
                      <select className="form-select" onChange={e=>{ 
                        const id = parseInt(e.target.value); 
                        if (!id) return;

                        setCart(prev=>{
                          const idx = prev.findIndex(c=>c.bookId===id); 
                          if (idx>=0) { 
                            const next = [...prev]; next[idx] = { ...next[idx], qty: next[idx].qty + 1 }; return next;
                          }
                          return [...prev, { bookId: id, qty: 1 }]; 
                        });
                        e.currentTarget.selectedIndex = 0; // reset selection
                      }}>
                        <option value="">-- Thêm sách --</option>
                        {books.map(b=> ( 
                          <option key={b.id} value={b.id} disabled={(b.stock||0)===0}>{b.title} {(b.stock||0)===0 ? '(hết)' : ''}</option> // thêm sách bị hết kho thì disable
                        ))}
                      </select>
                    </div>

                  </div>

                  <div className="mt-2">
                    <span className="small text-muted">Tổng số lượng yêu cầu: {totalRequestedQty}</span>
                    {selectedReader && remainingQuota < 0 && (
                      <div className="alert alert-warning py-2 px-3 mt-2 mb-0">Yêu cầu vượt quá quota của bạn đọc.</div>
                    )}
                  </div>
                  <table className="table table-sm mt-3">
                    <thead><tr><th>Sách</th><th>Tồn</th><th>Số lượng</th><th></th></tr></thead>
                    <tbody>
                      {cart.map((item, idx)=>{
                        const b = books.find(x=>x.id===item.bookId);
                        return (
                          <tr key={item.bookId}>
                            <td>{b?.title}</td>
                            <td>{b?.stock ?? 0}</td>
                            <td style={{maxWidth:120}}>
                              <input type="number" min={1} className="form-control form-control-sm" value={item.qty}
                                onChange={e=>{
                                  const val = Math.max(1, parseInt(e.target.value||'1'));
                                  setCart(prev=>{
                                    const next = [...prev]; next[idx] = { ...next[idx], qty: val }; return next;
                                  });
                                }} />
                            </td>
                            <td className="text-end">
                              <button className="btn btn-sm btn-outline-danger" onClick={()=>{
                                setCart(prev=> prev.filter(c=>c.bookId!==item.bookId));
                              }}>Xóa</button>
                            </td>
                          </tr>
                        );
                      })}
                      {cart.length===0 && (
                        <tr><td colSpan={4} className="text-center text-muted">Chưa chọn sách</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={()=>setShowRequest(false)}>Đóng</button>
              <button type="button" className="btn btn-primary" disabled={!reqReaderId || cart.length===0 || remainingQuota < 0} onClick={submitRequestBorrow}>Gửi</button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
