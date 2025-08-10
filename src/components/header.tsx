"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { KindPlateLogo } from "@/components/logo";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/app/actions/auth-supabase";

export function Header() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      // Dispatch logout event to update useUser hook state
      window.dispatchEvent(new Event("logout"));
      router.push("/login");
    }
  };

  const navItems = [
    { name: "Home", href: "/", requiresAuth: false },
    {
      name: "Canteen",
      href: "/canteen",
      requiresAuth: true,
      allowedRoles: ["Admin", "Canteen / Event"],
    },
    { name: "Volunteer", href: "/dashboard", requiresAuth: false },
    { name: "Analytics", href: "/analytics", requiresAuth: false },
    { name: "Profile", href: "/profile", requiresAuth: true },
    {
      name: "Admin",
      href: "/admin",
      requiresAuth: true,
      allowedRoles: ["Admin"],
    },
  ];

  const handleNavigation = (item: (typeof navItems)[0]) => {
    if (item.requiresAuth && !user) {
      toast({
        title: "Authentication Required",
        description: "Please login first to access this section.",
        variant: "destructive",
      });
      router.push(`/login?redirect=${encodeURIComponent(item.href)}`);
      return;
    }

    // Check role-based access
    if (item.allowedRoles && user && !item.allowedRoles.includes(user.role)) {
      toast({
        title: "Access Denied",
        description: `You need ${item.allowedRoles.join(
          " or "
        )} role to access this section.`,
        variant: "destructive",
      });
      return;
    }

    router.push(item.href);
  };

  return (
    <header className="hidden md:flex sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 group">
            <div className="transition-transform duration-300 group-hover:scale-105">
              <KindPlateLogo />
            </div>
          </Link>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => {
            // Hide navigation items that require authentication when no user is logged in
            if (item.requiresAuth && !user) {
              return null;
            }

            // Hide navigation items based on role when user is logged in
            if (
              item.allowedRoles &&
              user &&
              !item.allowedRoles.includes(user.role)
            ) {
              return null;
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-3 py-2 text-muted-foreground hover:text-foreground transition-all duration-300 group"
              >
                {item.name}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <form action={handleLogout}>
              <Button
                variant="outline"
                size="sm"
                type="submit"
                className="transition-all duration-300 hover:scale-105 hover:shadow-md group"
              >
                <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                  Logout
                </span>
              </Button>
            </form>
          ) : (
            <Link href="/login">
              <Button
                size="sm"
                className="transition-all duration-300 hover:scale-105 hover:shadow-glow group"
              >
                <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                  Login
                </span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
