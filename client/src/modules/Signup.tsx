import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAppDispatch } from '../store';
import { setAuth } from '../features/appSlice';
import { parseJwt } from '../utils/jwt';
export default function Signup(){  
    const [username, setUsername] = useState('admin'); // State cho tendn
    const [password, setPassword] = useState('password'); // State cho mk
    const [passwordConfirm, setPasswordConfirm] = useState('password'); // state xnhan mk
    const [error, setError] = useState<string | undefined>(); // lỗi
    const navigate = useNavigate(); // điều hướng
    const dispatch = useAppDispatch(); // Lấy hàm dispatch từ Redux

    const submit = async (e: React.FormEvent) => { // Xử lý đăng ký
        e.preventDefault();
        if (password !== passwordConfirm) {
            setError('Mật khẩu không khớp');
            return;
        }
        try {
        const res = await authApi.signup({username, password});// Gọi API đăng ký
        localStorage.setItem('auth_token', res.token);// Lưu token vào localStorage
        // Prefer roles from API when provided, otherwise parse from JWT
        const parsed = parseJwt(res.token) as any;
        const roles = (res as any).roles || parsed?.roles || [];
        dispatch(setAuth({token: res.token, roles})); // Cập nhật trạng thái xác thực trong Redux
        navigate('/'); // Chuyển hướng đến trang chủ
      } catch (error: any) {
        setError(error?.message || 'Đăng ký thất bại');
      }
    };
    return ( // Giao diện đăng ký
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div className="form-card" style={{ width: 420, maxWidth: '90vw' }}>
        <h2>Đăng ký</h2>
            <form onSubmit={submit}>
                <div className="mb-3">
                    <label className="form-label">Tên đăng nhập</label>
                    <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Mật khẩu</label>
                    <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Xác nhận mật khẩu</label>
                    <input type="password" className="form-control" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Đăng ký</button>
                </div>
            </form>
        </div>
        </div>
    );
}