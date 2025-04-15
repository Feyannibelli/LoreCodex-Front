import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext.tsx'

const Profile: React.FC = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="profile-container">
            <h2>Perfil del Usuario</h2>

            <div className="profile-info">
                <div className="info-row">
                    <strong>Usuario:</strong>
                    <span>{user.username}</span>
                </div>

                <div className="info-row">
                    <strong>Email:</strong>
                    <span>{user.email}</span>
                </div>
            </div>

            <Button onClick={handleLogout} className="logout-button">
                Cerrar sesión
            </Button>
        </div>
    )
}

export default Profile