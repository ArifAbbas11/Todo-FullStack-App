/**
 * Better Auth configuration for JWT-based authentication.
 * Handles token storage and retrieval for the Todo application.
 */

const JWT_TOKEN_KEY = 'todo_auth_token';
const USER_DATA_KEY = 'todo_user_data';

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/**
 * Store authentication token and user data in localStorage
 */
export function setAuthToken(token: string, user: AuthUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(JWT_TOKEN_KEY, token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }
}

/**
 * Retrieve authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(JWT_TOKEN_KEY);
  }
  return null;
}

/**
 * Retrieve user data from localStorage
 */
export function getAuthUser(): AuthUser | null {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        return null;
      }
    }
  }
  return null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Clear authentication token and user data (sign out)
 */
export function clearAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(JWT_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  }
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  return {};
}
