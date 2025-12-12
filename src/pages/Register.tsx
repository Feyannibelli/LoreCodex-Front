import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register, loginWithAuth0 } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validations
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            await register(username, email, password);
            navigate('/profile');
        } catch (err: any) {
            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError('Registration error. Please try again.');
            }
        }
    };

    const handleAuth0Register = () => {
        // Auth0 usa el mismo flujo para login y registro
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
                        placeholder="User Name"
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
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

                <div className="form-group">
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Password Confirmation"
                        required
                    />
                </div>

                <Button type="submit" className="auth-button">Register</Button>
            </form>

            {/* Separador */}
            <div style={{ margin: '20px 0', textAlign: 'center', color: '#666' }}>
                <hr style={{ marginBottom: '10px' }} />
                <span>OR</span>
            </div>

            {/* Botón de Auth0 */}
            <Button
                onClick={handleAuth0Register}
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
                Sign up with Auth0
            </Button>

            <div className="auth-links">
                <p>
                    Already got an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
