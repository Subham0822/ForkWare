'use client';

import Link from "next/link";
import { KindPlateLogo } from "./logo";
import { Button } from "./ui/button";
import { UserCircle, LogIn } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <KindPlateLogo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <ThemeToggle />
          {user ? (
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <UserCircle className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                  <LogIn className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
