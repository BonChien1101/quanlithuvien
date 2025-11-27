
import React, { useEffect, useState } from 'react';
import { bookApi, BookDTO } from '../../api/bookApi'; // Sử dụng lớp API trung gian gọi backend
import { Spinner } from '../../components/Spinner'; // Hiển thị trạng thái tải
import { ErrorAlert } from '../../components/ErrorAlert'; // Hiển thị lỗi từ request backend
import BookModal from './BookModal'; // Modal thêm / sửa sách

export default function BookList(){
  const [books, setBooks] = useState<BookDTO[]>([]); // Danh sách sách lấy từ BACKEND
  // track current editing book (data passed into modal)
  // search filter state
  const [filterTitle, setFilterTitle] = useState(''); // Bộ lọc tiêu đề (gửi lên /api/books/search)
  const [filterAuthor, setFilterAuthor] = useState(''); // Bộ lọc tác giả (gửi lên /api/books/search)
  const [editing, setEditing] = useState<BookDTO|undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  // Gọi backend để lấy danh sách sách tk
  const load = async () => {
    setLoading(true); setError(undefined);
    try {
  const data = (filterTitle || filterAuthor) ? await bookApi.search(filterTitle || undefined, filterAuthor || undefined) : await bookApi.list();
      setBooks(data);
    } catch(e:any){
      setError(e?.message || 'Lỗi tải sách');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const closeModal = () => { setModalOpen(false); setEditing(undefined); };

  // Thêm mới hoặc cập nhật sách -> gọi POST / PUT BACKEND
  const handleSubmit = async (data: { code: string; title: string; author: string; stock: number; categoryId?: number }, editingId?: number) => {
    try {
      setError(undefined);
      if(editingId){
        await bookApi.update(editingId, data);
      } else {
        await bookApi.create(data);
      }
      closeModal();
      load();
    } catch(e:any){ setError(e?.message || 'Lỗi lưu sách'); }
  };

  // Mở modal sửa -> nạp dữ liệu hiện tại
  const startEdit = (b: BookDTO) => { setEditing(b); setModalOpen(true); };

  // Xóa sách -> gọi DELETE BACKEND
  const remove = async (id: number) => {
    if(!window.confirm('Xóa sách này?')) return;
    try { await bookApi.remove(id); load(); } catch(e:any){ setError(e?.message || 'Lỗi xóa sách'); }
  };

  return (
    <div className="container py-3">
      <div className="page-header d-flex align-items-center justify-content-between">
        <h2 className="mb-0">Sách</h2>
  {/* Nút mở modal thêm mới (không gửi request ngay) */}
 <button className="btn btn-success" onClick={()=>{ setEditing(undefined); setModalOpen(true); }}>Thêm mới</button>
      </div>
      <div className="table-wrap">
        <div className="row g-2 mb-2">
          <div className="col"><input placeholder="Lọc tiêu đề" className="form-control" value={filterTitle} onChange={e=>setFilterTitle(e.target.value)} /></div>
          <div className="col"><input placeholder="Lọc tác giả" className="form-control" value={filterAuthor} onChange={e=>setFilterAuthor(e.target.value)} /></div>
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
                  {/* Toggle ẩn/hiện -> BACKEND POST /api/books/{id}/toggle */}
                  <button type="button" className="btn btn-sm btn-outline-warning" onClick={async ()=>{ await bookApi.toggle(b.id); load(); }}>Ẩn/Hiện</button>
                  {/* Gọi DELETE BACKEND */}
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>remove(b.id)}>Xóa</button>
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
