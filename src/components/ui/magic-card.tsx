"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

export const MagicCard = ({
  className,
  children,
  gradientColor = "#2F8F4E",
  gradientSize = 200,
}: {
  className?: string;
  children: React.ReactNode;
  gradientColor?: string;
  gradientSize?: number;
}) => {
  const mouseX = useRef<number>(0);
  const mouseY = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.current = e.clientX - rect.left;
        mouseY.current = e.clientY - rect.top;
      }
    };

    const currentCardRef = cardRef.current;
    if (currentCardRef) {
      currentCardRef.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (currentCardRef) {
        currentCardRef.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border p-6",
        "bg-background/80 shadow-lg",
        // light
        "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)]",
        // dark
        "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_2px_4px_rgba(255,255,255,0.05),0_12px_24px_rgba(255,255,255,0.05)]",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500",
          isHovering ? "opacity-100" : "opacity-0",
        )}
        style={
          {
            "--x": `${mouseX.current}px`,
            "--y": `${mouseY.current}px`,
            "--gradient-size": `${gradientSize}px`,
            "--gradient-color": gradientColor,
            background:
              "radial-gradient(var(--gradient-size) circle at var(--x) var(--y), var(--gradient-color), transparent 100%)",
          } as React.CSSProperties
        }
      />
      {children}
    </div>
  );
};