"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "up" | "fade" | "left" | "right" | "scale";
  delay?: number;
  duration?: number;
};

const offsets: Record<NonNullable<RevealProps["variant"]>, Variants> = {
  up: {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  left: {
    hidden: { opacity: 0, x: -28 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 28 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 },
  },
};

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

const mobileHiddenClasses: Record<NonNullable<RevealProps["variant"]>, string> = {
  up: "translate-y-7 opacity-0",
  fade: "opacity-0",
  left: "-translate-x-7 opacity-0",
  right: "translate-x-7 opacity-0",
  scale: "scale-[0.96] opacity-0",
};

function subscribeFinePointer(callback: () => void) {
  const query = window.matchMedia(FINE_POINTER_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function getFinePointerServerSnapshot() {
  return false;
}

export function Reveal({
  children,
  className,
  variant = "up",
  delay = 0,
  duration = 0.7,
}: RevealProps) {
  const shouldReduceMotion = usePrefersReducedMotion();
  const hasFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot,
  );
  const mobileRef = useRef<HTMLDivElement>(null);
  const [mobileVisible, setMobileVisible] = useState(false);

  useEffect(() => {
    if (hasFinePointer || shouldReduceMotion || mobileVisible) return;
    const element = mobileRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setMobileVisible(true);
        observer.disconnect();
      },
      { rootMargin: "-10% 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasFinePointer, shouldReduceMotion, mobileVisible]);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  if (!hasFinePointer) {
    return (
      <div
        ref={mobileRef}
        className={cn(
          "transition-[opacity,transform] ease-[var(--ease-glass)]",
          mobileVisible
            ? "translate-x-0 translate-y-0 scale-100 opacity-100"
            : mobileHiddenClasses[variant],
          className,
        )}
        style={{
          transitionDelay: `${delay}s`,
          transitionDuration: `${duration}s`,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      variants={offsets[variant]}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
