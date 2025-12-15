import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Header from './components/Header'
import Profile from './pages/Profile'
import AdminUsers from './pages/admin/AdminUsers.tsx'
import Games from './pages/game/Games.tsx'
import AdminGames from './pages/admin/AdminGames.tsx'
import CreateGame from './pages/game/CreateGame.tsx'
import EditGame from './pages/admin/EditGame.tsx'
import { useAuth } from './context/AuthContext'
import PublicOnlyRoute from './components/PublicOnlyRoute';
import PrivateRoute from './components/PrivateRoute';
import UserMenu from "./components/UserMenu";
import GamesPage from './pages/game/GamesPage.tsx';
import ListsPage from './pages/list/ListsPage.tsx';
import NewsPage        from "./pages/news/NewsPage";
import NewsDetailPage  from "./pages/news/NewsDetailPage";
import CreateNewsPage  from "./pages/news/CreateNewsPage";
import EditNewsPage    from "./pages/news/EditNewsPage";
import AdminNewsList   from "./pages/admin/AdminNewsList";
import EditGuidePage from "./pages/guide/EditGuidePage.tsx";
import MyDraftsPage from "./pages/guide/MyDraftsPage.tsx";
import GuidePage from "./pages/guide/GuidePage.tsx";
import CreateGuidePage from "./pages/guide/CreateGuidePage.tsx";
import CreateListPage from './pages/list/CreateListPage.tsx';
import MyListsPage from './pages/list/MyListsPage.tsx';
import ListDetailPage from './pages/list/ListDetailPage.tsx';
import EditListPage from './pages/list/EditListPage.tsx';
import ChallengesPage from './pages/challenge/ChallengesPage.tsx';
import ChallengeDetailPage from './pages/challenge/ChallengeDetailPage.tsx';
import CreateChallengePage from './pages/challenge/CreateChallengePage.tsx';
import PublicProfile from "./pages/PublicProfile.tsx";
import GuideDetailPage from "./pages/guide/GuideDetailPage.tsx";
import Game from "./pages/game/Game.tsx";
import BatchImportGames from './pages/admin/BatchImportGames.tsx';
import MyChallengesPage from './pages/challenge/MyChallengesPage.tsx';

// Component for admin protected routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAdmin, loading } = useAuth();
    if (loading) return <div>Loading…</div>;
    return isAdmin ? <>{children}</> : <Navigate to="/news" />;
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

                {/* MI perfil público (donde veo mis seguidores, listas, etc) */}
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <PublicProfile />
                        </PrivateRoute>
                    }
                />

                {/* Settings - solo notificaciones por email */}
                <Route
                    path="/settings"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />

                {/* perfil público de otro usuario */}
                <Route
                    path="/profile/:userId"
                    element={<PublicProfile />}
                />


                {/* Ruta protegida solo para admins */}
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
                <Route
                    path="/admin/games/batch-import"
                    element={
                        <AdminRoute>
                            <BatchImportGames />
                        </AdminRoute>
                    }
                />

                {/* Rutas de Challenges */}
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
                <Route path="/challenges/my" element={
                    <PrivateRoute>
                        <MyChallengesPage />
                    </PrivateRoute>
                }
                />

                {/* Guías */}
                <Route path="/guides" element={<GuidePage />} />
                <Route path="/guides/:id" element={<GuideDetailPage />} />
                <Route path="/guides/create" element={<PrivateRoute><CreateGuidePage /></PrivateRoute>} />
                <Route path="/guides/edit/:id" element={<PrivateRoute><EditGuidePage /></PrivateRoute>} />
                <Route path="/my-drafts" element={<PrivateRoute><MyDraftsPage /></PrivateRoute>} />

                {/* Listas */}
                <Route path="/lists" element={<ListsPage />} />
                <Route path="/lists/:id" element={<ListDetailPage />} />
                <Route
                    path="/lists/create"
                    element={
                        <PrivateRoute>
                            <CreateListPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/my-lists"
                    element={
                        <PrivateRoute>
                            <MyListsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/lists/edit/:id"
                    element={
                        <PrivateRoute>
                            <EditListPage />
                        </PrivateRoute>
                    }
                />

                {/* Juegos y listas - públicos de navegación */}
                <Route path="/games" element={<GamesPage />} />

                {/* Si no existe ruta, redirige a home */}
                <Route path="*" element={<Navigate to="/" />} />

                {/* ---------- NEWS (público) ---------- */}
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:id" element={<NewsDetailPage />} />

                {/* ADMIN News */}
                <Route path="/admin/news"           element={<AdminRoute><AdminNewsList /></AdminRoute>} />
                <Route path="/admin/news/create"    element={<AdminRoute><CreateNewsPage /></AdminRoute>} />
                <Route path="/admin/news/edit/:id"  element={<AdminRoute><EditNewsPage /></AdminRoute>} />
            </Routes>
        </div>
    );
};

export default App;
