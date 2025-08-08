"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export interface ITypeAnimation {
  text: string;
  className?: string;
  delay?: number;
}

export const TypeAnimation = ({ text, className, delay = 0 }: ITypeAnimation) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) => text.slice(0, latest));

  useEffect(() => {
    const controls = animate(count, text.length, {
      type: "tween",
      delay: delay,
      duration: text.length * 0.05,
      ease: "linear",
    });
    return controls.stop;
  }, [count, text, delay]);

  return (
    <h1 className={cn(className)}>
      <motion.span>{displayText}</motion.span>
      <motion.span
        className="inline-block h-full w-px"
        style={{
          backgroundColor: "hsl(var(--foreground))",
          boxShadow: "0 0 5px hsl(var(--foreground))",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </h1>
  );
};
