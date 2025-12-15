import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';

const Register: React.FC = () => {
    const { register } = useAuth();

    return (
        <div className="auth-container">
            <div className="logo-container">
                <div className="logo-circle">Logo</div>
            </div>

            <Button
                type="button"
                className="auth-button"
                onClick={() => register('/profile')}
            >
                Sign Up with Auth0
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
