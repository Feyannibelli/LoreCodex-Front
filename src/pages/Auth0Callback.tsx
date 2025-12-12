import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const Auth0Callback: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading, error } = useAuth0();
    const [debugInfo, setDebugInfo] = useState<string>('');

    useEffect(() => {
        console.log('Auth0 Callback - isLoading:', isLoading);
        console.log('Auth0 Callback - isAuthenticated:', isAuthenticated);
        console.log('Auth0 Callback - error:', error);

        if (error) {
            setDebugInfo(`Error: ${error.message}`);
            console.error('Auth0 Error:', error);
        }

        if (!isLoading) {
            if (isAuthenticated) {
                console.log('Auth0 authentication successful, redirecting to profile...');
                // Redirigir al perfil o a la página principal
                setTimeout(() => {
                    navigate('/profile');
                }, 1000);
            } else if (error) {
                console.error('Auth0 authentication failed:', error);
                setDebugInfo(`Authentication failed: ${error.message}`);
                // Si algo salió mal, redirigir al login después de 3 segundos
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        }
    }, [isAuthenticated, isLoading, error, navigate]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Authentication Error</h2>
                    <p className="text-red-600 mb-4">{debugInfo}</p>
                    <p className="text-sm text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg font-medium">Completing authentication...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
            </div>
        </div>
    );
};

export default Auth0Callback;
