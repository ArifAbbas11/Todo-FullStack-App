'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthToken, getAuthUser, clearAuth, isAuthenticated, setAuthToken } from '@/lib/auth';
import { setUnauthorizedHandler, clearUnauthorizedHandler } from '@/lib/api';
import { useToast } from '@/lib/toast';
import type { AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  handleUnauthorized: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Decode JWT token to extract payload
 * Returns null if token is invalid
 */
function decodeJWT(token: string): { exp?: number; [key: string]: any } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode base64url payload
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if token is expired or will expire soon
 * Returns time until expiration in milliseconds, or null if invalid
 */
function getTokenExpirationTime(token: string): number | null {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const timeUntilExpiration = expirationTime - currentTime;

  return timeUntilExpiration;
}

/**
 * AuthProvider Component
 * Manages authentication state and provides auth context to the app
 * Handles 401 responses, token expiration warnings, and auth state
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownExpirationWarning, setHasShownExpirationWarning] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { warning } = useToast();

  /**
   * Handle unauthorized access (401 response)
   * Clears auth data and redirects to signin page
   */
  const handleUnauthorized = useCallback(() => {
    // Clear authentication data
    clearAuth();
    setUser(null);
    setHasShownExpirationWarning(false);

    // Only redirect if not already on signin/signup pages to avoid infinite loops
    const publicPaths = ['/signin', '/signup'];
    if (!publicPaths.includes(pathname)) {
      router.push('/signin');
    }
  }, [router, pathname]);

  /**
   * Register unauthorized handler with API client
   * This allows the API client to trigger handleUnauthorized on 401 responses
   */
  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);

    return () => {
      clearUnauthorizedHandler();
    };
  }, [handleUnauthorized]);

  /**
   * Initialize authentication state from localStorage
   */
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = getAuthToken();
        const userData = getAuthUser();

        if (token && userData) {
          // Verify token is not expired
          const timeUntilExpiration = getTokenExpirationTime(token);

          if (timeUntilExpiration !== null && timeUntilExpiration > 0) {
            setUser(userData);
          } else {
            // Token is expired, clear auth
            clearAuth();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Check token expiration periodically and show warning if needed
   */
  useEffect(() => {
    if (!user) {
      setHasShownExpirationWarning(false);
      return;
    }

    const checkTokenExpiration = () => {
      const token = getAuthToken();
      if (!token) {
        return;
      }

      const timeUntilExpiration = getTokenExpirationTime(token);

      if (timeUntilExpiration === null) {
        // Invalid token, log out
        handleUnauthorized();
        return;
      }

      if (timeUntilExpiration <= 0) {
        // Token expired, log out
        handleUnauthorized();
        return;
      }

      // Show warning if token expires in less than 1 hour (3600000 ms)
      const oneHour = 60 * 60 * 1000;
      if (timeUntilExpiration < oneHour && !hasShownExpirationWarning) {
        const minutesLeft = Math.floor(timeUntilExpiration / 60000);
        warning(
          `Your session will expire in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}. Please save your work.`,
          10000 // Show for 10 seconds
        );
        setHasShownExpirationWarning(true);
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, hasShownExpirationWarning, warning, handleUnauthorized]);

  /**
   * Login user and store auth data
   */
  const login = useCallback((token: string, userData: AuthUser) => {
    setAuthToken(token, userData);
    setUser(userData);
    setHasShownExpirationWarning(false);
  }, []);

  /**
   * Logout user and clear auth data
   */
  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setHasShownExpirationWarning(false);
    router.push('/signin');
  }, [router]);

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    handleUnauthorized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
