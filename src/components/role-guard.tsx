"use client";

import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = "/profile",
}: RoleGuardProps) {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      if (!allowedRoles.includes(user.role)) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: `You need ${allowedRoles.join(
            " or "
          )} role to access this page.`,
        });
        router.push(fallbackPath);
      }
    }
  }, [user, loading, allowedRoles, fallbackPath, router, toast]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        Checking permissions...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10 text-center">
        Redirecting to login...
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="container mx-auto py-10 text-center">
        Redirecting due to insufficient permissions...
      </div>
    );
  }

  return <>{children}</>;
}
