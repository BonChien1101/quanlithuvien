import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { selectToken } from '../../features/appSlice';

export default function RequireAuth({ children }: { children: JSX.Element }){
  const token = useAppSelector(selectToken);
  const loc = useLocation();
  if(!token){
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return children;
}
