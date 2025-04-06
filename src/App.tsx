import React from "react"
import { Routes, Route, Link } from "react-router-dom"; // manejo de rutas en la web
import Home from './pages/home'
import Login from './pages/login'
import Register from './pages/register'
import Header from './components/Header'

const App: React.FC = () => {
    return (
        <div>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </div>
    )
}

export default App