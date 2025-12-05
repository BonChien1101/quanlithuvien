import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAppDispatch } from '../store';
import { setAuth } from '../features/appSlice';
import { parseJwt } from '../utils/jwt';

export default function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }
    setLoading(true);
      try {
  console.log('Đang gửi yêu cầu đăng nhập');
      const res = await authApi.login({username, password});
  console.log('Đăng nhập thành công');
      const tokenValue = res.token;
      localStorage.setItem('auth_token', tokenValue);
      // Prefer roles returned by API; fall back to roles embedded in JWT
      const parsed = parseJwt(tokenValue) as any;
      let assignedRoles: string[] = (res as any).roles || parsed?.roles || [];
      // Parse roles if it's a JSON string
      if (typeof assignedRoles === 'string') {
        assignedRoles = JSON.parse(assignedRoles);
      }
  console.log('Vai trò người dùng:', assignedRoles);
        dispatch(setAuth({ token: tokenValue, roles: assignedRoles }));
      // Điều hướng: nếu là USER  -> /my-library, ngược lại về /
      const isManager = assignedRoles.some((r)=>['ADMIN','LIBRARIAN'].includes(r));
  console.log('Điều hướng tới:', isManager ? '/' : '/my-library');
      if(!isManager && assignedRoles.includes('USER')) navigate('/my-library');
      else navigate('/');
    } catch(err: any){
  console.error('Lỗi đăng nhập:', err);
      setError(err?.response?.data?.message || 'Đăng nhập thất bại');
    }
    finally {
      setLoading(false);
    }
  };


  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div className="form-card" style={{ width: 500, maxWidth: '90vw' }}>
        <h2 className="text-center mb-4">Đăng nhập Hệ thống Thư viện</h2>


        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Tên đăng nhập</label>
            <input 
              className="form-control" 
              value={username} 
              onChange={e=>setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-actions">
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
          </div>
        </form>
      </div>
    </div>
  );
}
