"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MovingBorderProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  borderRadius?: string;
}

export function MovingBorder({
  children,
  className,
  containerClassName,
  borderRadius = "0.75rem",
}: MovingBorderProps) {
  return (
    <div
      className={cn("relative overflow-hidden p-[1px]", containerClassName)}
      style={{ borderRadius }}
    >
      <div
        className="absolute inset-0 animate-shimmer"
        style={{
          borderRadius,
          background:
            "linear-gradient(90deg, transparent, rgba(34,197,94,0.5), transparent)",
        }}
      />
      <div
        className={cn("relative bg-card", className)}
        style={{ borderRadius: `calc(${borderRadius} - 1px)` }}
      >
        {children}
      </div>
    </div>
  );
}

interface SparklesCoreProps {
  className?: string;
}

export function SparklesCore({ className }: SparklesCoreProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
