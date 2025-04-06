import React from "react";
import { Link } from 'react-router-dom'
import './Header.css'

const Header = () => {
    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className="site-name">
                    LoreCodex
                </Link>
            </div>
            <nav className="header-right">
                <Link to="/login" className="site-name">Login</Link>
                <span className="separator">|</span>
                <Link to="/register" className="site-name">Register</Link>
            </nav>
        </header>
    )
}

export default Header;