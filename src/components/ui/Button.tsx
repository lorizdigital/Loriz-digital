"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { springSoft } from "@/lib/motion";

const MotionLink = motion.create(Link);

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  external?: boolean;
};

export function Button({ href, children, variant = "primary", className, external }: ButtonProps) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-[0.95rem] font-medium tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const variants = {
    primary: "bg-accent text-accent-foreground shadow-glass-sm",
    secondary:
      "glass-subtle backdrop-blur-[var(--glass-blur-sm)] text-foreground transition-[background-color,border-color] duration-300 ease-out hover:bg-[rgb(255_255_255/0.52)] hover:border-[rgb(27_27_24/0.12)]",
  };

  const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <MotionLink
      href={href}
      className={cn(base, variants[variant], className)}
      whileHover={{ y: -2, scale: 1.015 }}
      whileTap={{ y: 0, scale: 0.985 }}
      transition={springSoft}
      {...externalProps}
    >
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-[130%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[130%]"
        />
      )}
      <span className="relative">{children}</span>
    </MotionLink>
  );
}
