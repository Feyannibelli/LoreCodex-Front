import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loginWithAuth0 } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login(username, password);
            navigate('/profile');
        } catch (err) {
            setError('Incorrect username or password. Please try again.');
        }
    };

    const handleAuth0Login = () => {
        loginWithAuth0();
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

            {/* Separador */}
            <div style={{ margin: '20px 0', textAlign: 'center', color: '#666' }}>
                <hr style={{ marginBottom: '10px' }} />
                <span>OR</span>
            </div>

            {/* Botón de Auth0 */}
            <Button
                onClick={handleAuth0Login}
                className="auth-button"
                style={{
                    backgroundColor: '#EB5424',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 128 128"
                    fill="white"
                    style={{ marginRight: '5px' }}
                >
                    <path d="M64 0L41 22.9l23 23 23-23L64 0zm23 45.9L64 69 41 45.9 18 69l23 23 23-23 23 23 23-23-23-23.1z"/>
                </svg>
                Continue with Auth0
            </Button>

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
