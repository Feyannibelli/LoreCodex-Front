import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Header from './components/Header'
import Profile from './pages/Profile'
import AdminUsers from './pages/admin/AdminUsers.tsx'
import Games from './pages/game/Games.tsx'
import Game from './pages/game/Game.tsx'
import AdminGames from './pages/admin/AdminGames.tsx'
import CreateGame from './pages/game/CreateGame.tsx'
import EditGame from './pages/admin/EditGame.tsx'
import { useAuth } from './context/AuthContext'
import PublicOnlyRoute from './components/PublicOnlyRoute';
import PrivateRoute from './components/PrivateRoute';
import UserMenu from "./components/UserMenu";
import GamesPage from './pages/game/GamesPage.tsx';
import ListsPage from './pages/ListsPage';
import ChallengesPage from './pages/challenge/ChallengesPage';
import ChallengeDetailPage from './pages/challenge/ChallengeDetailPage';
import CreateChallengePage from './pages/challenge/CreateChallengePage';
import EditGuidePage from "./pages/guide/EditGuidePage.tsx";
import MyDraftsPage from "./pages/guide/MyDraftsPage.tsx";
import GuidePage from "./pages/guide/GuidePage.tsx";
import CreateGuidePage from "./pages/guide/CreateGuidePage.tsx";
import GuideDetailPage from "./pages/guide/GuideDetailPage.tsx";

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

                {/* Challenges */}
                <Route path="/challenges" element={<ChallengesPage />} />
                <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
                <Route
                    path="/challenges/create"
                    element={
                        <PrivateRoute>
                            <CreateChallengePage />
                        </PrivateRoute>
                    }
                />

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
