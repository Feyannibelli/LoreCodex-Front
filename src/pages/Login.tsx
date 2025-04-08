import React from 'react'
import Button from '../components/Button'

const Login: React.FC = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Iniciando sesión...')
    }

    return (
        <div className="login-container">
            <h2>Iniciar sesión</h2>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" required />

                <label>Contraseña:</label>
                <input type="password" required />

                <Button type="submit">Iniciar sesión</Button>
            </form>
        </div>
    )
}

export default Login
