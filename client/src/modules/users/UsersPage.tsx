// Trang quản lý người dùng.
// BACKEND cần: /api/users (GET danh sách), /api/users/{id} (DELETE).
// TODO BACKEND mở rộng: POST /api/users (tạo), PUT /api/users/{id} (cập nhật), thay đổi mật khẩu, phân quyền.
import React, { useEffect, useState } from 'react';
import { userApi, UserDTO } from '../../api/userApi';
import axiosClient from '../../api/axiosClient';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export default function UsersPage(){
  const [items, setItems] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|undefined>();
  const [creating, setCreating] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'USER'|'LIBRARIAN'>('USER');

  // Load danh sách người dùng từ BACKEND
  const load = async () => {
    setLoading(true); setError(undefined);
    try { const data = await userApi.list(); setItems(data); } catch(e:any){ setError(e.message || 'Lỗi tải dữ liệu'); } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  // Xóa người dùng -> DELETE BACKEND
  const remove = async (id: number) => {
    if(!window.confirm('Xóa người dùng?')) return;
    try { await userApi.remove(id); setItems(items.filter(i=>i.id!==id)); } catch(e:any){ alert('Xóa thất bại: '+(e.message||'')); }
  };

  return (
    <div>
      <h2>Danh sách tài khoản trong hệ thống</h2>
  {error && <ErrorAlert error={error} />}
      {loading && <Spinner />}
      {/* Form tạo tài khoản mới (ADMIN) */}
      <div className="card p-3 mt-3">
        <h5>Tạo tài khoản mới</h5>
        <div className="row g-2">
          <div className="col-md-4">
            <input className="form-control" placeholder="Tên đăng nhập" value={newUsername} onChange={e=>setNewUsername(e.target.value)} />
          </div>
          <div className="col-md-4">
            <input type="password" className="form-control" placeholder="Mật khẩu" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={newRole} onChange={e=>setNewRole(e.target.value as any)}>
              <option value="USER">USER</option>
              <option value="LIBRARIAN">LIBRARIAN</option>
            </select>
          </div>
          <div className="col-md-1 d-grid">
            <button className="btn btn-primary" disabled={creating} onClick={async ()=>{
              if(!newUsername || !newPassword){ alert('Nhập đầy đủ tên đăng nhập và mật khẩu'); return; }
              setCreating(true);
              try{
                await axiosClient.post('/auth/admin/create-user', { username: newUsername, password: newPassword, role: newRole });
                setNewUsername(''); setNewPassword(''); setNewRole('USER');
                await load();
              }catch(e:any){ alert(e?.message || 'Tạo tài khoản thất bại'); }
              finally{ setCreating(false); }
            }}>{creating ? 'Đang tạo...' : 'Tạo'}</button>
          </div>
        </div>
      </div>
      {!loading && (
        <div className="table-wrap mt-3">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Id</th>
                <th>Tên đăng nhập</th>
                <th>Vai trò</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map(u=> (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.roles?.join(', ')}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(u.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
