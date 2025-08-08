"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedListProps {
  className?: string;
  children: ReactNode;
  delay?: number;
}

export const AnimatedList = ({
  className,
  children,
  delay = 0,
}: AnimatedListProps) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence>
        {childrenArray.map((child, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                delay: delay + i * 0.05,
                duration: 0.3,
                ease: "easeOut",
              },
            }}
            exit={{
              opacity: 0,
              y: -20,
              transition: {
                duration: 0.3,
                ease: "easeIn",
              },
            }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};