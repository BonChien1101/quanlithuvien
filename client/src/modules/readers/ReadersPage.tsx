import React, { useEffect, useState } from 'react';
import { readerApi, ReaderDTO } from '../../api/readerApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { selectToken } from '../../features/appSlice';
import { useAppSelector } from '../../store';

type Reader = ReaderDTO;

export default function ReadersPage(){
  const token = useAppSelector(selectToken);
  const [data, setData] = useState<Reader[]>([]);
  const [name, setName] = useState('');
  const [quota, setQuota] = useState(5);
  const [editing, setEditing] = useState<Reader|undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  const load = async () => {
    setLoading(true);
    try {
  const rs = await readerApi.list();
  setData(rs);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!name.trim()) return;
  try {
    setError(undefined);
    if(editing){
      await readerApi.update(editing.id, { name, email: editing.email, quota });
    } else {
      await readerApi.create({ name, email: '', quota });
    }
  } catch(e:any){ setError(e?.message || 'Lỗi tạo bạn đọc'); }
    setName('');
    setQuota(5);
    setEditing(undefined);
    load();
  };

  const startEdit = (r: Reader) => { setEditing(r); setName(r.name); setQuota(r.quota); };
  const remove = async (id: number) => { if(!window.confirm('Xóa bạn đọc?')) return; try { await readerApi.remove(id); load(); } catch(e:any){ setError(e?.message || 'Lỗi xóa bạn đọc'); } };

  return <div className="container py-3">
    <h3>Quản lý bạn đọc</h3>
    <form className="row g-2" onSubmit={submit}>
      <div className="col-auto"><input className="form-control" value={name} onChange={e=>setName(e.target.value)} placeholder="Tên bạn đọc"/></div>
      <div className="col-auto"><input type="number" className="form-control" value={quota} onChange={e=>setQuota(parseInt(e.target.value||'0'))} placeholder="Quota"/></div>
      <div className="col-auto"><button className="btn btn-primary" disabled={!name}>{editing?'Cập nhật':'Thêm'}</button></div>
      {editing && <div className="col-auto"><button type="button" className="btn btn-secondary" onClick={()=>{setEditing(undefined);setName('');setQuota(5);}}>Hủy</button></div>}
    </form>
    <hr/>
  {loading && <Spinner/>}
  <ErrorAlert error={error} />
    <table className="table table-sm">
      <thead><tr><th>ID</th><th>Tên</th><th>Quota</th><th>Hành động</th></tr></thead>
      <tbody>
        {data.map(r=> <tr key={r.id}><td>{r.id}</td><td>{r.name}</td><td>{r.quota}</td><td className="d-flex gap-1"><button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(r)}>Sửa</button><button className="btn btn-sm btn-outline-danger" onClick={()=>remove(r.id)}>Xóa</button></td></tr>)}
      </tbody>
    </table>
  </div>;
}
