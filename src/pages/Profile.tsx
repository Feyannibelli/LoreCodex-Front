import React, { useState } from "react";

const Profile = () => {
    const [showPassword, setShowPassword] = useState(false);

    const user = {
        email: "",
        password: "",
    }

    const handleLogout = () => {
        console.log("Sesion terminada");
    }


    return (
        <div className="profile-container">
            <h2>Perfil del Usuario</h2>
            <p><strong>Email:</strong> {user.email}</p>

            <p>
                <strong>Contraseña:</strong>{' '}
                {showPassword ? user.password : '********'}
                <button onClick={() => setShowPassword(!showPassword)} className="toggle-button">
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
            </p>

            <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
        </div>
    )

}

export default Profile;