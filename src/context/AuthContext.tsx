import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import authService, { UserData } from '../services/authService';

interface AuthContextType {
    isAuthenticated: boolean;
    user: UserData | null;
    loading: boolean;
    isAdmin: boolean;
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

    // Auth0 hooks
    const {
        isAuthenticated: isAuth0Authenticated,
        isLoading: isAuth0Loading,
        user: auth0User,
        getAccessTokenSilently,
        loginWithRedirect,
        logout: auth0Logout,
    } = useAuth0();

    // Verificar autenticación al cargar la aplicación
    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);

            // Primero verificar Auth0
            if (isAuth0Authenticated && auth0User) {
                try {
                    // Obtener el token de Auth0
                    const token = await getAccessTokenSilently({
                        authorizationParams: {
                            audience: 'https://api.lorecodex.com',
                            scope: 'openid profile email',
                        }
                    });
                    localStorage.setItem('auth0Token', token);

                    // Sincronizar con el backend
                    const userData = await authService.syncAuth0User(token);
                    setUser(userData);
                    setIsAuthenticated(true);
                    setIsAdmin(authService.isAdminFromUserData(userData));
                } catch (error) {
                    console.error('Error syncing Auth0 user:', error);
                    // Si falla la sincronización, intentar obtener usuario desde /me
                    try {
                        const token = await getAccessTokenSilently({
                            authorizationParams: {
                                audience: 'https://api.lorecodex.com',
                                scope: 'openid profile email',
                            }
                        });
                        localStorage.setItem('auth0Token', token);
                        const userData = await authService.getCurrentUser();
                        if (userData) {
                            setUser(userData);
                            setIsAuthenticated(true);
                            setIsAdmin(authService.isAdminFromUserData(userData));
                        }
                    } catch (innerError) {
                        console.error('Error getting current user:', innerError);
                    }
                }
            }
            // Si no hay Auth0, verificar autenticación tradicional
            else {
                const isAuth = authService.isAuthenticated();
                if (isAuth) {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                    setIsAuthenticated(true);
                    setIsAdmin(authService.isAdmin());
                }
            }

            setLoading(false);
        };

        if (!isAuth0Loading) {
            checkAuth();
        }
    }, [isAuth0Authenticated, isAuth0Loading, auth0User, getAccessTokenSilently]);

    // Función de inicio de sesión tradicional
    const login = async (username: string, password: string) => {
        try {
            await authService.login({ username, password });
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
            setIsAdmin(authService.isAdmin());
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Función de registro tradicional
    const register = async (username: string, email: string, password: string) => {
        try {
            await authService.register({ username, email, password });
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    // Función de cierre de sesión
    const logout = () => {
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
    };

    // Función para login con Auth0
    const loginWithAuth0 = () => {
        loginWithRedirect();
    };

    const contextValue = {
        isAuthenticated,
        user,
        loading: loading || isAuth0Loading,
        isAdmin,
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
