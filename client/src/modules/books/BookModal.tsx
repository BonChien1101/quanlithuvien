// Modal thêm / sửa sách.
// BACKEND phụ thuộc các endpoint /api/books (POST) và /api/books/{id} (PUT).
// Component này chỉ thu thập dữ liệu, việc gọi API thực hiện ở bên ngoài (BookList).
import React, { useEffect, useRef } from 'react';
import { BookDTO } from '../../api/bookApi';
import { categoryApi, Category } from '../../api/categoryApi';

interface Props {
  open: boolean;
  initial?: Partial<BookDTO>;
  onClose: () => void;
  onSubmit: (data: { code: string; title: string; author: string; imageUrl?: string; stock: number; categoryId?: number }, editingId?: number) => void;
}

export default function BookModal({ open, initial, onClose, onSubmit }: Props){
  const dialogRef = useRef<HTMLDialogElement|null>(null);
  const [code, setCode] = React.useState(initial?.code||'');
  const [title, setTitle] = React.useState(initial?.title||'');
  const [author, setAuthor] = React.useState(initial?.author||'');
  const [stock, setStock] = React.useState<number>(initial?.stock||0);
  const [imageUrl, setImageUrl] = React.useState<string>(initial?.imageUrl||'');
  const [categoryId, setCategoryId] = React.useState<number|undefined>(initial?.category?.id);
  const [categories, setCategories] = React.useState<Category[]>([]);

  // Reset form khi props initial thay đổi (chuyển chế độ thêm -> sửa)
  useEffect(()=>{
    setCode(initial?.code||'');
    setTitle(initial?.title||'');
    setAuthor(initial?.author||'');
  setStock(initial?.stock||0);
  setImageUrl(initial?.imageUrl||'');
  setCategoryId(initial?.category?.id);
  },[initial]);

  // Đồng bộ trạng thái mở / đóng với thẻ <dialog>
  useEffect(()=>{
    const el = dialogRef.current;
    if(!el) return;
    try {
      if(open && !el.open){ el.showModal(); }
      else if(!open && el.open){ el.close(); }
    } catch(err){
      console.error('Dialog showModal error', err);
    }
  },[open]);

  // Load categories when modal opens
  useEffect(()=>{
    (async ()=>{
      if(open){
        try {
          const data = await categoryApi.list();
          setCategories(data);
        } catch(e){ /* ignore for modal */ }
      }
    })();
  },[open]);

  // Đóng modal khi nhấn ESC hoặc click ra ngoài vùng nội dung
  useEffect(()=>{
    const handleKey = (e: KeyboardEvent) => { if(e.key==='Escape') onClose(); };
    const handleClick = (e: MouseEvent) => {
      const el = dialogRef.current; if(!el) return;
      if(el.open && e.target === el) onClose();
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('click', handleClick);
    return ()=>{ window.removeEventListener('keydown', handleKey); window.removeEventListener('click', handleClick); };
  },[onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
  onSubmit({ code, title, author, imageUrl, stock, categoryId }, initial?.id);
  };

  return (
    <dialog ref={dialogRef} className="app-dialog" aria-labelledby="bookModalTitle" role="dialog" open={open}>
      <form onSubmit={submit} method="dialog">
        <h5 id="bookModalTitle" className="mb-3">{initial?.id ? 'Cập nhật sách' : 'Thêm sách mới'}</h5>
        <div className="mb-2"><input required placeholder="Mã" className="form-control" value={code} onChange={e=>setCode(e.target.value)} /></div>
        <div className="mb-2"><input required placeholder="Tiêu đề" className="form-control" value={title} onChange={e=>setTitle(e.target.value)} /></div>
  <div className="mb-2"><input required placeholder="Tác giả" className="form-control" value={author} onChange={e=>setAuthor(e.target.value)} /></div>
  <div className="mb-2"><input placeholder="Ảnh bìa (URL)" className="form-control" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} /></div>
        <div className="mb-3"><input type="number" min={0} placeholder="Tồn kho" className="form-control" value={stock} onChange={e=>setStock(parseInt(e.target.value||'0'))} /></div>
        <div className="mb-3">
          <select required className="form-select" value={categoryId||''} onChange={e=>setCategoryId(parseInt(e.target.value))}>
            <option value="">-- Thể loại --</option>
            {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="d-flex gap-2 justify-content-end">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!code || !title || !author || (categoryId===undefined) || categoryId===0 || stock<0}
          >
            {initial?.id ? 'Lưu' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
