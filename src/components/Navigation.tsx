"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/site";
import { MobileMenu } from "@/components/MobileMenu";
import { Button } from "@/components/ui/Button";
import { LorizMark } from "@/components/icons/LorizMark";
import { springLayout } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4">
      <motion.div
        layout
        transition={springLayout}
        className={cn(
          "flex w-full items-center justify-between backdrop-blur-[2px]",
          scrolled
            ? "glass-floating backdrop-blur-[var(--glass-blur-lg)] mt-3 max-w-[calc(1200px-2rem)] rounded-full px-5 py-3 sm:px-6"
            : "max-w-[1200px] px-6 py-6 sm:px-8 lg:px-10",
        )}
      >
        <Link
          href="#start"
          className="flex items-center gap-2 rounded-full px-2 py-1 text-[1.05rem] font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <LorizMark className="h-5 w-5 shrink-0" />
          Loriz Digital
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-[0.95rem] text-foreground/80 transition-colors duration-300 hover:bg-foreground/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href="#kontakt" variant="primary" size="sm">
            Projekt anfragen
          </Button>
        </div>

        <MobileMenu />
      </motion.div>
    </header>
  );
}
