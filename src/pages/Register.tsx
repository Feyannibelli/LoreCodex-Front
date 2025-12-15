import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
    const { register } = useAuth();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="px-8 py-12 text-center">
                        <div className="mb-8">
                            <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4 text-primary-foreground">
                                <span className="text-2xl font-bold">LC</span>
                            </div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
                            <p className="text-sm text-muted-foreground">Join the LoreCodex community</p>
                        </div>

                        <Button
                            type="button"
                            variant="default"
                            className="w-full mb-6"
                            onClick={() => register('/profile')}
                        >
                            Sign Up with Auth0
                        </Button>

                        <div className="text-sm">
                            <p className="text-muted-foreground">
                                Already got an account? <Link to="/login" className="text-primary hover:text-primary/90 font-medium transition-colors">Login here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
