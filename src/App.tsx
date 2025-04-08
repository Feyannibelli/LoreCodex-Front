import React from "react"
import { Routes, Route } from "react-router-dom"; // manejo de rutas en la web
import Home from './pages/home'
import Login from './pages/login'
import Register from './pages/register'
import Header from './components/Header'
import Profile from './pages/profile'


const App: React.FC = () => {
    return (
        <div>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </div>
    )
}

export default App