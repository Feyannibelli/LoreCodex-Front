import React from "react"
import { Routes, Route, Link } from "react-router-dom"; // manejo de rutas en la web
import Home from './pages/home'
import Login from './pages/login'
import Register from './pages/register'

const App: React.FC = () => {
    return (
        <div>
            <nav>
                <Link to={"/"}>Inicio</Link> |
                <Link to="/login">Login</Link> |
                <Link to="/register">Registrarse</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </div>
    )
}

export default App