import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../store';
import { selectRoles } from '../features/appSlice';

export default function Sidebar(){
  const roles = useAppSelector(selectRoles);
  const canManage = roles.some(r=>['ADMIN','LIBRARIAN'].includes(r));
  const isAdmin = roles.includes('ADMIN');
  const isUser = roles.includes('USER');
  
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">Library</div>
      <nav className="sidebar__nav">
        {canManage && (
          <NavLink to="/" end className={({isActive})=>`sidebar__link ${isActive?'active':''}`}>
            <span className="sidebar__icon"></span> Dashboard
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/users" className={({isActive})=>`sidebar__link ${isActive?'active':''}`}>
            <span className="sidebar__icon"></span> Quản trị hệ thống
          </NavLink>
        )}
        {canManage && (
          <NavLink to="/categories" className={({isActive})=>`sidebar__link ${isActive?'active':''}`}>
            <span className="sidebar__icon"></span> Danh mục thể loại
          </NavLink>
        )}
        {canManage && (
          <NavLink to="/books" className={({isActive})=>`sidebar__link ${isActive?'active':''}`}>
            <span className="sidebar__icon"></span> Quản lý kho sách
          </NavLink>
        )}
        {canManage && (
          <>
            <NavLink to="/readers" className={({isActive})=>`sidebar__link ${isActive?'active':''}`}><span className="sidebar__icon"></span> Quản lý độc giả</NavLink>
            <NavLink to="/loans" className={({isActive})=>`sidebar__link ${isActive?'active':''}`}><span className="sidebar__icon"></span> Quản lý mượn trả sách</NavLink>
            <NavLink to="/reports" className={({isActive})=>`sidebar__link ${isActive?'active':''}`}><span className="sidebar__icon"></span> Báo cáo thống kê</NavLink>
          </>
        )}
        {isUser && (
          <>
            <NavLink to="/my-library" className={({isActive})=>`sidebar__link ${isActive?'active':''}`}><span className="sidebar__icon"></span> 📚 Thư viện của tôi</NavLink>
            <NavLink to="/browse-books" className={({isActive})=>`sidebar__link ${isActive?'active':''}`}><span className="sidebar__icon"></span> 📖 Tìm sách mượn</NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
