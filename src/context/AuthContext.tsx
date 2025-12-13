import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import authService, { UserData } from '../services/authService';

interface AuthContextType {
    isAuthenticated: boolean;
    user: UserData | null;
    loading: boolean;
    isAdmin: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loginWithAuth0: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    loading: true,
    isAdmin: false,
    error: null,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    loginWithAuth0: () => {},
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auth0 hooks
    const {
        isAuthenticated: isAuth0Authenticated,
        isLoading: isAuth0Loading,
        user: auth0User,
        getAccessTokenSilently,
        loginWithRedirect,
        logout: auth0Logout,
        error: auth0Error
    } = useAuth0();

    // Log de Auth0 para debugging
    useEffect(() => {
        if (!isAuth0Loading) {
            console.log('🔐 Auth0 Status:', {
                isAuth0Authenticated,
                auth0User,
                auth0Error,
                hasToken: !!localStorage.getItem('auth0Token')
            });
        }
    }, [isAuth0Authenticated, isAuth0Loading, auth0User, auth0Error]);

    // Verificar autenticación al cargar la aplicación
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('🔍 Checking authentication...');

                // Primero verificar Auth0
                if (isAuth0Authenticated && auth0User) {
                    console.log('✅ Auth0 authenticated, syncing with backend...');

                    try {
                        // Obtener el token de Auth0
                        const token = await getAccessTokenSilently({
                            authorizationParams: {
                                audience: 'https://api.lorecodex.com',
                                scope: 'openid profile email',
                            }
                        });

                        console.log('🎫 Auth0 Token obtained:', token.substring(0, 50) + '...');
                        localStorage.setItem('auth0Token', token);

                        // Sincronizar con el backend
                        console.log('📡 Syncing with backend...');
                        const userData = await authService.syncAuth0User(token);
                        console.log('✅ User synced:', userData);

                        setUser(userData);
                        setIsAuthenticated(true);
                        setIsAdmin(authService.isAdminFromUserData(userData));
                        setError(null);
                    } catch (syncError: any) {
                        console.error('❌ Error syncing Auth0 user:', syncError);
                        setError(`Failed to sync with backend: ${syncError.message}`);

                        // Si falla la sincronización, intentar obtener usuario desde /me
                        try {
                            console.log('🔄 Trying alternative /me endpoint...');
                            const token = await getAccessTokenSilently({
                                authorizationParams: {
                                    audience: 'https://api.lorecodex.com',
                                    scope: 'openid profile email',
                                }
                            });
                            localStorage.setItem('auth0Token', token);

                            const userData = await authService.getCurrentUser();
                            if (userData) {
                                console.log('✅ User obtained from /me:', userData);
                                setUser(userData);
                                setIsAuthenticated(true);
                                setIsAdmin(authService.isAdminFromUserData(userData));
                                setError(null);
                            }
                        } catch (meError) {
                            console.error('❌ Error getting current user:', meError);
                            setError('Authentication failed. Please try logging in again.');
                        }
                    }
                }
                // Si no hay Auth0, verificar autenticación tradicional
                else if (!isAuth0Loading) {
                    console.log('🔑 Checking traditional authentication...');
                    const isAuth = authService.isAuthenticated();
                    if (isAuth) {
                        console.log('✅ Traditional token found, getting user...');
                        const userData = await authService.getCurrentUser();
                        if (userData) {
                            console.log('✅ User obtained:', userData);
                            setUser(userData);
                            setIsAuthenticated(true);
                            setIsAdmin(authService.isAdmin());
                            setError(null);
                        }
                    } else {
                        console.log('ℹ️ No authentication found');
                    }
                }
            } catch (err: any) {
                console.error('❌ Authentication check failed:', err);
                setError(err.message || 'Authentication failed');
            } finally {
                setLoading(false);
            }
        };

        if (!isAuth0Loading) {
            checkAuth();
        }
    }, [isAuth0Authenticated, isAuth0Loading, auth0User, getAccessTokenSilently]);

    // Función de inicio de sesión tradicional
    const login = async (username: string, password: string) => {
        try {
            console.log('🔐 Traditional login attempt for:', username);
            setError(null);

            await authService.login({ username, password });
            const userData = await authService.getCurrentUser();

            console.log('✅ Login successful:', userData);
            setUser(userData);
            setIsAuthenticated(true);
            setIsAdmin(authService.isAdmin());
        } catch (error: any) {
            console.error('❌ Login error:', error);
            setError(error.message || 'Login failed');
            throw error;
        }
    };

    // Función de registro tradicional
    const register = async (username: string, email: string, password: string) => {
        try {
            console.log('📝 Traditional register attempt for:', username);
            setError(null);

            await authService.register({ username, email, password });
            const userData = await authService.getCurrentUser();

            console.log('✅ Registration successful:', userData);
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error: any) {
            console.error('❌ Registration error:', error);
            setError(error.message || 'Registration failed');
            throw error;
        }
    };

    // Función de cierre de sesión
    const logout = () => {
        console.log('👋 Logging out...');

        if (isAuth0Authenticated) {
            // Logout de Auth0
            localStorage.removeItem('auth0Token');
            auth0Logout({
                logoutParams: {
                    returnTo: window.location.origin
                }
            });
        } else {
            // Logout tradicional
            authService.logout();
        }

        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setError(null);
    };

    // Función para login con Auth0
    const loginWithAuth0 = () => {
        console.log('🔐 Redirecting to Auth0 login...');
        loginWithRedirect();
    };

    const contextValue = {
        isAuthenticated,
        user,
        loading: loading || isAuth0Loading,
        isAdmin,
        error,
        login,
        register,
        logout,
        loginWithAuth0,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);
