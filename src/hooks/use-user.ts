
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  verified: boolean;
}

const PROTECTED_ROUTES = ['/profile'];
const PUBLIC_AUTH_ROUTE = '/login';

export function useUser() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        // If user is not logged in, clear profile and finish loading.
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeSnapshot = () => {};
    if (user) {
      // User is logged in, listen for profile changes.
      setLoading(true); // Set loading to true while we fetch profile
      const userDocRef = doc(db, 'users', user.uid);
      unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching user profile:", error);
        setProfile(null);
        setLoading(false);
      });
    } else {
      // No user, so no profile to fetch and not loading.
      setProfile(null);
      setLoading(false);
    }
    return () => unsubscribeSnapshot();
  }, [user]);

  useEffect(() => {
    // This effect handles redirection logic after loading is complete.
    if (!loading) {
      const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
      
      if (!user && isProtectedRoute) {
        // If user is not logged in and on a protected route, redirect to login.
        router.push(PUBLIC_AUTH_ROUTE);
      }
      
      // This part was causing issues when a logged-in user refreshed the login page.
      // It's better to handle this inside the login page itself.
      // if (user && pathname === PUBLIC_AUTH_ROUTE) {
      //   router.push('/profile');
      // }
    }
  }, [user, profile, loading, pathname, router]);

  return { user, profile, loading };
}
