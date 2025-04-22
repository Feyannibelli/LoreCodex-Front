import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login(username, password);
            navigate('/profile');
        } catch (err) {
            setError('Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.');
        }
    };

    return (
        <div className="auth-container">
            <div className="logo-container">
                <div className="logo-circle">Logo</div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Email / User Name"
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                </div>

                <Button type="submit" className="auth-button">Log In</Button>
            </form>

            <div className="auth-links">
                <p>
                    No account? <Link to="/register">Register here</Link>
                </p>
                <p>
                    <Link to="/forgot-password">Forgot Password?</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;