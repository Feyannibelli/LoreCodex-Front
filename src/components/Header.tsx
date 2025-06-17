import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsBell from "../components/NotificationsBell.tsx";
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../components/ui/dropdown-menu";

const Header: React.FC = () => {
    const { isAuthenticated, user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const userInitial = user?.username.charAt(0).toUpperCase() || 'U';

    return (
        <header className="flex items-center justify-between p-4 shadow-md sticky top-0 bg-white dark:bg-[#313E3F] z-50 transition-colors">
            {/* Logo */}
            <div className="text-2xl font-bold text-[#F47E00] dark:text-white">
                <Link to="/">LoreCodex</Link>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    <>
                        {/* dropdown del admin*/}
                        {isAdmin && (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 cursor-pointer">
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
                                        navigate('/login');
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