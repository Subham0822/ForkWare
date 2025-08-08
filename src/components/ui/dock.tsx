"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { PropsWithChildren, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export interface DockProps extends VariantProps<typeof dockVariants> {
  className?: string;
  magnification?: number;
  distance?: number;
  children: React.ReactNode;
}

const dockVariants = cva(
  "flex h-16 items-center justify-center rounded-2xl border bg-background/50 p-2 shadow-lg backdrop-blur-md"
);

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      magnification = 15,
      distance = 80,
      ...props
    },
    ref
  ) => {
    const mouseX = useMotionValue(Infinity);

    const renderChildren = () => {
      return React.Children.map(
        children as React.ReactElement<PropsWithChildren<DockItemProps>>[],
        (child) => {
          if (React.isValidElement(child)) {
            // Ensure we are cloning only DockItem and passing the required props.
            return React.cloneElement(child, {
              magnification,
              distance,
              mouseX,
            });
          }
          return child;
        }
      );
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        {...props}
        className={cn(dockVariants({ className }), className)}
      >
        <div className="flex items-end gap-2">{renderChildren()}</div>
      </motion.div>
    );
  }
);

Dock.displayName = "Dock";

export interface DockItemProps {
  children: React.ReactNode;
  magnification?: number;
  distance?: number;
  mouseX?: ReturnType<typeof useMotionValue<number>>;
  className?: string;
  tooltip?: string;
}

const DockItem = ({
  children,
  magnification = 15,
  distance = 80,
  mouseX,
  className,
  tooltip,
}: DockItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseXValue = mouseX || useMotionValue(Infinity);

  const distanceCalc = useTransform(mouseXValue, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [40, 40 + magnification, 40]
  );

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const content = (
    <motion.div
      ref={ref}
      style={{ width }}
      className={cn(
        "flex aspect-square items-center justify-center",
        className
      )}
    >
      {children}
    </motion.div>
  );

  if (!tooltip) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

DockItem.displayName = "DockItem";

export { Dock, DockItem };
