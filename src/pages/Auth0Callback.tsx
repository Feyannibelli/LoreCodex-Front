import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const Auth0Callback: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading, error, user, getAccessTokenSilently } = useAuth0();
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [tokenInfo, setTokenInfo] = useState<string>('');

    useEffect(() => {
        const handleCallback = async () => {
            console.log('🔄 Auth0 Callback - Processing...');

            if (isLoading) {
                console.log('⏳ Still loading...');
                setDebugInfo({ status: 'loading' });
                return;
            }

            if (error) {
                console.error('❌ Auth0 Error:', error);
                setDebugInfo({
                    status: 'error',
                    error: error.message,
                    fullError: error
                });
                return;
            }

            if (isAuthenticated && user) {
                try {
                    console.log('✅ User authenticated:', user);

                    // Obtener el token
                    const token = await getAccessTokenSilently({
                        authorizationParams: {
                            audience: 'https://api.lorecodex.com',
                            scope: 'openid profile email',
                        }
                    });

                    console.log('🎫 Token obtained:', token.substring(0, 50) + '...');

                    // Decodificar el token para ver qué claims contiene
                    const tokenParts = token.split('.');
                    const payload = JSON.parse(atob(tokenParts[1]));
                    console.log('📋 Token payload:', payload);

                    setDebugInfo({
                        status: 'success',
                        user,
                        tokenPayload: payload
                    });

                    setTokenInfo(JSON.stringify(payload, null, 2));

                    // Esperar 3 segundos para ver la info
                    setTimeout(() => {
                        console.log('➡️ Redirecting to profile...');
                        navigate('/profile');
                    }, 3000);

                } catch (tokenError: any) {
                    console.error('❌ Token Error:', tokenError);
                    setDebugInfo({
                        status: 'token_error',
                        error: tokenError.message,
                        user
                    });
                }
            }
        };

        handleCallback();
    }, [isAuthenticated, isLoading, error, user, getAccessTokenSilently, navigate]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Auth0 Callback Debug
                </h1>

                {isLoading && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Processing authentication...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <h3 className="font-bold mb-2">Authentication Error</h3>
                        <p>{error.message}</p>
                        <pre className="mt-2 text-xs overflow-auto">
                            {JSON.stringify(error, null, 2)}
                        </pre>
                    </div>
                )}

                {debugInfo.status === 'success' && (
                    <div className="space-y-4">
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            <h3 className="font-bold mb-2">✅ Authentication Successful!</h3>
                            <p>Redirecting to profile in 3 seconds...</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                            <h4 className="font-semibold mb-2">User Info:</h4>
                            <pre className="text-xs overflow-auto">
                                {JSON.stringify(user, null, 2)}
                            </pre>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded p-4">
                            <h4 className="font-semibold mb-2">Token Claims:</h4>
                            <pre className="text-xs overflow-auto">
                                {tokenInfo}
                            </pre>
                            <div className="mt-2 p-2 bg-yellow-100 rounded">
                                <p className="text-sm">
                                    <strong>⚠️ Check if email is present:</strong>
                                </p>
                                <ul className="text-xs mt-1 list-disc list-inside">
                                    <li>Standard claim "email": {debugInfo.tokenPayload?.email || '❌ NOT FOUND'}</li>
                                    <li>Custom claim "https://api.lorecodex.com/email": {debugInfo.tokenPayload?.['https://api.lorecodex.com/email'] || '❌ NOT FOUND'}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {debugInfo.status === 'token_error' && (
                    <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded">
                        <h3 className="font-bold mb-2">Token Error</h3>
                        <p>{debugInfo.error}</p>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth0Callback;
