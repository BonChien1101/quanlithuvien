import React, { useEffect, useState } from 'react';
import { bookApi, BookDTO } from '../../api/bookApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export default function BrowseBooksPage() {
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | 'ALL'>('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [detailBook, setDetailBook] = useState<BookDTO | null>(null);
  // Phân trang client-side
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6); // vài dữ liệu mỗi trang
  const [sortKey, setSortKey] = useState<'title'|'author'|'stock'>('title');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = (filterTitle || filterAuthor)
        ? await bookApi.search(filterTitle || undefined, filterAuthor || undefined)
        : await bookApi.list();
      // hthi sách ko bị ẩn
      setBooks(data.filter(b => !b.hidden));
    } catch (e: any) {
      setError(e?.message || 'Lỗi tải sách');
    } finally {
      setLoading(false);
    }
  };

  // Debounce tìm kiếm theo tên/tác giả 400ms
  useEffect(() => {
    const h = setTimeout(() => { loadBooks(); }, 400);
    return () => clearTimeout(h);
  }, [filterTitle, filterAuthor]);

  // Tính dữ liệu sau lọc + phân trang
  const filtered = (filterCategory==='ALL' ? books : books.filter(b=>b.category?.id===filterCategory))
    .filter(b => {
      const t = filterTitle.trim().toLowerCase();
      const a = filterAuthor.trim().toLowerCase();
      const okTitle = !t || b.title.toLowerCase().includes(t);
      const okAuthor = !a || (b.author ?? '').toLowerCase().includes(a);
      return okTitle && okAuthor;
    })
    .sort((x,y)=>{
      const dir = sortDir === 'asc' ? 1 : -1;
      const ax = (x[sortKey] ?? '').toString().toLowerCase();
      const ay = (y[sortKey] ?? '').toString().toLowerCase();
      if(ax < ay) return -1*dir; if(ax > ay) return 1*dir; return 0;
    });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageData = filtered.slice(start, end);

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => { setPage(1); }, [filterTitle, filterAuthor, filterCategory, pageSize]);

  return (
    <div className="container py-3">
  <h2 className="mb-4">Sách trong thư viện</h2>

      {/* Bộ lọc */}
      <div className="panel mb-3">
        <div className="panel__header d-flex align-items-center justify-content-between">
          <span>Tìm kiếm</span>
        </div>
        <div className="p-3">
          <div className="row g-2 align-items-end">
      <div className="col-md-4">
              <label className="form-label">Tên sách</label>
              <input
                placeholder="Nhập tên sách"
                className="form-control"
  value={filterTitle}
  onChange={e => { setFilterTitle(e.target.value); }}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Tác giả</label>
              <input
                placeholder="Nhập tên tác giả"
                className="form-control"
  value={filterAuthor}
  onChange={e => { setFilterAuthor(e.target.value); }}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Thể loại</label>
              <select
                className="form-select"
                value={filterCategory}
  onChange={e => { setFilterCategory(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)); loadBooks(); }} // chuyển về number hoặc 'ALL'
              >
                <option value="ALL">Tất cả thể loại</option>
                {Array.from(new Set(books.filter(b=>b.category?.name).map(b=>b.category!.id))).map(cid => {
                  const name = books.find(b=>b.category?.id===cid)?.category?.name || cid;
                  return <option key={cid} value={cid}>{name}</option>;
                })}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="row g-3">
          {Array.from({length: pageSize}).map((_,i)=> (
            <div key={i} className="col-md-6 col-lg-4">
              <div className="card skeleton-card">
                <div className="skeleton skeleton-img" />
                <div className="card-body">
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-text short" />
                  <div className="skeleton skeleton-text" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ErrorAlert error={error} />

      {/* Danh sách sách với phân trang */}
      <div className="row g-3">
        {pageData.map(book => (
          <div key={book.id} className="col-md-6 col-lg-4">
            <div className="card h-100 book-card">
              <div className="thumb-wrap">
                {book.imageUrl ? (
                  <img src={book.imageUrl} alt={book.title} className="card-img-top" style={{ objectFit: 'cover', maxHeight: 180 }} />
                ) : (
                  <div className="thumb-placeholder">Không có ảnh</div>
                )}
              </div>
              <div className="card-body">
                <h5 className="card-title">{book.title}</h5>
                <p className="card-text text-muted mb-2">
                  <small> Tác giả: {book.author}</small>
                </p>
                <p className="card-text text-muted mb-2">
                  <small> Mã: {book.code}</small>
                </p>
                {book.category?.name && (
                  <div className="mb-2">
                    <span className="badge bg-primary-soft">{book.category?.name}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    {book.stock === 0 ? (
                      <span className="badge bg-secondary">Hết hàng</span>
                    ) : book.stock <= 5 ? (
                      <span className="badge bg-warning text-dark">Còn {book.stock}</span>
                    ) : (
                      <span className="badge bg-success">Còn {book.stock}</span>
                    )}
                  </span>
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setDetailBook(book)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Điều hướng phân trang */}
      <div className="d-flex align-items-center justify-content-between mt-3">
        <div className="d-flex align-items-center gap-2">
          <label className="form-label mb-0">Hiển thị mỗi trang:</label>
          <select className="form-select" style={{width: 100}} value={pageSize} onChange={e=>setPageSize(Number(e.target.value))}>
            <option value={3}>3</option>
            <option value={6}>6</option>
            <option value={9}>9</option>
          </select>
        </div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" onClick={()=>setPage(1)} disabled={page===1}>Đầu</button>
          <button className="btn btn-outline-secondary" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Trước</button>
          <span className="btn btn-light">{page} / {totalPages}</span>
          <button className="btn btn-outline-secondary" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Sau</button>
          <button className="btn btn-outline-secondary" onClick={()=>setPage(totalPages)} disabled={page===totalPages}>Cuối</button>
        </div>
      </div>

      {books.length === 0 && !loading && (
        <div className="text-center text-muted py-5">
          Không tìm thấy sách nào
        </div>
      )}

      {/* Modal chi tiết sách */}
      {detailBook && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{detailBook.title}</h5>
                <button className="btn-close" onClick={()=>setDetailBook(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    {detailBook.imageUrl ? (
                      <img src={detailBook.imageUrl} alt={detailBook.title} className="img-fluid rounded" />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center" style={{height:200}}>Không có ảnh</div>
                    )}
                  </div>
                  <div className="col-md-8">
                    <p><strong>Tác giả:</strong> {detailBook.author || '-'}</p>
                    <p><strong>Thể loại:</strong> {detailBook.category?.name || '-'}</p>
                    <p><strong>Năm xuất bản:</strong> {/* nếu có metadata năm */}-</p>
                    <p><strong>Mô tả:</strong> {/* nếu có mô tả */}Không có mô tả</p>
                    <p>
                      <strong>Số lượng còn lại:</strong> {detailBook.stock}
                      {detailBook.stock === 0 && <span className="ms-2 badge bg-secondary">Hết hàng</span>}
                    </p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={()=>setDetailBook(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
