'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthState {
  isLoggedIn: boolean;
  loading: boolean;
  logout: () => void;
}

export function useAuth(requireAuth = false): AuthState {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
    setLoading(false);

    if (requireAuth && !token) {
      router.push('/login');
    }
  }, [requireAuth, router]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    router.push('/');
  }, [router]);

  return { isLoggedIn, loading, logout };
}
