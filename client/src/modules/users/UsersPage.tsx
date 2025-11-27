// Trang quản lý người dùng.
// BACKEND cần: /api/users (GET danh sách), /api/users/{id} (DELETE).
// TODO BACKEND mở rộng: POST /api/users (tạo), PUT /api/users/{id} (cập nhật), thay đổi mật khẩu, phân quyền.
import React, { useEffect, useState } from 'react';
import { userApi, UserDTO } from '../../api/userApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export default function UsersPage(){
  const [items, setItems] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|undefined>();

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
