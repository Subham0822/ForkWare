"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getSession } from "@/app/actions/auth-supabase";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

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

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isFirstFetchRef = useRef(true);

  const fetchUser = useCallback(async () => {
    // Only show the global loading state on the first fetch
    if (isFirstFetchRef.current) {
      setLoading(true);
    }

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("useUser: Session fetch timeout, setting loading to false");
      setLoading(false);
    }, 5000); // 5 second timeout

    try {
      console.log("useUser: Fetching session...");
      const session = await getSession();
      console.log("useUser: Session result:", session);
      if (session && session.user) {
        console.log("useUser: Setting user:", session.user);
        setUser(session.user as UserProfile);
      } else {
        console.log("useUser: No session or user, setting user to null");
        setUser(null);
      }
    } catch (error) {
      console.error("Session fetch error:", error);
      setUser(null);
    } finally {
      clearTimeout(timeoutId);
      if (isFirstFetchRef.current) {
        setLoading(false);
        isFirstFetchRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    fetchUser();

    // Listen for storage events (logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "session" && e.newValue === null) {
        setUser(null);
      }
    };

    // Listen for logout events
    const handleLogout = () => {
      setUser(null);
    };

    // Listen for login events
    const handleLogin = () => {
      console.log("useUser: Login event received, refetching user...");
      fetchUser();
    };

    // Add event listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("logout", handleLogout);
    window.addEventListener("login", handleLogin);

    // Refresh session when tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchUser();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Set up periodic session check (every 5 minutes, only when visible)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchUser();
      }
    }, 300000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("logout", handleLogout);
      window.removeEventListener("login", handleLogin);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [fetchUser]);

  return { user, loading, mutate: fetchUser };
}
