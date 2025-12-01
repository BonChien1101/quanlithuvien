import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAppDispatch } from '../store';
import { setAuth } from '../features/appSlice';
import { parseJwt } from '../utils/jwt';

export default function Login(){
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState<string | undefined>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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
      const isManager = assignedRoles.some((r)=>['ADMIN','LIBRARIAN'].includes(r));
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
      <div className="form-card" style={{ width: 420, maxWidth: '90vw' }}>
        <h2>Đăng nhập</h2>
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input className="form-control" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-actions" style={{ display:'flex', gap:8, justifyContent:'space-between' }}>
            <button type="submit" className="btn btn-primary">Đăng nhập</button>
          </div>
        </form>
      </div>
    </div>
  );
}
