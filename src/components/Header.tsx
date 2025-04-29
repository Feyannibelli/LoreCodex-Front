import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
    const { isAuthenticated, user, isAdmin, logout } = useAuth(); // AHORA también tenemos logout
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
                        {/* Admin link */}
                        {isAdmin && (
                            <Link to="/admin/users" className="text-sm font-semibold text-[#0C0C0C] dark:text-white hover:underline">
                                Admin
                            </Link>
                        )}

                        {/* Notifications */}
                        <button className="relative">
                            <Bell className="h-6 w-6 text-[#090400] dark:text-white" />
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#F04E42]"></span>
                        </button>

                        {/* User menu */}
                        <DropdownMenu>
                            <div className="flex items-center gap-2">
                                {/* Círculo que lleva al profile */}
                                <Link to="/profile" className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-300 text-black font-semibold overflow-hidden">
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture} //cuando querramos agregarle foto de perfil al usuario en el futurooo
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span>{userInitial}</span>
                                    )}
                                </Link>

                                {/* Flechita que abre el dropdown */}
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