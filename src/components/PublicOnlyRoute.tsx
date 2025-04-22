// src/components/PublicOnlyRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div>Cargando...</div>;

    return isAuthenticated ? <Navigate to="/" /> : <>{children}</>;
};

export default PublicOnlyRoute;
