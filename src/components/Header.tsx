import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsBell from "../components/NotificationsBell.tsx";
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../components/ui/dropdown-menu";

const Header: React.FC = () => {
    const { isAuthenticated, user, isAdmin, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const userInitial = user?.username.charAt(0).toUpperCase() || 'U';

    const isHome = location.pathname === '/';

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    return (
        <header className="grid grid-cols-3 items-center p-4 shadow-md sticky top-0 bg-white dark:bg-[#313E3F] z-50 transition-colors">
            {/* Left: Back */}
            <div className="justify-self-start">
                {!isHome ? (
                    <button
                        type="button"
                        onClick={handleBack}
                        aria-label="Volver"
                        className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-[#0C0C0C] dark:text-white" />
                    </button>
                ) : (
                    <div className="h-9 w-9" />
                )}
            </div>

            {/* Center: Logo */}
            <div className="justify-self-center text-2xl font-bold text-orange-500">
                <Link to="/">LoreCodex</Link>
            </div>

            {/* Right section */}
            <div className="justify-self-end flex items-center gap-4">
                {isAuthenticated ? (
                    <>
                        {/* dropdown del admin*/}
                        {isAdmin && (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer">
                                    Admin
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-32 shadow-lg rounded-md bg-white dark:bg-[#313E3F] animate-fade-in-scale"
                                >
                                    <DropdownMenuItem asChild>
                                        <Link to="/admin/users">Users</Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild>
                                        <Link to="/admin/games">Games</Link>
                                    </DropdownMenuItem>

                                    {/* acceso al abm de news */}
                                    <DropdownMenuItem asChild>
                                        <Link to="/admin/news">News</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Notifications */}
                        <NotificationsBell />

                        {/* User menu */}
                        <DropdownMenu>
                            <div className="flex items-center gap-2">
                                {/* círculo que lleva al profile */}
                                <Link to="/profile" className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-300 text-black font-semibold overflow-hidden">
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span>{userInitial}</span>
                                    )}
                                </Link>

                                {/* flechita q abre el dropdown */}
                                <DropdownMenuTrigger className="flex items-center justify-center">
                                    <ChevronDown className="h-4 w-4 text-[#0C0C0C] dark:text-white cursor-pointer" />
                                </DropdownMenuTrigger>
                            </div>

                            <DropdownMenuContent align="end" className="w-56 text-lg shadow-lg rounded-md bg-white dark:bg-[#313E3F] animate-fade-in-scale">
                                <DropdownMenuItem asChild>
                                    <Link to="/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        logout();
                                    }}
                                >
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-sm font-semibold text-[#0C0C0C] dark:text-white hover:underline">
                            Login
                        </Link>
                        <span className="text-[#0C0C0C] dark:text-white">|</span>
                        <Link to="/register" className="text-sm font-semibold text-[#0C0C0C] dark:text-white hover:underline">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
