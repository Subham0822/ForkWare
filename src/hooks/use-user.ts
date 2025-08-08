
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

const PROTECTED_ROUTES = ['/profile', '/admin', '/canteen', '/dashboard', '/analytics'];

export function useUser() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);

      if (firebaseUser) {
        // User is logged in, listen for profile changes
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          } else {
            // This case might happen if a user is deleted from Firestore but not from Auth
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setProfile(null);
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        // User is not logged in
        setProfile(null);
        setLoading(false);
        // If the user is on a protected page, redirect them to login
        if (PROTECTED_ROUTES.includes(pathname)) {
          router.push('/login');
        }
      }
    });

    return () => unsubscribeAuth();
  }, [pathname, router]);

  return { user, profile, loading };
}
