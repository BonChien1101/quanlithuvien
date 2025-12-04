import React, { useEffect, useState } from 'react';
import Select from 'react-select';
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
  // Pagination states for both panels
  const [pageActive, setPageActive] = useState(1);
  const [limitActive, setLimitActive] = useState(10);
  const [pageReturned, setPageReturned] = useState(1);
  const [limitReturned, setLimitReturned] = useState(10);
  // Search queries per panel
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
  // Reset page to 1 if page size changes
  useEffect(()=>{ setPageActive(1); }, [limitActive]);
  useEffect(()=>{ setPageReturned(1); }, [limitReturned]);
  // Reset page to 1 when search queries change
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

  return <div className="container py-3">
    <div className="page-header">
      <h2>Mượn/Trả</h2>
    </div>
    <form className="row g-2" onSubmit={borrow}>
      <div className="col-auto">
        <select className="form-select" value={bookId||''} onChange={e=>setBookId(parseInt(e.target.value))}>
          <option value="">-- Chọn sách --</option>
          {books.map(b=> <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
      </div>
      <div className="col-auto">
        <select className="form-select" value={readerId||''} onChange={e=>setReaderId(parseInt(e.target.value))}>
          <option value="">-- Chọn bạn đọc --</option>
          {readers.map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
      <div className="col-auto"><button className="btn btn-primary" disabled={!bookId || !readerId}>Mượn</button></div>
    </form>
    <hr/>
    {loading && <Spinner/>}
    <ErrorAlert error={error} />
    <div className="grid-2">
      <div className="panel">
        <div className="panel__header">Phiếu đang mượn</div>
        <div className="table-wrap">
          <div className="row g-2 mb-2">
            <div className="col"><input className="form-control form-control-sm" placeholder="Tên sách" value={qBookActive} onChange={e=>setQBookActive(e.target.value)} /></div>
            <div className="col"><input className="form-control form-control-sm" placeholder="Tên độc giả" value={qReaderActive} onChange={e=>setQReaderActive(e.target.value)} /></div>
          </div>
          <table className="table table-sm align-middle mb-0">
            <thead><tr><th>ID</th><th>Sách</th><th>Bạn đọc</th><th>Hạn trả</th><th>Thao tác</th></tr></thead>
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
                  <td>{l.reader?.name}</td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={dueDraft[l.id] ?? toInputDate(l.dueAt)}
                        onChange={(e)=> setDueDraft(prev => ({ ...prev, [l.id]: e.target.value }))}
                        onBlur={()=>{
                          const val = dueDraft[l.id];
                          const current = toInputDate(l.dueAt);
                          if (val && val !== current) updateDue(l.id, val);
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-success btn-sm" onClick={()=>doReturn(l.id)}>Trả</button>
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
        <div className="table-wrap">
          <div className="row g-2 mb-2">
            <div className="col"><input className="form-control form-control-sm" placeholder="Tên sách" value={qBookReturned} onChange={e=>setQBookReturned(e.target.value)} /></div>
            <div className="col"><input className="form-control form-control-sm" placeholder="Tên độc giả" value={qReaderReturned} onChange={e=>setQReaderReturned(e.target.value)} /></div>
          </div>
          <table className="table table-sm align-middle mb-0">
            <thead><tr><th>ID</th><th>Sách</th><th>Bạn đọc</th><th>Hạn trả</th><th>Quá hạn</th><th>Trả lúc</th></tr></thead>
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
                  <td>{l.reader?.name}</td>
                  <td>{l.dueAt ? new Date(l.dueAt).toLocaleDateString(): ''}</td>
                  <td>
                    {(l.dueAt && new Date(l.dueAt).getTime() < (l.returnedAt ? new Date(l.returnedAt).getTime() : Date.now()))
                      ? <span className="badge bg-danger">Quá hạn</span>
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
                    <div className="col-auto" style={{minWidth:220}}>
                      <Select
                        options={bookOptions}
                        value={bookOptions.find(o=>o.value===bookId) || null}
                        onChange={(opt: {value:number,label:string}|null) => setBookId(opt ? opt.value : undefined)}
                        placeholder="Chọn sách..."
                        isClearable
                      />
                    </div>
                    <div className="col-auto" style={{minWidth:220}}>
                      <Select
                        options={readerOptions}
                        value={readerOptions.find(o=>o.value===readerId) || null}
                        onChange={(opt: {value:number,label:string}|null) => setReaderId(opt ? opt.value : undefined)}
                        placeholder="Chọn bạn đọc..."
                        isClearable
                      />
                    </div>
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
  </div>;
}
