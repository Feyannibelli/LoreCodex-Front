// src/config/auth0Config.ts
export const auth0Config = {
    domain: import.meta.env.VITE_AUTH0_DOMAIN || 'dev-ylhiqy1yjkj1aw7e.us.auth0.com',
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || 'orNjwhOnOgpDWnB9QlBjNWHmmrIMlobX',
    authorizationParams: {
        redirect_uri: `${window.location.origin}/callback`,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE || 'https://api.lorecodex.com',
        scope: 'openid profile email',
    },
    cacheLocation: 'localstorage' as const,
};