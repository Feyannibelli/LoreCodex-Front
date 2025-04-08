import React from 'react'
import { Link } from 'react-router-dom'
import '../css/Header.css'

const Header: React.FC = () => {
    const isLoggedIn = true
    const userInitial = 'U'

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className="site-name">
                    MiSitio
                </Link>
            </div>

            <nav className="header-right">
                {isLoggedIn ? (
                    <Link to="/profile" className="profile-circle">
                        {userInitial}
                    </Link>
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
