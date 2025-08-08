
'use client';

import Link from "next/link";
import { Home, Utensils, Users, BarChart2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dock, DockItem } from "./ui/dock";

const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Canteen", href: "/canteen", icon: Utensils },
    { label: "Volunteer", href: "/dashboard", icon: Users },
    { label: "Analytics", href: "/analytics", icon: BarChart2 },
];

export function DockNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-10 inset-x-0 w-full z-50 flex justify-center">
      <Dock>
        {navItems.map((item) => (
          <DockItem key={item.label} tooltip={item.label}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center justify-center rounded-full w-12 h-12 bg-background/80 backdrop-blur-md shadow-inner ring-1 ring-black/10 dark:ring-white/10 transition-transform hover:scale-105",
                pathname === item.href 
                  ? "bg-primary/70 text-primary-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          </DockItem>
        ))}
      </Dock>
    </div>
  );
}
