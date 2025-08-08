"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const BentoCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-background/80 flex flex-col justify-between overflow-hidden rounded-xl",
      // light styles
      "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)]",
      // dark styles
      "transform-gpu dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_2px_4px_rgba(255,255,255,0.05),0_12px_24px_rgba(255,255,255,0.05)]",
      className,
    )}
    {...props}
  />
));

BentoCard.displayName = "BentoCard";

export const BentoGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
      className,
    )}
    {...props}
  />
));

BentoGrid.displayName = "BentoGrid";