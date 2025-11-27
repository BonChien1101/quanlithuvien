import React, { useEffect, useState } from 'react';
import { bookApi, BookDTO } from '../../api/bookApi';
import { loanApi, LoanDTO } from '../../api/loanApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export default function BorrowPage(){
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [bookId, setBookId] = useState<number|undefined>();
  const [readerIdText, setReaderIdText] = useState('');
  const readerId = readerIdText ? parseInt(readerIdText) : undefined;
  const [loans, setLoans] = useState<LoanDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  useEffect(()=>{ (async ()=>{ try { setError(undefined); const b = await bookApi.list(); setBooks(b); } catch(e:any){ setError(e?.message||'Lỗi tải sách'); } })(); },[]);

  const loadLoans = async () => {
    if(!readerId) { setLoans([]); return; }
    try { setError(undefined); const l = await loanApi.byReader(readerId); setLoans(l); } catch(e:any){ setError(e?.message||'Lỗi tải phiếu mượn'); }
  };
  useEffect(()=>{ loadLoans(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [readerId]);

  const borrow = async (e: React.FormEvent) => {
    e.preventDefault(); if(!bookId || !readerId) return;
    try { setLoading(true); setError(undefined); await loanApi.borrow(bookId, readerId); setBookId(undefined); await loadLoans(); }
    catch(e:any){ setError(e?.message||'Lỗi mượn sách'); }
    finally { setLoading(false); }
  };

  const doReturn = async (id: number) => {
    try { setLoading(true); setError(undefined); await loanApi.returnBook(id); await loadLoans(); }
    catch(e:any){ setError(e?.message||'Lỗi trả sách'); }
    finally { setLoading(false); }
  };

  return (
    <div className="container py-3">
      <div className="page-header"><h2>Mượn sách</h2></div>
      <div className="form-card" style={{maxWidth: 640}}>
        <form className="row g-2 align-items-end" onSubmit={borrow}>
          <div className="col-12 col-md">
            <label className="form-label">Mã độc giả</label>
            <input className="form-control" placeholder="Nhập ID của bạn" value={readerIdText} onChange={e=>setReaderIdText(e.target.value.replace(/[^0-9]/g,''))} />
          </div>
          <div className="col-12 col-md">
            <label className="form-label">Chọn sách</label>
            <select className="form-select" value={bookId||''} onChange={e=>setBookId(parseInt(e.target.value))}>
              <option value="">-- Chọn sách --</option>
              {books.map(b=> <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-auto"><button className="btn btn-primary" disabled={!bookId || !readerId}>Mượn</button></div>
        </form>
      </div>
      {loading && <div className="mt-3"><Spinner/></div>}
      <ErrorAlert error={error} />
      <div className="table-wrap mt-3">
        <h5>Phiếu mượn của bạn</h5>
        <table className="table table-sm">
          <thead><tr><th>ID</th><th>Sách</th><th>Mượn lúc</th><th>Hạn trả</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>
            {loans.map(l=> (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{l.book?.title}</td>
                <td>{l.borrowedAt ? new Date(l.borrowedAt).toLocaleString() : ''}</td>
                <td>{l.dueAt ? new Date(l.dueAt).toLocaleDateString() : ''}</td>
                <td>{l.returnedAt ? 'Đã trả' : 'Đang mượn'}</td>
                <td>{!l.returnedAt && <button className="btn btn-success btn-sm" onClick={()=>doReturn(l.id)}>Trả</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
