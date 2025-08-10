"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative transition-all duration-300 hover:scale-110 hover:shadow-md group"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-md bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="glass-card border-0 shadow-xl backdrop-blur-md"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:scale-105 group"
        >
          <Sun className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
          <span
            className={theme === "light" ? "font-semibold text-primary" : ""}
          >
            Light
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:scale-105 group"
        >
          <Moon className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
          <span
            className={theme === "dark" ? "font-semibold text-primary" : ""}
          >
            Dark
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:scale-105 group"
        >
          <Monitor className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          <span
            className={theme === "system" ? "font-semibold text-primary" : ""}
          >
            System
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
