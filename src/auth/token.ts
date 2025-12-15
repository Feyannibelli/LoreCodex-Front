export type AccessTokenGetter = () => Promise<string | null | undefined>;

let accessTokenGetter: AccessTokenGetter | null = null;

export function setAccessTokenGetter(getter: AccessTokenGetter | null) {
  accessTokenGetter = getter;
}

export async function getAccessToken(): Promise<string | null> {
  if (!accessTokenGetter) return null;
  try {
    const token = await accessTokenGetter();
    return token ? String(token) : null;
  } catch {
    return null;
  }
}

