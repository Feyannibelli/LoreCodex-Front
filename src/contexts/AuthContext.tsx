import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getUserProfile, User } from '../services/userService';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    setAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadUserData = async () => {
            if (isAuthenticated && !user) {
                try {
                    const userData = await getUserProfile();
                    setUser(userData);
                } catch (error) {
                    console.error('Error loading user data:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    setAuthenticated(false);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        loadUserData();
    }, [isAuthenticated, user]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, setUser, setAuthenticated }}>
    {children}
    </AuthContext.Provider>
);
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};