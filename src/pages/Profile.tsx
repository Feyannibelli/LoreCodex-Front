import React, { useState } from 'react'
import Button from '../components/Button'

const Profile: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false)

    const user = {
        email: 'usuario@ejemplo.com',
        password: 'contraseña123'
    }

    const handleLogout = () => {
        console.log('Sesión cerrada')
    }

    return (
        <div className="profile-container">
            <h2>Perfil del Usuario</h2>
            <p><strong>Email:</strong> {user.email}</p>

            <p>
                <strong>Contraseña:</strong>{' '}
                {showPassword ? user.password : '********'}
                <Button onClick={() => setShowPassword(!showPassword)} className="toggle-button">
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                </Button>
            </p>

            <Button onClick={handleLogout} className="logout-button">
                Cerrar sesión
            </Button>
        </div>
    )
}

export default Profile
