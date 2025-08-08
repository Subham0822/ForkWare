'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/app/actions/auth';
import { usePathname, useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  desiredRole?: string;
}

interface UserPayload {
    user: UserProfile;
    iat: number;
    exp: number;
}


const PROTECTED_ROUTES = ['/profile', '/admin', '/canteen', '/dashboard', '/analytics'];
const PUBLIC_AUTH_ROUTE = '/login';

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
        const session = await getSession();
        if (session && session.user) {
            setUser(session.user as UserProfile);
        } else {
            setUser(null);
        }
    } catch (error) {
        console.error("Session fetch error:", error);
        setUser(null);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!loading) {
      const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
      if (!user && isProtectedRoute) {
        router.push(PUBLIC_AUTH_ROUTE);
      }
    }
  }, [user, loading, pathname, router]);

  return { user, loading, mutate: fetchUser };
}
