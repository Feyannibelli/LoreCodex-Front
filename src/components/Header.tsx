import React from 'react'
import { Link } from 'react-router-dom'
import '../css/Header.css'
import { useAuth } from '../context/AuthContext.tsx'

const Header: React.FC = () => {
    const { isAuthenticated, user, isAdmin } = useAuth();
    const userInitial = user?.username.charAt(0).toUpperCase() || 'U';

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className="site-name">
                    LoreCodex
                </Link>
                <Link to="/games" className="nav-link games-link">
                    Games
                </Link>
            </div>

            <nav className="header-right">
                {isAuthenticated ? (
                    <>
                        {isAdmin && (
                            <div className="admin-dropdown">
                                <span className="nav-link admin-link">Admin</span>
                                <div className="admin-dropdown-content">
                                    <Link to="/admin/users">Users</Link>
                                    <Link to="/admin/games">Games</Link>
                                </div>
                            </div>
                        )}
                        <Link to="/profile" className="profile-circle">
                            {userInitial}
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <span className="separator">|</span>
                        <Link to="/register" className="nav-link">Register</Link>
                    </>
                )}
            </nav>
        </header>
    )
}

export default Header