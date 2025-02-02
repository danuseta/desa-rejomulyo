import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika tidak ada role yang diminta, berarti route bisa diakses semua user yang sudah login
  if (!role) {
    return children;
  }

  // Cek akses ke route admin
  if (location.pathname.startsWith('/admin')) {
    // Kedua role bisa akses route admin
    if (user.role === 'admin' || user.role === 'super_admin') {
      return children;
    }
  }

  // Cek akses ke route superadmin
  if (location.pathname.startsWith('/superadmin')) {
    // Hanya super_admin yang bisa akses
    if (user.role === 'super_admin') {
      return children;
    }
  }

  // Redirect ke default route sesuai role jika tidak punya akses
  if (user.role === 'super_admin') {
    // Jika dari /admin, biarkan di /admin
    if (location.pathname.startsWith('/admin')) {
      return children;
    }
    return <Navigate to="/superadmin/letter-templates" replace />;
  }
  
  return <Navigate to="/admin" replace />;
};

export default PrivateRoute;