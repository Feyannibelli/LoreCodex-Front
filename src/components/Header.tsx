import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsBell from "../components/NotificationsBell.tsx";
import { ArrowLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../components/ui/dropdown-menu";

const Header: React.FC = () => {
    // Layout: Centered Logo, Left Back Button, Right Actions
    const { isAuthenticated, user, isAdmin, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const userInitial = user?.username.charAt(0).toUpperCase() || 'U';

    const showBackButton = location.pathname !== '/';

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/[0.02] bg-background/60 backdrop-blur-xl transition-all supports-[backdrop-filter]:bg-background/40">
            <div className="relative mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">

                {/* Centered Logo */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="bg-gradient-to-tr from-primary to-orange-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent transition-transform group-hover:scale-105">
                            LoreCodex
                        </span>
                    </Link>
                </div>

                {/* Left Section: Back Button */}
                <div className="flex items-center gap-6 mr-auto z-10">
                    {/* Back Button */}
                    {showBackButton && (
                        <button
                            onClick={() => navigate(-1)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-95"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center gap-4 ml-auto z-10">
                    {isAuthenticated ? (
                        <>
                            {isAdmin && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="hidden sm:inline-flex items-center justify-center rounded-full bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary focus:outline-none focus:ring-1 focus:ring-ring">
                                        Admin Panel
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-48 rounded-xl border border-border bg-card p-1 shadow-lg shadow-black/50"
                                    >
                                        <DropdownMenuItem className="rounded-lg focus:bg-secondary cursor-pointer" onClick={() => navigate('/admin/users')}>
                                            Users Management
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg focus:bg-secondary cursor-pointer" onClick={() => navigate('/admin/games')}>
                                            Games Database
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg focus:bg-secondary cursor-pointer" onClick={() => navigate('/admin/news')}>
                                            News Editorial
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            <NotificationsBell />

                            <DropdownMenu>
                                <DropdownMenuTrigger className="group flex items-center gap-2 outline-none">
                                    <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-transparent transition-all group-hover:ring-primary/50 group-focus:ring-primary">
                                        {user?.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt={user.username}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-secondary text-xs font-semibold text-foreground">
                                                {userInitial}
                                            </div>
                                        )}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border bg-card p-1 shadow-xl shadow-black/50">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-semibold text-foreground">{user?.username}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                    <div className="h-px bg-border my-1" />
                                    <DropdownMenuItem className="rounded-lg focus:bg-secondary cursor-pointer" onClick={() => navigate(`/profile/${user?.id}`)}>
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg focus:bg-secondary cursor-pointer" onClick={() => navigate('/profile')}>
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => logout()}
                                        className="rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                    >
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
