import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute() {
    const { currentUser, isAdmin } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        // Eğer kullanıcı admin değilse ana sayfaya (hesaplayıcıya) at.
        return <Navigate to="/app" replace />;
    }

    return <Outlet />;
}
