import React, { useEffect, useState } from 'react';
import { readerApi, ReaderDTO, NewReaderPayload } from '../../api/readerApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { selectToken } from '../../features/appSlice';
import { useAppSelector } from '../../store';

type Reader = ReaderDTO;

export default function ReadersPage(){
  const token = useAppSelector(selectToken);
  const [data, setData] = useState<Reader[]>([]);
  const [qName, setQName] = useState('');
  const [qPhone, setQPhone] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form, setForm] = useState<NewReaderPayload>({ name: '', quota: 3 });
  const [editing, setEditing] = useState<Reader|undefined>();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();
  // Trang quản lý độc giả: hiển thị danh sách, thêm/sửa/xóa

  const load = async () => {
    setLoading(true);
    try {
  const axios = (await import('../../api/axiosClient')).default;
  const keyword = (qName || qPhone) ? (qName || qPhone) : undefined;
  const rs = await axios.get('/api/readers', { params: { page, limit, q: keyword } });
  let list = Array.isArray(rs.data) ? rs.data : (rs.data?.items ?? []);
  if (qName && qPhone) {
    const phoneKey = qPhone.toLowerCase();
    list = list.filter((r:any)=> String(r.phone||'').toLowerCase().includes(phoneKey));
  }
  setData(list);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, [token, page, qName]);
  useEffect(()=>{ load(); }, [token, page, qPhone]);
  useEffect(()=>{ setPage(1); }, [limit]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.name.trim()) { setError('Vui lòng nhập tên độc giả'); return; }
    if((form.quota ?? 0) < 0) { setError('Quota không hợp lệ'); return; }
    try {
      setError(undefined);
      if(editing){
        await readerApi.update(editing.id, form);
      } else {
        await readerApi.create(form);
      }
      setShowModal(false);
    } catch(e:any){ setError(e?.message || 'Lỗi lưu độc giả'); }
  setForm({ name: '', quota: 3 });
    setEditing(undefined);
    load();
  };

  const startEdit = (r: Reader) => {
    setEditing(r);
  setForm({
      name: r.name,
      phone: (r as any).phone || '',
      email: (r as any).email || '',
      gender: (r as any).gender || undefined,
      dob: (r as any).dob || undefined,
      address: (r as any).address || '',
      note: (r as any).note || '',
      quota: r.quota,
    });
    setShowModal(true);
  };
  const remove = async (id: number) => { if(!window.confirm('Xóa bạn đọc?')) return; try { await readerApi.remove(id); load(); } catch(e:any){ setError(e?.message || 'Lỗi xóa bạn đọc'); } };

  return <div className="container py-3">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="m-0">Độc giả</h2>
      <button className="btn btn-primary" onClick={()=>{ setEditing(undefined); setForm({ name: '', quota: 3 }); setShowModal(true); }}>
        Thêm mới
      </button>
    </div>

    <div className="card">
      <div className="card-body p-0">
  {loading && <Spinner/>}
  <ErrorAlert error={error} />
    <div className="table-wrap">
      <div className="row g-2 p-2">
        <div className="col">
          <input className="form-control form-control-sm" placeholder="Tên độc giả" value={qName} onChange={e=>{ setQName(e.target.value); setPage(1); }} />
        </div>
        <div className="col">
          <input className="form-control form-control-sm" placeholder="SĐT" value={qPhone} onChange={e=>{ setQPhone(e.target.value); setPage(1); }} />
        </div>
      </div>
      <div className="table-responsive">
      <table className="table table-sm align-middle mb-0">
  <thead><tr><th>Mã</th><th>Tên</th><th>SĐT</th><th>Email</th><th>Giới tính</th><th>Ngày sinh</th><th>Quota</th><th>Thao tác</th></tr></thead>
        <tbody>
          {data.map((r)=> <tr key={r.id}>
            <td>{r.id}</td>
            <td>{r.name}</td>
            <td>{(r as any).phone || '-'}</td>
            <td>{(r as any).email || '-'}</td>
            <td>{(r as any).gender ? ({ male: 'Nam', female: 'Nữ', other: 'Khác' } as any)[(r as any).gender] : '-'}</td>
            <td>{(r as any).dob ? new Date((r as any).dob).toLocaleDateString('vi-VN') : '-'}</td>
            <td>{r.quota}</td>
            <td className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(r)}>Sửa</button>
              <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(r.id)}>Xóa</button>
            </td>
          </tr>)}
        </tbody>
      </table>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-2">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ if(page>1){ setPage(p=>p-1); } }} disabled={page<=1}>Trước</button>
          <span>Trang {page}</span>
          <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ setPage(p=>p+1); }} disabled={data.length < limit}>Sau</button>
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
    {showModal && (
      <div className="modal d-block" tabIndex={-1}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editing ? 'Cập nhật độc giả' : 'Thêm độc giả'}</h5>
              <button type="button" className="btn-close" onClick={()=>{ setShowModal(false); setEditing(undefined); }}></button>
            </div>
            <form onSubmit={submit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Tên độc giả</label>
                    <input className="form-control" value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} required/>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Số điện thoại</label>
                    <input className="form-control" value={form.phone || ''} onChange={e=>setForm({ ...form, phone: e.target.value })}/>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.email || ''} onChange={e=>setForm({ ...form, email: e.target.value })}/>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Giới tính</label>
                    <select className="form-select" value={form.gender || ''} onChange={e=>setForm({ ...form, gender: (e.target.value || undefined) as any })}>
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Ngày sinh</label>
                    <input type="date" className="form-control" value={form.dob || ''} onChange={e=>setForm({ ...form, dob: e.target.value })}/>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Quota</label>
                    <input type="number" min={0} className="form-control" value={form.quota} onChange={e=>setForm({ ...form, quota: parseInt(e.target.value || '0') })}/>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Địa chỉ</label>
                    <input className="form-control" value={form.address || ''} onChange={e=>setForm({ ...form, address: e.target.value })}/>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Ghi chú</label>
                    <textarea className="form-control" value={form.note || ''} onChange={e=>setForm({ ...form, note: e.target.value })} rows={2}></textarea>
                  </div>
                </div>
                <ErrorAlert error={error} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>{ setShowModal(false); setEditing(undefined); }}>Đóng</button>
                <button className="btn btn-primary" disabled={!form.name || loading}>{editing ? 'Cập nhật' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
  </div>
</div>;
}