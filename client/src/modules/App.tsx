import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
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
import Sidebar from '../components/Sidebar';
import Dashboard from './Dashboard';
import UsersPage from './users/UsersPage';

import CategoriesPage from './categories/CategoriesPage';
import RequireAuth from './auth/RequireAuth';
import BrowseBooksPage from './user/BrowseBooksPage';

import UserHome from './user/Home';

export default function App() {
  const token = useAppSelector(selectToken);
  const roles = useAppSelector(selectRoles);
    const dispatch = useAppDispatch();
  const location = useLocation();
  //ẩn sidebar nếu ở khu user
  const isUserArea = location.pathname === '/user' || location.pathname.startsWith('/user/');
    return ( // gdien chinh
      <div className={(token && !isUserArea) ? 'layout' : 'layout layout--no-sidebar'}>
        {token && !isUserArea && <Sidebar />}
        <div className="layout__main">
          <div className="topbar">
            <div className="topbar__actions">
              {!token ? (
                <>
                  <Link className="btn btn-outline-secondary btn-sm" to="/login">Đăng nhập</Link>
                  <Link className="btn btn-primary btn-sm" to="/signup">Đăng ký</Link>
                </>
              ) : (
                <button className="btn btn-outline-danger btn-sm" onClick={()=>{localStorage.removeItem('auth_token');dispatch(logout());}}>Đăng xuất</button>
              )}
            </div>
          </div>
          <main className="content container-narrow">
            <Routes> 
              {/* Trang chủ có quyền admin lib thì vào Dashboard, ngược lại chuyển tới trang chủ User */}
              <Route path="/" element={token ? (roles.some(r=>['ADMIN','LIBRARIAN'].includes(r)) ? <Dashboard/> : <Navigate to="/user" replace />) : <Navigate to="/login" replace />} />
              <Route path="/login" element={<Login/>} />
              <Route path="/signup" element={<Signup/>} />
              <Route path="/books" element={<RequireRole roles={['ADMIN','LIBRARIAN']}><BookList/></RequireRole>} />
              <Route path="/categories" element={<RequireRole roles={['ADMIN','LIBRARIAN']}><CategoriesPage/></RequireRole>} />
              <Route path="/users" element={<RequireRole roles={['ADMIN']}><UsersPage/></RequireRole>} />
              <Route path="/readers" element={<RequireRole roles={['ADMIN','LIBRARIAN']}><ReadersPage/></RequireRole>} />
              <Route path="/loans" element={<RequireRole roles={['ADMIN','LIBRARIAN']}><LoansPage/></RequireRole>} />
              <Route path="/reports" element={<RequireRole roles={['ADMIN','LIBRARIAN']}><ReportsPage/></RequireRole>} />

              {/* trang của user */}
              <Route path="/user" element={<RequireAuth><UserHome/></RequireAuth>} />
              <Route path="/user/browse" element={<RequireAuth><BrowseBooksPage/></RequireAuth>} />


              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
}
