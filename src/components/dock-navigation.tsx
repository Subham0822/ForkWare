'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { Home, Utensils, Users, BarChart2 } from "lucide-react";
import { Dock, DockItem } from "./ui/dock";

export function DockNavigation() {

  const navItems = [
    { label: "Home", href: "/", icon: Home, tooltip: "Home" },
    { label: "Canteen", href: "/canteen", icon: Utensils, tooltip: "Canteen" },
    { label: "Volunteer", href: "/dashboard", icon: Users, tooltip: "Volunteer" },
    { label: "Analytics", href: "/analytics", icon: BarChart2, tooltip: "Analytics" },
  ];

  return (
    <footer className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        <Dock>
          {navItems.map((item) => (
             <DockItem key={item.label} tooltip={item.tooltip}>
                <Link href={item.href}>
                  <Button variant="ghost" size="icon">
                    <item.icon />
                  </Button>
                </Link>
            </DockItem>
          ))}
        </Dock>
    </footer>
  );
}
