import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { jwtDecode } from 'jwt-decode';
import { auth0Config } from '../auth/auth0Config';
import { setAccessTokenGetter } from '../auth/token';
import apiAuth from '../services/apiAuth';
import type { UserData } from '../services/authService';

interface AuthContextType {
    isAuthenticated: boolean;
    user: UserData | null;
    loading: boolean;
    isAdmin: boolean;
    login: (returnTo?: string) => Promise<void>;
    register: (returnTo?: string) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    loading: true,
    isAdmin: false,
    login: async () => {},
    register: async () => {},
    logout: () => {},
});

interface AuthProviderProps {
    children: ReactNode;
}

type JwtClaims = Record<string, unknown>;

function claimAsStringList(claimNames: string, claims: JwtClaims): string[] {
    for (const rawName of claimNames.split(',')) {
        const name = rawName.trim();
        if (!name) continue;

        const value = claims[name];
        if (Array.isArray(value)) {
            const list = value.filter(Boolean).map(String);
            if (list.length) return list;
        }
        if (typeof value === 'string' && value.trim()) {
            return [value];
        }
    }
    return [];
}

function isAdminFromRoles(roles: string[]): boolean {
    return roles.some((role) => {
        const normalized = String(role).trim().toUpperCase().replace(/^ROLE_/, '');
        return normalized === 'ADMIN';
    });
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const { isAuthenticated, isLoading, loginWithRedirect, logout: auth0Logout, getAccessTokenSilently } =
        useAuth0();

    const [user, setUser] = useState<UserData | null>(null);
    const [isAdmin, setIsAdmin] = useState(false); // Estado para controlar si es admin
    const [authDataLoading, setAuthDataLoading] = useState(false);

    useEffect(() => {
        setAccessTokenGetter(async () => {
            if (!isAuthenticated) return null;
            return await getAccessTokenSilently({
                authorizationParams: {
                    audience: auth0Config.audience,
                    scope: auth0Config.scope,
                },
            });
        });

        return () => setAccessTokenGetter(null);
    }, [getAccessTokenSilently, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            setUser(null);
            setIsAdmin(false);
            setAuthDataLoading(false);
            return;
        }

        let cancelled = false;
        setAuthDataLoading(true);

        (async () => {
            try {
                const token = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: auth0Config.audience,
                        scope: auth0Config.scope,
                    },
                });

                const claims = jwtDecode<JwtClaims>(token);
                const roles = claimAsStringList(auth0Config.rolesClaim, claims);
                if (!cancelled) setIsAdmin(isAdminFromRoles(roles));

                try {
                    const res = await apiAuth.get('/user/me');
                    if (!cancelled) setUser(res.data);
                } catch {
                    if (!cancelled) setUser(null);
                }
            } catch {
                if (!cancelled) {
                    setIsAdmin(false);
                    setUser(null);
                }
            } finally {
                if (!cancelled) setAuthDataLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [getAccessTokenSilently, isAuthenticated]);

    const login = async (returnTo: string = '/profile') => {
        await loginWithRedirect({
            appState: { returnTo },
            authorizationParams: {
                audience: auth0Config.audience,
                scope: auth0Config.scope,
            },
        });
    };

    const register = async (returnTo: string = '/profile') => {
        await loginWithRedirect({
            appState: { returnTo },
            authorizationParams: {
                audience: auth0Config.audience,
                scope: auth0Config.scope,
                screen_hint: 'signup',
            },
        });
    };

    const logout = () => {
        auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    };

    const contextValue = {
        isAuthenticated,
        user,
        loading: isLoading || authDataLoading,
        isAdmin,
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
