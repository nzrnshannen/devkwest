"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface BackgroundGradientProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  containerClassName?: string;
}

export function BackgroundGradient({
  children,
  className,
  containerClassName,
  ...props
}: BackgroundGradientProps) {
  return (
    <div className={cn("relative p-[2px] group", containerClassName)}>
      <motion.div
        className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-lime-500 opacity-75 blur-sm group-hover:opacity-100 transition duration-500",
          className
        )}
        {...props}
      />
      <div className="relative bg-card rounded-xl">{children}</div>
    </div>
  );
}
