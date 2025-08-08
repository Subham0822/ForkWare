'use client';

import Link from "next/link";
import { KindPlateLogo } from "./logo";
import { Button } from "./ui/button";
import { UserCircle, LogIn, Home, Utensils, Users, BarChart2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { ThemeToggle } from "./theme-toggle";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Canteen", href: "/canteen", icon: Utensils },
    { label: "Volunteer", href: "/dashboard", icon: Users },
    { label: "Analytics", href: "/analytics", icon: BarChart2 },
];

export function Header() {
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <KindPlateLogo />
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium mx-auto">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80 transition-transform hover:scale-105",
                  pathname === item.href ? "text-foreground" : "text-foreground/60"
                )}
              >
                {item.label}
              </Link>
            ))}
        </nav>
        
        <div className="ml-auto flex flex-1 items-center justify-end space-x-2">
           <ThemeToggle />
          {user ? (
            <Button asChild variant="ghost">
              <Link href="/profile">
                <UserCircle className="h-5 w-5 mr-2" />
                Profile
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost">
              <Link href="/login">
                 <LogIn className="h-5 w-5 mr-2" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
