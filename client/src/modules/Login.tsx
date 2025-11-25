import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAppDispatch } from '../store';
import { setAuth } from '../features/appSlice';
import { parseJwt } from '../utils/jwt';

export default function Login(){
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | undefined>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    try {
      const res = await authApi.login({username, password});
  localStorage.setItem('auth_token', res.token);
  const { roles } = parseJwt(res.token);
  dispatch(setAuth({token: res.token, roles}));
      navigate('/');
    } catch(err: any){
      setError(err?.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="container py-4" style={{maxWidth: 420}}>
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
        <button className="btn btn-primary w-100" type="submit">Đăng nhập</button>
      </form>
    </div>
  );
}
