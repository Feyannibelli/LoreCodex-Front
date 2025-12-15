import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const { login } = useAuth();

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="relative overflow-hidden rounded-3xl border border bg-surface shadow-sm">
                    <div className="px-8 py-12 text-center">
                        <div className="mb-8">
                            <div className="mx-auto w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center mb-4">
                                <span className="text-2xl font-bold text-white">LC</span>
                            </div>
                            <h1 className="text-3xl font-bold text-text mb-2">Welcome Back</h1>
                            <p className="text-sm text-text-muted">Sign in to your LoreCodex account</p>
                        </div>

                        <Button
                            type="button"
                            variant="default"
                            className="w-full mb-6"
                            onClick={() => login('/profile')}
                        >
                            Log In with Auth0
                        </Button>

                        <div className="space-y-3 text-sm">
                            <p className="text-text-muted">
                                No account? <Link to="/register" className="text-brand-500 hover:text-brand-600 font-medium transition-colors">Sign up here</Link>
                            </p>
                            <p>
                                <Link to="/forgot-password" className="text-brand-500 hover:text-brand-600 font-medium transition-colors">Forgot Password?</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
