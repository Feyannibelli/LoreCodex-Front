import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { register, RegisterData } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
    const [formData, setFormData] = useState<RegisterData>({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { setAuthenticated } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await register(formData);
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId.toString());
            setAuthenticated(true);
            navigate('/profile');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error en el registro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="form-container">
            <h1>Registrarse</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Usuario"
                        required
                    />
                </div>
                <div>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Contraseña"
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Cargando...' : 'Crear cuenta'}
                </button>
            </form>
            <nav>
                <Link to="/login" className="site-name">¿Ya tienes una cuenta? ¡Entra aquí!</Link>
            </nav>
        </main>
    )
}

export default Register;