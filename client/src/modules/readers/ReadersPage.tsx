import React, { useEffect, useState } from 'react';
import { readerApi, ReaderDTO, NewReaderPayload } from '../../api/readerApi';
import { loanApi } from '../../api/loanApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { selectToken, selectRoles } from '../../features/appSlice';
import { useAppSelector } from '../../store';

type Reader = ReaderDTO;

export default function ReadersPage(){
  const token = useAppSelector(selectToken);
  const roles = useAppSelector(selectRoles);
  const [data, setData] = useState<Reader[]>([]);
  const [qId, setQId] = useState('');
  const [qName, setQName] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [form, setForm] = useState<NewReaderPayload>({ name: '', quota: 3 });
  const [editing, setEditing] = useState<Reader|undefined>();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();
  const [viewReader, setViewReader] = useState<ReaderDTO|null>(null);
  const [viewLoans, setViewLoans] = useState<any[]>([]);
  // Trang quản lý độc giả: hiển thị danh sách, thêm/sửa/xóa

  const load = async () => {
    setLoading(true);
    try {
  const axios = (await import('../../api/axiosClient')).default;
  const keyword = qName ? qName : undefined;
  const rs = await axios.get('/api/readers', { params: { page, limit, q: keyword } });
  let list = Array.isArray(rs.data) ? rs.data : (rs.data?.items ?? []);
  // Lọc theo ID nếu có
  const idVal = qId.trim();
  if (idVal) {
    const idNum = parseInt(idVal, 10);
    if (Number.isInteger(idNum)) {
      list = list.filter((r:any)=> r.id === idNum);
    }
  }
  setData(list);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, [token, page, qName, qId]);
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

  const openView = async (reader: ReaderDTO) => {
    setViewReader(reader);
    try {
      const loans = await loanApi.list();
      setViewLoans(loans.filter((l:any)=> l.reader?.id === reader.id));
    } catch(e:any){ /* ignore */ }
  };

  return <div className="container py-3">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="m-0">Độc giả</h2>
      <button className="btn btn-primary" onClick={()=>{ setEditing(undefined); setForm({ name: '', quota: 5 }); setShowModal(true); }}>
        Thêm mới
      </button>
    </div>

    <div className="card">
      <div className="card-body p-0">
  {loading && <Spinner/>}
  <ErrorAlert error={error} />
    <div className="table-wrap">
      <div className="row g-2 p-2">
        <div className="col-auto" style={{minWidth: 160}}>
          <input className="form-control form-control-sm" placeholder="ID độc giả" value={qId} onChange={e=>{ setQId(e.target.value); setPage(1); }} />
        </div>
        <div className="col">
          <input className="form-control form-control-sm" placeholder="Tên độc giả" value={qName} onChange={e=>{ setQName(e.target.value); setPage(1); }} />
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
              <button className="btn btn-sm btn-outline-info" onClick={()=>openView(r)}>Xem</button>
              <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(r)}>Sửa</button>
              {roles.includes('ADMIN') && (
                <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(r.id)}>Xóa</button>
              )}
              
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
    {viewReader && (
        <div className="modal d-block" tabIndex={-1} style={{background:'rgba(0,0,0,0.3)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thông tin độc giả</h5>
                <button type="button" className="btn-close" onClick={()=>{ setViewReader(null); setViewLoans([]); }}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-3"><div className="text-muted small">ID</div><div className="fw-bold">{viewReader.id}</div></div>
                  <div className="col-md-3"><div className="text-muted small">Tên</div><div className="fw-bold">{viewReader.name}</div></div>
                  <div className="col-md-3"><div className="text-muted small">SĐT</div><div className="fw-bold">{viewReader.phone || '—'}</div></div>
                  <div className="col-md-3"><div className="text-muted small">Email</div><div className="fw-bold">{viewReader.email || '—'}</div></div>
                  <div className="col-md-3"><div className="text-muted small">Giới tính</div><div className="fw-bold">{viewReader.gender === 'male' ? 'Nam' : viewReader.gender === 'female' ? 'Nữ' : viewReader.gender ? 'Khác' : '—'}</div></div>
                  <div className="col-md-3"><div className="text-muted small">Ngày sinh</div><div className="fw-bold">{viewReader.dob ? new Date(viewReader.dob).toLocaleDateString() : '—'}</div></div>
                  <div className="col-md-3"><div className="text-muted small">Địa chỉ</div><div className="fw-bold">{viewReader.address || '—'}</div></div>
                  <div className="col-md-3"><div className="text-muted small">Quota</div><div className="fw-bold">{viewReader.quota}</div></div>
                  <div className="col-md-3"><div className="text-muted small">Tạo lúc</div><div className="fw-bold">{(viewReader as any).createdAt ? new Date((viewReader as any).createdAt).toLocaleString('vi-VN') : '—'}</div></div>
                  <div className="col-md-3"><div className="text-muted small">Cập nhật lúc</div><div className="fw-bold">{(viewReader as any).updatedAt ? new Date((viewReader as any).updatedAt).toLocaleString('vi-VN') : '—'}</div></div>
                  <div className="col-12"><div className="text-muted small">Ghi chú</div><div className="fw-bold">{viewReader.note || '—'}</div></div>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="panel">
                      <div className="panel__header">Chưa trả quá hạn</div>
                      <div className="d-flex justify-content-between align-items-center px-2 pb-2">
                        <span className="text-muted small">Tổng</span>
                        <span className="badge bg-danger">{viewLoans.filter((l:any)=> !l.returnedAt && l.dueAt && new Date(l.dueAt).getTime() < Date.now()).length}</span>
                      </div>
                      <table className="table table-sm">
                        <thead><tr><th>ID</th><th>Sách</th><th>Mượn</th><th>Hạn</th></tr></thead>
                        <tbody>
                          {[...viewLoans]
                            .filter((l:any)=> !l.returnedAt && l.dueAt && new Date(l.dueAt).getTime() < Date.now())
                            .sort((a:any,b:any)=> new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime())
                            .slice(0,5)
                            .map((l:any)=> (
                              <tr key={l.id}>
                                <td>{l.id}</td>
                                <td>{l.book?.title}</td>
                                <td>{l.borrowedAt ? new Date(l.borrowedAt).toLocaleDateString() : ''}</td>
                                <td className="text-danger fw-bold">{l.dueAt ? new Date(l.dueAt).toLocaleDateString() : ''}</td>
                              </tr>
                            ))}
                          {viewLoans.filter((l:any)=> !l.returnedAt && l.dueAt && new Date(l.dueAt).getTime() < Date.now()).length===0 && (
                            <tr><td colSpan={4} className="text-center text-muted">— Không có dữ liệu —</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="panel">
                      <div className="panel__header">Đã trả trễ</div>
                      <div className="d-flex justify-content-between align-items-center px-2 pb-2">
                        <span className="text-muted small">Tổng</span>
                        <span className="badge bg-warning text-dark">{viewLoans.filter((l:any)=> !!l.returnedAt && !!l.dueAt && new Date(l.returnedAt).getTime() > new Date(l.dueAt).getTime()).length}</span>
                      </div>
                      <table className="table table-sm">
                        <thead><tr><th>ID</th><th>Sách</th><th>Mượn</th><th>Trả</th></tr></thead>
                        <tbody>
                          {[...viewLoans]
                            .filter((l:any)=> !!l.returnedAt && !!l.dueAt && new Date(l.returnedAt).getTime() > new Date(l.dueAt).getTime())
                            .sort((a:any,b:any)=> new Date(b.returnedAt).getTime() - new Date(a.returnedAt).getTime())
                            .slice(0,5)
                            .map((l:any)=> (
                              <tr key={l.id}>
                                <td>{l.id}</td>
                                <td>{l.book?.title}</td>
                                <td>{l.borrowedAt ? new Date(l.borrowedAt).toLocaleDateString() : ''}</td>
                                <td className="text-warning fw-bold">{l.returnedAt ? new Date(l.returnedAt).toLocaleDateString() : ''}</td>
                              </tr>
                            ))}
                          {viewLoans.filter((l:any)=> !!l.returnedAt && !!l.dueAt && new Date(l.returnedAt).getTime() > new Date(l.dueAt).getTime()).length===0 && (
                            <tr><td colSpan={4} className="text-center text-muted">— Không có dữ liệu —</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                {/* Lịch sử mượn gần đây */}
                <div className="panel mt-3">
                  <div className="panel__header">Lịch sử mượn gần đây</div>
                  <table className="table table-sm">
                    <thead><tr><th>ID</th><th>Sách</th><th>Mượn lúc</th><th>Trả lúc</th></tr></thead>
                    <tbody>
                      {[...viewLoans]
                        .sort((a:any,b:any)=>new Date(b.borrowedAt).getTime()-new Date(a.borrowedAt).getTime())
                        .slice(0,5)
                        .map((l:any)=> (
                          <tr key={l.id}>
                            <td>{l.id}</td>
                            <td>{l.book?.title}</td>
                            <td>{l.borrowedAt ? new Date(l.borrowedAt).toLocaleString() : ''}</td>
                            <td>{l.returnedAt ? new Date(l.returnedAt).toLocaleString() : 'Chưa trả'}</td>
                          </tr>
                        ))}
                      {viewLoans.length===0 && (
                        <tr><td colSpan={4} className="text-center text-muted">— Không có dữ liệu —</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>{ setViewReader(null); setViewLoans([]); }}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
  </div>
</div>;
}