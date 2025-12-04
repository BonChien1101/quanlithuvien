import React, { useEffect, useState } from 'react';
import { bookApi, BookDTO } from '../../api/bookApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import BookModal from './BookModal';

export default function BookList(){
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'visible'|'hidden'>('visible');
  const [editing, setEditing] = useState<BookDTO|undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  const load = async () => {
    setLoading(true); setError(undefined);
    try {
      const includeHidden = statusFilter !== 'visible';
      const params: any = { includeHidden: includeHidden ? 1 : 0, page, limit };
      const rs = (filterTitle || filterAuthor)
        ? await (await import('../../api/axiosClient')).default.get('/api/books/search', { params: { title: filterTitle || undefined, author: filterAuthor || undefined, ...params } })
        : await (await import('../../api/axiosClient')).default.get('/api/books', { params });
  const data = Array.isArray(rs.data) ? rs.data : (rs.data?.items ?? []);
      setBooks(data);
    } catch(e:any){ setError(e?.message || 'Lỗi tải sách'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);
  // Auto update list when status filter changes
  useEffect(()=>{ setPage(1); load(); }, [statusFilter]);
  useEffect(()=>{ setPage(1); load(); }, [limit]);
  // Reload when page changes
  useEffect(()=>{ load(); }, [page]);

  const closeModal = () => { setModalOpen(false); setEditing(undefined); };

  const handleSubmit = async (data: { code: string; title: string; author: string; stock: number; categoryId?: number }, editingId?: number) => {
    try {
      setError(undefined);
      const payload = { 
        code: data.code, 
        title: data.title, 
        author: data.author, 
        stock: data.stock, 
        categoryId: data.categoryId as number,
        imageUrl: (editing?.imageUrl ?? undefined)
      };
      if(editingId){ await bookApi.update(editingId, payload); }
      else { await bookApi.create(payload); }
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

  const handleSearch = () => {
    if (page !== 1) setPage(1); else load();
  };

  return (
    <div className="container py-3">
      <div className="page-header d-flex align-items-center justify-content-between">
        <h2 className="mb-0">Sách</h2>
        <button className="btn btn-primary" onClick={()=>{ setEditing(undefined); setModalOpen(true); }}>Thêm mới</button>
      </div>
      <div className="table-wrap">
        <div className="row g-2 mb-2">
          <div className="col"><input placeholder="Tiêu đề" className="form-control" value={filterTitle} onChange={e=>setFilterTitle(e.target.value)} /></div>
          <div className="col"><input placeholder="Tác giả"   className="form-control" value={filterAuthor} onChange={e=>setFilterAuthor(e.target.value)} /></div>
          <div className="col-auto"><button className="btn btn-primary" onClick={handleSearch}>Tìm kiếm</button></div>
          <div className="col-auto">
            <select className="form-select" value={statusFilter} onChange={e=>{ setStatusFilter(e.target.value as any); }}>
              <option value="visible">Danh sách hiển thị</option>
              <option value="hidden">Danh sách đã ẩn</option>
              <option value="all">Tất cả</option>
            </select>
          </div>

        </div>
        {loading && <Spinner/>}
        <ErrorAlert error={error} />
  <table className="table table-striped align-middle">
          <thead><tr><th>Tiêu đề</th><th>Ảnh</th><th>Mã</th><th>Tác giả</th><th>Tồn kho</th><th>Trạng thái</th><th className="text-end" style={{width:220}}>Hành động</th></tr></thead>
          <tbody>
            {books.filter(b=> {
              if(statusFilter === 'visible') return !b.hidden;
              if(statusFilter === 'hidden') return !!b.hidden;
              return true;
            }).map(b => (
              <tr key={b.id} className={b.hidden ? 'table-secondary text-muted' : ''}>
                <td>{b.title}</td>
                <td style={{width:80}}>{b.imageUrl ? <img src={b.imageUrl} alt={b.title} className="thumb thumb--sm" /> : <span className="text-muted">(không ảnh)</span>}</td>
                <td>{b.code || <span className="text-muted">(không mã)</span>}</td>
                <td>{b.author}</td>
                <td>{b.stock}</td>
                <td>
                  {b.hidden 
                    ? <span className="badge bg-secondary">Đã ẩn</span>
                    : <span className="badge bg-success">Hiển thị</span>
                  }
                </td>
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
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ if(page>1){ setPage(p=>p-1); } }} disabled={page<=1}>Trước</button>
            <span>Trang {page}</span> 
            <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ setPage(p=>p+1); }} disabled={books.length < limit}>Sau</button>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span>Hiển thị</span>
            <select className="form-select form-select-sm" style={{width: 'auto'}} value={limit} onChange={e=>setLimit(parseInt(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
      <BookModal open={modalOpen} initial={editing} onClose={closeModal} onSubmit={handleSubmit} />
    </div>
  );
}
