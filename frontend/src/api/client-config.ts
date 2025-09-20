import { OpenAPI } from './core/OpenAPI';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';
const ACCESS_TOKEN_KEY = 'access_token';

let inMemoryToken: string | undefined;

const readTokenFromStorage = (): string | undefined => {
  if (typeof window === 'undefined') {
    return inMemoryToken;
  }

  try {
    const stored = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    inMemoryToken = stored ?? undefined;
  } catch (error) {
    inMemoryToken = undefined;
  }

  return inMemoryToken;
};

export const getAccessToken = (): string | undefined => {
  return readTokenFromStorage();
};

export const setAccessToken = (token: string | null | undefined): void => {
  inMemoryToken = token ?? undefined;

  if (typeof window !== 'undefined') {
    try {
      if (inMemoryToken) {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, inMemoryToken);
      } else {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    } catch (error) {
      inMemoryToken = token ?? undefined;
    }
  }
};

export const clearAccessToken = (): void => {
  setAccessToken(undefined);
};

export const syncAccessTokenFromStorage = (): string | undefined => {
  return readTokenFromStorage();
};

OpenAPI.BASE = API_BASE_URL;
OpenAPI.TOKEN = async () => readTokenFromStorage() ?? '';
OpenAPI.WITH_CREDENTIALS = false;
OpenAPI.CREDENTIALS = 'include';
