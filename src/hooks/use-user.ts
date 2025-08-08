'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/app/actions/auth';
import { usePathname, useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { getCookie } from 'cookies-next';


interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  desiredRole?: string;
}

const PROTECTED_ROUTES = ['/profile', '/admin', '/canteen', '/dashboard', '/analytics'];
const PUBLIC_AUTH_ROUTE = '/login';

// A simple in-memory cache to avoid re-fetching the session on every render.
let cachedProfile: UserProfile | null = null;

function getProfileFromCookie(): UserProfile | null {
    const cookie = getCookie('session') as string | undefined;
    if (!cookie) return null;
    try {
        const decoded: UserProfile = jwtDecode(cookie);
        return decoded;
    } catch (e) {
        return null;
    }
}


export function useUser() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(cachedProfile);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    setLoading(true);
    // Try to get profile from client-side cookie first for speed
    const clientProfile = getProfileFromCookie();
    if(clientProfile) {
        cachedProfile = clientProfile;
        setProfile(clientProfile);
        setLoading(false);
        return;
    }

    // If not, verify session with server
    const sessionProfile = await getSession();
    cachedProfile = sessionProfile;
    setProfile(sessionProfile);
    setLoading(false);
  }, []);

  useEffect(() => {
    // This effect needs to run whenever the component mounts or the path changes,
    // to ensure the session is always fresh.
    checkSession();
  }, [pathname, checkSession]); // Re-check session on mount and path change

  useEffect(() => {
    // This effect handles redirection logic after the session check is complete.
    if (!loading) {
      const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
      if (!profile && isProtectedRoute) {
        router.push(PUBLIC_AUTH_ROUTE);
      }
    }
  }, [profile, loading, pathname, router]);

  // This is a simple way to sync logout state across tabs
  useEffect(() => {
      const syncLogout = (event: StorageEvent) => {
        if (event.key === 'logout-event') {
          cachedProfile = null;
          setProfile(null);
          router.push(PUBLIC_AUTH_ROUTE);
        }
      }
      window.addEventListener('storage', syncLogout)
      return () => {
        window.removeEventListener('storage', syncLogout)
      }
  }, [router]);


  return { user: profile, profile, loading };
}
