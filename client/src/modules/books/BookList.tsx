import React, { useEffect, useState } from 'react';
import { bookApi, BookDTO } from '../../api/bookApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export default function BookList(){
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [code, setCode] = useState('');
  const [stock, setStock] = useState<number>(0);
  const [editing, setEditing] = useState<BookDTO|undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  const load = async () => {
    setLoading(true); setError(undefined);
    try {
      const data = (title || author) ? await bookApi.search(title || undefined, author || undefined) : await bookApi.list();
      setBooks(data);
    } catch(e:any){
      setError(e?.message || 'Lỗi tải sách');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const resetForm = () => { setCode(''); setTitle(''); setAuthor(''); setStock(0); setEditing(undefined); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(undefined);
      if(editing){
        await bookApi.update(editing.id, { code, title, author, stock });
      } else {
        await bookApi.create({ code, title, author, stock });
      }
      resetForm();
      load();
    } catch(e:any){ setError(e?.message || 'Lỗi lưu sách'); }
  };

  const startEdit = (b: BookDTO) => {
    setEditing(b); setCode(b.code); setTitle(b.title); setAuthor(b.author); setStock(b.stock);
  };

  const remove = async (id: number) => {
    if(!window.confirm('Xóa sách này?')) return;
    try { await bookApi.remove(id); load(); } catch(e:any){ setError(e?.message || 'Lỗi xóa sách'); }
  };

  return (
    <div className="container py-3">
      <h2>Sách</h2>
      <form className="row g-2 mb-3" onSubmit={submit}>
        <div className="col-2"><input required placeholder="Mã" className="form-control" value={code} onChange={e=>setCode(e.target.value)} /></div>
        <div className="col"><input required placeholder="Tiêu đề" className="form-control" value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div className="col"><input required placeholder="Tác giả" className="form-control" value={author} onChange={e=>setAuthor(e.target.value)} /></div>
        <div className="col-2"><input type="number" min={0} placeholder="Tồn kho" className="form-control" value={stock} onChange={e=>setStock(parseInt(e.target.value||'0'))} /></div>
        <div className="col-auto"><button className="btn btn-success" disabled={!code||!title||!author}>{editing?'Cập nhật':'Thêm mới'}</button></div>
        {editing && <div className="col-auto"><button type="button" className="btn btn-secondary" onClick={resetForm}>Hủy</button></div>}
      </form>
      <div className="row g-2 mb-2">
        <div className="col"><input placeholder="Tiêu đề" className="form-control" value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div className="col"><input placeholder="Tác giả" className="form-control" value={author} onChange={e=>setAuthor(e.target.value)} /></div>
        <div className="col-auto"><button className="btn btn-primary" onClick={load}>Tìm kiếm</button></div>
      </div>
  {loading && <Spinner/>}
  <ErrorAlert error={error} />
      <table className="table table-striped">
        <thead><tr><th>Mã</th><th>Tiêu đề</th><th>Tác giả</th><th>Tồn kho</th><th>Ẩn</th><th>Hành động</th></tr></thead>
        <tbody>
          {books.map(b => (
            <tr key={b.id}>
              <td>{b.code}</td>
              <td>{b.title}</td>
              <td>{b.author}</td>
              <td>{b.stock}</td>
              <td>{b.hidden ? 'Có' : 'Không'}</td>
              <td className="d-flex gap-1">
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(b)}>Sửa</button>
                <button type="button" className="btn btn-sm btn-outline-warning" onClick={async ()=>{ await bookApi.toggle(b.id); load(); }}>Ẩn/Hiện</button>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>remove(b.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
