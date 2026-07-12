"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Nach oben scrollen"
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.94 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="glass-floating backdrop-blur-[var(--glass-blur-md)] fixed bottom-6 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-glass-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 sm:bottom-8 sm:right-8"
        >
          <ArrowUp aria-hidden="true" className="h-4.5 w-4.5" strokeWidth={2.25} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
