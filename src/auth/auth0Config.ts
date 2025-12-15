type Env = ImportMetaEnv & {
  readonly VITE_AUTH0_DOMAIN?: string;
  readonly VITE_AUTH0_CLIENT_ID?: string;
  readonly VITE_AUTH0_AUDIENCE?: string;
  readonly VITE_AUTH0_SCOPE?: string;
  readonly VITE_AUTH0_REDIRECT_URI?: string;
  readonly VITE_AUTH0_ROLES_CLAIM?: string;
};

function required(name: keyof Env): string {
  const value = (import.meta.env as Env)[name];
  if (!value) {
    throw new Error(`Missing required env var: ${String(name)}`);
  }
  return value;
}

export const auth0Config = {
  domain: required('VITE_AUTH0_DOMAIN'),
  clientId: required('VITE_AUTH0_CLIENT_ID'),
  audience: required('VITE_AUTH0_AUDIENCE'),
  scope: (import.meta.env as Env).VITE_AUTH0_SCOPE ?? 'openid profile email',
  redirectUri:
    (import.meta.env as Env).VITE_AUTH0_REDIRECT_URI ?? window.location.origin,
  rolesClaim:
    (import.meta.env as Env).VITE_AUTH0_ROLES_CLAIM ??
    'roles,https://api.lorecodex.com/roles',
};

