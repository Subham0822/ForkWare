"use client";

import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useRef, useState } from "react";

export const MagicCard = ({
  className,
  children,
  gradientColor = "hsl(var(--primary))",
  gradientSize = 200,
}: {
  className?: string;
  children: React.ReactNode;
  gradientColor?: string;
  gradientSize?: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const updateMousePosition = useCallback((e: MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cardRef.current.style.setProperty("--x", `${x}px`);
      cardRef.current.style.setProperty("--y", `${y}px`);
    }
  }, []);

  useEffect(() => {
    const currentCardRef = cardRef.current;
    if (currentCardRef) {
      currentCardRef.addEventListener("mousemove", updateMousePosition);
      return () => {
        currentCardRef.removeEventListener("mousemove", updateMousePosition);
      };
    }
  }, [updateMousePosition]);


  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border p-6",
        "bg-background/80",
        // light
        "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)]",
        // dark
        "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_2px_4px_rgba(255,255,255,0.05),0_12px_24px_rgba(255,255,255,0.05)]",
        className,
      )}
      style={{
         "--gradient-size": `${gradientSize}px`,
         "--gradient-color": gradientColor,
      } as React.CSSProperties}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-300",
          isHovering ? "opacity-100" : "opacity-0",
        )}
        style={
          {
            background:
              "radial-gradient(var(--gradient-size) circle at var(--x) var(--y), var(--gradient-color), transparent 100%)",
          } as React.CSSProperties
        }
      />
      {children}
    </div>
  );
};