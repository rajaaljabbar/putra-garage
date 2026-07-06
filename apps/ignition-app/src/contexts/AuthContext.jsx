import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from '../lib/authClient';

const AuthContext = createContext();
const CACHE_KEY = 'pg_user_cache';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Instant local cache — no loading spinner on refresh
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(!user);

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      try {
        const { data, error } = await authClient.getSession();
        if (cancelled) return;
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem(CACHE_KEY, JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem(CACHE_KEY);
        }
      } catch {
        if (!cancelled) { /* keep cached user */ }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    verify();
    return () => { cancelled = true; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
