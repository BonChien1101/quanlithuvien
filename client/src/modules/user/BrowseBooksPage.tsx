import React, { useEffect, useState } from 'react';
import { bookApi, BookDTO } from '../../api/bookApi';
import { myLibraryApi } from '../../api/myLibraryApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export default function BrowseBooksPage() {
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [borrowing, setBorrowing] = useState<number | null>(null);

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
      // Chỉ hiển thị sách không bị ẩn
      setBooks(data.filter(b => !b.hidden));
    } catch (e: any) {
      setError(e?.message || 'Lỗi tải sách');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId: number) => {
    if (!window.confirm('Bạn có muốn mượn sách này không?')) return;
    
    setBorrowing(bookId);
    setError(undefined);
    
    try {
      // Tự động set hạn trả sau 14 ngày
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      
      const result = await myLibraryApi.requestBorrow(bookId, dueDate);
      alert(result.message || 'Đặt mượn thành công!');
      loadBooks(); // Reload để cập nhật số lượng
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Lỗi đặt mượn sách');
    } finally {
      setBorrowing(null);
    }
  };

  return (
    <div className="container py-3">
      <h2 className="mb-4">📖 Danh sách sách</h2>

      {/* Bộ lọc */}
      <div className="panel mb-3">
        <div className="panel__header">Tìm kiếm sách</div>
        <div className="p-3">
          <div className="row g-2">
            <div className="col-md-4">
              <input
                placeholder="Tìm theo tên sách"
                className="form-control"
                value={filterTitle}
                onChange={e => setFilterTitle(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <input
                placeholder="Tìm theo tác giả"
                className="form-control"
                value={filterAuthor}
                onChange={e => setFilterAuthor(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100" onClick={loadBooks}>
                🔍 Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && <Spinner />}
      <ErrorAlert error={error} />

      {/* Danh sách sách */}
      <div className="row g-3">
        {books.map(book => (
          <div key={book.id} className="col-md-6 col-lg-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{book.title}</h5>
                <p className="card-text text-muted mb-2">
                  <small>📝 Tác giả: {book.author}</small>
                </p>
                <p className="card-text text-muted mb-2">
                  <small>🔖 Mã: {book.code}</small>
                </p>
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
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleBorrow(book.id)}
                    disabled={book.stock === 0 || borrowing === book.id}
                  >
                    {borrowing === book.id ? 'Đang xử lý...' : '📚 Mượn sách'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && !loading && (
        <div className="text-center text-muted py-5">
          Không tìm thấy sách nào
        </div>
      )}
    </div>
  );
}
