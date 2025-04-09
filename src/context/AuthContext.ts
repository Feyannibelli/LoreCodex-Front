import React, { createContext, useState, useEffect, ReactNode } from 'react';
import authService, { UserData } from '../services/authService';

interface AuthContextType {
    isAuthenticated: boolean;
    user: UserData | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    loading: true,
    login: async () => {},
    register: async () => {},
    logout: () => {},
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar si el usuario está autenticado al cargar la aplicación
    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            const isAuth = authService.isAuthenticated();

            if (isAuth) {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
            }

            setLoading(false);
        };

        checkAuth();
    }, []);

    // Función de inicio de sesión
    const login = async (username: string, password: string) => {
        try {
            await authService.login({ username, password });
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Función de registro
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
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const contextValue = {
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
            </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);