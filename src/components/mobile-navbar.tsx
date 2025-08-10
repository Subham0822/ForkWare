"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { KindPlateLogo } from "@/components/logo";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/app/actions/auth-supabase";
import { Menu, X } from "lucide-react";

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setIsOpen(false);
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
      setIsOpen(false);
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
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <KindPlateLogo />
            <span className="font-bold">ForkWare</span>
          </Link>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={toggleMenu} />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed right-0 top-16 z-50 h-full w-80 transform bg-background border-l shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Navigation Items */}
          <nav className="flex-1 p-6">
            <div className="space-y-4">
              {navItems.map((item) => {
                // Hide navigation items based on role
                if (
                  item.allowedRoles &&
                  user &&
                  !item.allowedRoles.includes(user.role)
                ) {
                  return null;
                }

                // Hide Profile button when not authenticated
                if (item.name === "Profile" && !user) {
                  return null;
                }

                if (item.requiresAuth && !user) {
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item)}
                      className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      {item.name}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block p-3 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t p-6">
            {user ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Logged in as: {user.name}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
