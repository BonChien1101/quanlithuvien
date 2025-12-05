import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { selectToken, selectRoles } from '../../features/appSlice';
// đây là component bảo vệ route cho user có quyền nhất định
export default function RequireRole({ roles, children }: { roles: string[]; children: JSX.Element }){
  const token = useAppSelector(selectToken);
  const userRoles = useAppSelector(selectRoles);
  if(!token) return <Navigate to="/login" replace />;
  if(!roles.some(r => userRoles.includes(r))) return <div className="container py-4"><div className="alert alert-danger">Không đủ quyền truy cập</div></div>;
  return children;
}
