import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAppDispatch } from '../store';
import { setAuth } from '../features/appSlice';
import { parseJwt } from '../utils/jwt';

export default function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Hàm đăng nhập nhanh với tài khoản mẫu
  const quickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
      try {
      console.log('Logging in...', {username, password});
      const res = await authApi.login({username, password});
      console.log('Login response:', res);
      const tokenValue = res.token;
      localStorage.setItem('auth_token', tokenValue);
      // Prefer roles returned by API; fall back to roles embedded in JWT
      const parsed = parseJwt(tokenValue) as any;
      let assignedRoles: string[] = (res as any).roles || parsed?.roles || [];
      // Parse roles if it's a JSON string
      if (typeof assignedRoles === 'string') {
        assignedRoles = JSON.parse(assignedRoles);
      }
      console.log('Assigned roles:', assignedRoles);
        dispatch(setAuth({ token: tokenValue, roles: assignedRoles }));
      // Điều hướng: nếu là USER  -> /borrow, ngược lại về /
      const isManager = assignedRoles.some((r)=>['ADMIN'].includes(r));
      console.log('Is manager:', isManager, 'Navigating to:', isManager ? '/' : '/borrow');
      if(!isManager && assignedRoles.includes('USER')) navigate('/borrow');
      else navigate('/');
    } catch(err: any){
      console.error('Login error:', err);
      setError(err?.response?.data?.message || 'Đăng nhập thất bại');
    }
  };


  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div className="form-card" style={{ width: 500, maxWidth: '90vw' }}>
        <h2 className="text-center mb-4">Đăng nhập Hệ thống Thư viện</h2>
        
        {/* Phần chọn vai trò nhanh */}
        <div className="mb-4">
          <label className="form-label fw-bold">Đăng nhập nhanh với tài khoản mẫu:</label>
          <div className="d-flex gap-2 flex-wrap">
            <button 
              type="button" 
              className="btn btn-outline-danger"
              onClick={() => quickLogin('admin', 'admin')}
            >
              👨‍💼 ADMIN (Quản trị viên)
            </button>
            <button 
              type="button" 
              className="btn btn-outline-success"
              onClick={() => quickLogin('user1', 'user123')}
            >
              👤 NGƯỜI DÙNG (Độc giả)
            </button>
          </div>
          <small className="text-muted d-block mt-2">
            • <strong>Admin:</strong> Quản lý toàn bộ hệ thống (sách, thể loại, người dùng, mượn trả)<br/>
            • <strong>Người dùng:</strong> Xem và mượn sách
          </small>
        </div>

        <hr />

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Tên đăng nhập</label>
            <input 
              className="form-control" 
              value={username} 
              onChange={e=>setUsername(e.target.value)}
              placeholder="Nhập username..." 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              placeholder="Nhập password..." 
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary w-100">
              🔐 Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
