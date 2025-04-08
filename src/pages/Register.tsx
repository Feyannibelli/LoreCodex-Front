import React from 'react'
import Button from '../components/Button'

const Register: React.FC = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Registrando usuario...')
    }

    return (
        <div className="register-container">
            <h2>Registro</h2>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" required />

                <label>Contraseña:</label>
                <input type="password" required />

                <Button type="submit">Registrarse</Button>
            </form>
        </div>
    )
}

export default Register
