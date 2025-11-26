import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import { useAppDispatch, useAppSelector } from '../store';
import { selectToken, selectRoles } from '../features/appSlice';
import { logout } from '../features/appSlice';
import BookList from './books/BookList';
import RequireRole from './auth/RequireRole';
import ReadersPage from './readers/ReadersPage';
import LoansPage from './loans/LoansPage';
import ReportsPage from './reports/ReportsPage';

function Home() {
  return <div className="container py-4"><h1>Library Management</h1><p>Trang chủ</p></div>;
}

export default function App() {
  const token = useAppSelector(selectToken);
  const roles = useAppSelector(selectRoles);
    const dispatch = useAppDispatch();
    return ( // gdien chinh
      <>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <Link to="/" className="navbar-brand">Library</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav me-auto">
                <li className="nav-item"><Link className="nav-link" to="/books">Sách</Link></li>
  {roles.some(r=>['ADMIN','LIBRARIAN'].includes(r)) && <li className="nav-item"><Link className="nav-link" to="/readers">Bạn đọc</Link></li>} 
  {roles.some(r=>['ADMIN','LIBRARIAN'].includes(r)) && <li className="nav-item"><Link className="nav-link" to="/loans">Mượn/Trả</Link></li>}
  {roles.some(r=>['ADMIN','LIBRARIAN'].includes(r)) && <li className="nav-item"><Link className="nav-link" to="/reports">Báo cáo</Link></li>}
              </ul>
              <ul className="navbar-nav ms-auto">   
                {!token && (
                  <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Đăng nhập</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/signup">Đăng ký</Link>
                  </li>
                  </>
                )}
                {token &&(
                   <li className="nav-item">
                    <button 
                    className="btn btn-link nav-link" 
                    onClick={()=>{localStorage.removeItem('auth_token');dispatch(logout());}}>
                      Đăng xuất
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
        <Routes> 
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/books" element={<BookList/>} />
    <Route path="/readers" element={<RequireRole roles={['ADMIN','LIBRARIAN']}><ReadersPage/></RequireRole>} />
    <Route path="/loans" element={<RequireRole roles={['ADMIN','LIBRARIAN']}><LoansPage/></RequireRole>} />
    <Route path="/reports" element={<RequireRole roles={['ADMIN','LIBRARIAN']}><ReportsPage/></RequireRole>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    );
}
