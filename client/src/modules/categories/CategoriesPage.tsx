import React, { useEffect, useState } from 'react';
import { categoryApi, Category } from '../../api/categoryApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export default function CategoriesPage(){
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Category|undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  const load = async () => {
    setLoading(true); setError(undefined);
    try { const data = await categoryApi.list(); setItems(data); }
    catch(e:any){ setError(e?.message || 'Lỗi tải danh mục'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

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
        <table className="table table-striped">
          <thead><tr><th>STT</th><th>Mã</th><th>Tên</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
          <tbody>
            {items.map((c, index)=> (
              <tr key={c.id} className={c.hidden ? 'table-secondary text-muted' : ''}>
                <td>{index + 1}</td>
                <td>{c.id}</td>
                <td>{c.name}</td>
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
      </div>
    </div>
  );
}
