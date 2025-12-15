import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';

const Login: React.FC = () => {
    const { login } = useAuth();

    return (
        <div className="auth-container">
            <div className="logo-container">
                <div className="logo-circle">Logo</div>
            </div>

            <Button
                type="button"
                className="auth-button"
                onClick={() => login('/profile')}
            >
                Log In with Auth0
            </Button>

            <div className="auth-links">
                <p>
                    No account? <Link to="/register">Sign up here</Link>
                </p>
                <p>
                    <Link to="/forgot-password">Forgot Password?</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
