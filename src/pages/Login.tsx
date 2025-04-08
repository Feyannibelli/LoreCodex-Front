import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { login, LoginData } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
    const [formData, setFormData] = useState<LoginData>({
        username: '',
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
            const response = await login(formData);
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId.toString());
            setAuthenticated(true);
            navigate('/profile');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error en el inicio de sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <h1>Iniciar Sesión</h1>
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
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Contraseña"
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Cargando...' : 'Iniciar sesión'}
                </button>
            </form>
            <nav>
                <Link to="/register" className="site-name">¿No tienes una cuenta? ¡Regístrate aquí!</Link>
            </nav>
        </main>
    )
}

export default Login;