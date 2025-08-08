'use client';

import Link from "next/link";
import { KindPlateLogo } from "./logo";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, UserCircle } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const { user, profile } = useUser();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Canteen", href: "/canteen" },
    { label: "Volunteer", href: "/dashboard" },
    { label: "Analytics", href: "/analytics" },
  ];
  
  const adminNav = { label: "Admin", href: "/admin" };

  return (
    <header className="bg-background/80 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <KindPlateLogo />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
           {profile?.role === 'Admin' && (
             <Link
              href={adminNav.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {adminNav.label}
            </Link>
           )}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <Button variant="ghost" asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <UserCircle />
                  My Profile
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/login?signup=true">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 p-6">
                  <Link href="/">
                    <KindPlateLogo />
                  </Link>
                  <nav className="flex flex-col gap-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="text-lg font-medium"
                      >
                        {item.label}
                      </Link>
                    ))}
                    {profile?.role === 'Admin' && (
                       <Link
                        href={adminNav.href}
                        className="text-lg font-medium"
                      >
                        {adminNav.label}
                      </Link>
                    )}
                  </nav>
                  <div className="mt-auto flex flex-col gap-2 border-t pt-6">
                     {user ? (
                      <Button variant="outline" asChild>
                         <Link href="/profile">View Profile</Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" asChild>
                          <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild>
                          <Link href="/login?signup=true">Sign Up</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
