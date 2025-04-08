import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
// @ts-ignore
import '../css/Header.css'
import { useAuth } from '../contexts/AuthContext'
import { logout } from '../services/authService'

const Header: React.FC = () => {
    const { isAuthenticated, user, setAuthenticated, setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setAuthenticated(false);
        setUser(null);
        navigate('/');
    };

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className="site-name">
                    LoreCodex
                </Link>
            </div>

            <nav className="header-right">
                {isAuthenticated ? (
                    <>
                        <Link to="/profile" className="profile-circle">
                            {user?.username.charAt(0).toUpperCase()}
                        </Link>
                        <span className="separator">|</span>
                        <button onClick={handleLogout} className="nav-link logout-button">Logout</button>
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