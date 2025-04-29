// src/App.tsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Header from './components/Header'
import Profile from './pages/Profile'
import AdminUsers from './pages/AdminUsers'
import Games from './pages/Games'
import Game from './pages/Game'
import AdminGames from './pages/AdminGames'
import CreateGame from './pages/CreateGame.tsx'
import EditGame from './pages/EditGame'
import { useAuth } from './context/AuthContext'
import PublicOnlyRoute from './components/PublicOnlyRoute';
import PrivateRoute from './components/PrivateRoute';
import UserMenu from "./components/UserMenu";
import GamesPage from './pages/GamesPage';
import ListsPage from './pages/ListsPage';
import MyDraftsPage from "@/pages/MyDraftsPage.tsx";
import EditGuidePage from "@/pages/EditGuidePage.tsx";
import GuidePage from "@/pages/GuidePage.tsx";
import CreateGuidePage from "@/pages/CreateGuidePage.tsx";
import GuideDetailPage from "@/pages/GuideDetailPage.tsx";

// Component for admin protected routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAdmin, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
    return (
        <div>
            <Header />
            <UserMenu />
            <Routes>
                <Route path="/" element={<Home />} />

                {/* Rutas públicas solo para no logueados */}
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

                {/* Ruta protegida para perfil personal */}
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />

                {/* Ruta protegida solo para admins */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/games" element={<Games />} />
                <Route path="/games/:id" element={<Game />} />
                <Route
                    path="/admin/users"
                    element={
                        <AdminRoute>
                            <AdminUsers />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/games"
                    element={
                        <AdminRoute>
                            <AdminGames />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/games/create"
                    element={
                        <AdminRoute>
                            <CreateGame />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/games/edit/:id"
                    element={
                        <AdminRoute>
                            <EditGame />
                        </AdminRoute>
                    }
                />

                {/* Guías */}
                <Route path="/guides" element={<GuidePage />} />
                <Route
                    path="/guides/create"
                    element={
                        <PrivateRoute>
                            <CreateGuidePage />
                        </PrivateRoute>
                    }
                />
                <Route path="/guides/:id" element={<GuideDetailPage />} />
                <Route path="/my-drafts" element={<MyDraftsPage />} />
                <Route path="/guides/edit/:id" element={<EditGuidePage />} />

                {/* Juegos y listas - públicos de navegación */}
                <Route path="/games" element={<GamesPage />} />
                <Route path="/lists" element={<ListsPage />} />

                {/* Si no existe ruta, redirige a home */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
};

export default App;
