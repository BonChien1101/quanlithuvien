import React, { useEffect, useState } from 'react';
import { bookApi, BookDTO } from '../../api/bookApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import BookModal from './BookModal';

export default function BookList(){
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [editing, setEditing] = useState<BookDTO|undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  const load = async () => {
    setLoading(true); setError(undefined);
    try {
      const data = (filterTitle || filterAuthor)
        ? await bookApi.search(filterTitle || undefined, filterAuthor || undefined)
        : await bookApi.list();
      setBooks(data);
    } catch(e:any){ setError(e?.message || 'Lỗi tải sách'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const closeModal = () => { setModalOpen(false); setEditing(undefined); };

  const handleSubmit = async (data: { code: string; title: string; author: string; stock: number; categoryId?: number }, editingId?: number) => {
    try {
      setError(undefined);
      if(editingId){ await bookApi.update(editingId, data); }
      else { await bookApi.create(data); }
      closeModal();
      load();
    } catch(e:any){ setError(e?.message || 'Lỗi lưu sách'); }
  };

  const startEdit = (b: BookDTO) => { setEditing(b); setModalOpen(true); };

  const remove = async (id: number) => {
    if(!window.confirm('Xóa sách này?')) return;
    try { setError(undefined); await bookApi.remove(id); load(); }
    catch(e:any){ setError(e?.message || 'Lỗi xóa sách'); }
  };

  const toggleHidden = async (id: number, currentHidden: boolean) => {
    try { setError(undefined); await bookApi.toggle(id); load(); }
    catch(e:any){ setError(e?.message || 'Lỗi thay đổi trạng thái sách'); }
  };

  return (
    <div className="container py-3">
      <div className="page-header d-flex align-items-center justify-content-between">
        <h2 className="mb-0">Sách</h2>
        <button className="btn btn-primary" onClick={()=>{ setEditing(undefined); setModalOpen(true); }}>Thêm mới</button>
      </div>
      <div className="table-wrap">
        <div className="row g-2 mb-2">
          <div className="col"><input placeholder="Lọc tiêu đề" className="form-control" value={filterTitle} onChange={e=>setFilterTitle(e.target.value)} /></div>
          <div className="col"><input placeholder="Lọc tác giả" className="form-control" value={filterAuthor} onChange={e=>setFilterAuthor(e.target.value)} /></div>
          <div className="col-auto"><button className="btn btn-primary" onClick={load}>Tìm kiếm</button></div>
          <div className="col-auto">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="showHidden" checked={showHidden} onChange={e=>setShowHidden(e.target.checked)} />
              <label className="form-check-label" htmlFor="showHidden">Hiện sách đã ẩn</label>
            </div>
          </div>
        </div>
        {loading && <Spinner/>}
        <ErrorAlert error={error} />
        <table className="table table-striped align-middle">
          <thead><tr><th>Tiêu đề</th><th>Ảnh</th><th>Mã</th><th>Tác giả</th><th>Tồn kho</th><th>Ẩn</th><th className="text-end" style={{width:220}}>Hành động</th></tr></thead>
          <tbody>
            {books.filter(b => showHidden || !b.hidden).map(b => (
              <tr key={b.id} className={b.hidden ? 'table-secondary text-muted' : ''}>
                <td>{b.title}</td>
                <td style={{width:80}}>{b.imageUrl ? <img src={b.imageUrl} alt={b.title} className="thumb thumb--sm" /> : <span className="text-muted">(không ảnh)</span>}</td>
                <td>{b.code || <span className="text-muted">(không mã)</span>}</td>
                <td>{b.author}</td>
                <td>{b.stock}</td>
                <td>{b.hidden ? 'Có' : 'Không'}</td>
                <td>
                  <div className="d-flex justify-content-end align-items-center gap-2">
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(b)}>Sửa</button>
                    <button type="button" className={`btn btn-sm ${b.hidden ? 'btn-success' : 'btn-outline-warning'}`} onClick={()=>toggleHidden(b.id, b.hidden || false)} title={b.hidden ? 'Hiện sách' : 'Ẩn sách'}>{b.hidden ? 'Hiện' : 'Ẩn'}</button>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>remove(b.id)}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BookModal open={modalOpen} initial={editing} onClose={closeModal} onSubmit={handleSubmit} />
    </div>
  );
}
