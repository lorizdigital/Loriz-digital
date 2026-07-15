"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { springSoft } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const MotionLink = motion.create(Link);

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "md" | "sm";
  className?: string;
  external?: boolean;
  onClick?: () => void;
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  external,
  onClick,
}: ButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const base =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const sizes = {
    md: "px-7 py-3.5 text-[0.95rem]",
    sm: "px-6 py-2.5 text-[0.9rem]",
  };

  const variants = {
    primary: "bg-accent text-accent-foreground shadow-glass-sm",
    secondary:
      "glass-subtle backdrop-blur-[var(--glass-blur-sm)] text-foreground transition-[background-color,border-color] duration-300 ease-out hover:border-clay/20 hover:bg-surface-muted/70",
  };

  const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <MotionLink
      href={href}
      onClick={onClick}
      className={cn(base, sizes[size], variants[variant], className)}
      whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.015 }}
      whileTap={prefersReducedMotion ? undefined : { y: 0, scale: 0.985 }}
      transition={prefersReducedMotion ? { duration: 0 } : springSoft}
      {...externalProps}
    >
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-[130%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[130%] motion-reduce:group-hover:-translate-x-[130%]"
        />
      )}
      <span className="relative">{children}</span>
    </MotionLink>
  );
}
