"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { springLayout } from "@/lib/motion";
import { useIsMounted } from "@/hooks/useIsMounted";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const mounted = useIsMounted();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        className="glass-subtle backdrop-blur-[var(--glass-blur-sm)] relative z-50 flex h-10 w-10 items-center justify-center rounded-full text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Per Portal direkt in <body> gerendert: Die Navigation nutzt Framer
          Motions `layout`-Prop, wodurch ihr Wrapper einen neuen
          Containing Block für `position: fixed`-Kinder erzeugen würde. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  key="scrim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
                />
                <motion.div
                  key="panel"
                  initial={{ opacity: 0, scale: 0.96, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -6 }}
                  transition={springLayout}
                  className="glass-elevated backdrop-blur-[var(--glass-blur-lg)] fixed inset-x-4 bottom-6 top-[5.5rem] z-40 flex flex-col rounded-[1.75rem] p-6"
                >
                  <nav className="flex flex-1 flex-col items-start justify-center gap-1">
                    {siteConfig.navigation.map((item, index) => (
                      <motion.a
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.06 + index * 0.05,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="w-full rounded-2xl px-3 py-3 text-2xl font-medium tracking-tight text-foreground transition-colors hover:bg-black/[0.04]"
                      >
                        {item.label}
                      </motion.a>
                    ))}
                  </nav>
                  <motion.a
                    href="#kontakt"
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.06 + siteConfig.navigation.length * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-base font-medium text-accent-foreground shadow-glass-sm"
                  >
                    Projekt anfragen
                  </motion.a>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
