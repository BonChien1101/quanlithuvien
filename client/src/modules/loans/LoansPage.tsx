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

  return <div className="container py-3">
    <h3>Quản lý mượn / trả</h3>
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
    <table className="table table-sm">
      <thead><tr><th>ID</th><th>Sách</th><th>Bạn đọc</th><th>Hạn trả</th><th>Thao tác</th></tr></thead>
      <tbody>
  {loans.map(l=> <tr key={l.id}><td>{l.id}</td><td>{l.book?.title}</td><td>{l.reader?.name}</td><td>{l.dueAt ? new Date(l.dueAt).toLocaleDateString(): ''}</td><td>{!l.returnedAt && <button className="btn btn-success btn-sm" onClick={()=>doReturn(l.id)}>Trả</button>}</td></tr>)}
      </tbody>
    </table>
  </div>;
}
