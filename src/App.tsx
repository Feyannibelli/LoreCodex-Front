// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Header from './components/Header';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import GuidePage from './pages/GuidePage'; // ⭐ Importamos GuidePage
import CreateGuidePage from "./pages/CreateGuidePage"; // ⭐ Importamos la nueva página
import GuideDetail from './pages/GuideDetail'; // ⭐ Importamos GuideDetail
import { useAuth } from './context/AuthContext';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import UserMenu from "./components/UserMenu.tsx";
import GamesPage from './pages/GamesPage';
import ListsPage from './pages/ListsPage';

// Componente para rutas protegidas de admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAdmin, loading } = useAuth();

    if (loading) return <div>Cargando...</div>;

    return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
    return (
        <div>
            <Header />
            <UserMenu />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/login"
                    element={
                        <PublicOnlyRoute>
                            <Login />
                        </PublicOnlyRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicOnlyRoute>
                            <Register />
                        </PublicOnlyRoute>
                    }
                />
                <Route path="/profile" element={<Profile />} />
                <Route
                    path="/admin/users"
                    element={
                        <AdminRoute>
                            <AdminUsers />
                        </AdminRoute>
                    }
                />

                {/* NUEVAS RUTAS PARA GUÍAS */}
                <Route path="/guides" element={<GuidePage />} />
                <Route path="/guides/create" element={<CreateGuidePage />} />
                <Route path="/guides/:id" element={<GuideDetail />} />
                <Route path="/games" element={<GamesPage />} />
                <Route path="/lists" element={<ListsPage />} />
            </Routes>
        </div>
    );
};

export default App;
