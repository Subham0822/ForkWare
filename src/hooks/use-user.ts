'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';

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

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
      } else {
        // User is signed out
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.uid) {
        const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                setProfile(doc.data() as UserProfile);
            } else {
                setProfile(null);
            }
        });
        return () => unsub();
    }
  }, [user]);

   useEffect(() => {
    // This effect handles redirection logic after the session check is complete.
    if (!loading) {
      const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
      if (!user && isProtectedRoute) {
        router.push(PUBLIC_AUTH_ROUTE);
      }
    }
  }, [user, loading, pathname, router]);

  return { user, profile, loading };
}
