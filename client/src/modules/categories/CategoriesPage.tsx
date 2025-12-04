import React, { useEffect, useState } from 'react';
import { categoryApi, Category } from '../../api/categoryApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export default function CategoriesPage(){
  const [items, setItems] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [qName, setQName] = useState('');
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Category|undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  const load = async () => {
    setLoading(true); setError(undefined);
    try {
      const axios = (await import('../../api/axiosClient')).default;
  const rs = await axios.get('/api/categories', { params: { page, limit, q: qName || undefined } });
      const data = Array.isArray(rs.data) ? rs.data : (rs.data?.items ?? []);
      setItems(data);
    }
    catch(e:any){ setError(e?.message || 'Lỗi tải danh mục'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[page, qName, limit]);
  useEffect(()=>{ setPage(1); }, [limit]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if(!name.trim()) return;
    try {
      setError(undefined);
      if(editing?.id){ await categoryApi.update(editing.id, { name }); }
      else { await categoryApi.create({ name }); }
      setName(''); setEditing(undefined); load();
    } catch(e:any){ setError(e?.message || 'Lỗi lưu danh mục'); }
  };

  const startEdit = (c: Category) => { setEditing(c); setName(c.name); };
  const toggle = async (id: number) => { try { await categoryApi.toggle(id); load(); } catch(e:any){ setError(e?.message||'Lỗi cập nhật'); } };
  const remove = async (id: number) => { if(!window.confirm('Xóa danh mục?')) return; try { await categoryApi.remove(id); load(); } catch(e:any){ setError(e?.message || 'Lỗi xóa'); } };

  return (
    <div className="container py-3">
      <div className="page-header"><h2>Danh mục thể loại</h2></div>
      <form className="row g-2" onSubmit={submit}>
        <div className="col-auto"><input className="form-control" value={name} onChange={e=>setName(e.target.value)} placeholder="Tên danh mục"/></div>
        <div className="col-auto"><button className="btn btn-primary" disabled={!name}>{editing?'Cập nhật':'Thêm'}</button></div>
        {editing && <div className="col-auto"><button type="button" className="btn btn-secondary" onClick={()=>{ setEditing(undefined); setName(''); }}>Hủy</button></div>}
      </form>
      {loading && <Spinner/>}
      <ErrorAlert error={error} />
      <div className="table-wrap mt-3">
        <div className="row g-2 mb-2">
          <div className="col">
            <input className="form-control form-control-sm" placeholder="Tìm theo tên danh mục" value={qName} onChange={e=>{ setQName(e.target.value); setPage(1); }} />
          </div>
        </div>
        <table className="table table-striped">
          <thead><tr><th>Mã</th><th>Tên</th><th>Số sách</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
          <tbody>
            {items
              .filter(c => !qName ? true : (c.name||'').toLowerCase().includes(qName.toLowerCase()))
              .map((c)=> (
              <tr key={c.id} className={c.hidden ? 'table-secondary text-muted' : ''}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.bookCount ?? 0}</td>
                <td>
                  {c.hidden ? (
                    <span className="badge bg-secondary">Đã ẩn</span>
                  ) : (
                    <span className="badge bg-success">Hiển thị</span>
                  )}
                </td>
                <td className="d-flex gap-1">
                  <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(c)}>Sửa</button>
                  <button 
                    className={`btn btn-sm ${c.hidden ? 'btn-success' : 'btn-outline-warning'}`}
                    onClick={()=>toggle(c.id!)}
                    title={c.hidden ? 'Hiện danh mục' : 'Ẩn danh mục'}
                  >
                    {c.hidden ? 'Hiện' : 'Ẩn'}
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(c.id!)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ if(page>1){ setPage(p=>p-1); } }} disabled={page<=1}>Trước</button>
            <span>Trang {page}</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ setPage(p=>p+1); }} disabled={items.filter(c => !qName ? true : (c.name||'').toLowerCase().includes(qName.toLowerCase())).length < limit}>
              Sau
            </button>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span>Hiện thị</span>
            <select className="form-select form-select-sm" style={{width:'auto'}} value={limit} onChange={e=>setLimit(parseInt(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
