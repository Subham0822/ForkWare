'use client';

import Link from "next/link";
import { KindPlateLogo } from "./logo";
import { Button } from "./ui/button";
import { Home, UserCircle, BarChart2, Utensils, Users, LogIn } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { ThemeToggle } from "./theme-toggle";
import { Dock, DockItem } from "./ui/dock";

export function Header() {
  const { user } = useUser();

  const navItems = [
    { label: "Home", href: "/", icon: Home, tooltip: "Home" },
    { label: "Canteen", href: "/canteen", icon: Utensils, tooltip: "Canteen" },
    { label: "Volunteer", href: "/dashboard", icon: Users, tooltip: "Volunteer" },
    { label: "Analytics", href: "/analytics", icon: BarChart2, tooltip: "Analytics" },
  ];

  return (
    <header className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        <Dock>
          <DockItem tooltip="KindPlate">
            <Link href="/">
              <KindPlateLogo/>
            </Link>
          </DockItem>
          {navItems.map((item) => (
             <DockItem key={item.label} tooltip={item.tooltip}>
                <Link href={item.href}>
                  <Button variant="ghost" size="icon">
                    <item.icon />
                  </Button>
                </Link>
            </DockItem>
          ))}

          <DockItem tooltip="Theme">
             <ThemeToggle />
          </DockItem>

          {user ? (
              <DockItem tooltip="My Profile">
                <Link href="/profile">
                  <Button variant="ghost" size="icon">
                    <UserCircle />
                  </Button>
                </Link>
              </DockItem>
            ) : (
              <DockItem tooltip="Login">
                <Link href="/login">
                  <Button variant="ghost" size="icon">
                      <LogIn />
                  </Button>
                </Link>
              </DockItem>
            )}
        </Dock>
    </header>
  );
}
