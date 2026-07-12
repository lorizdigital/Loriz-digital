"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BrowserMockup } from "@/components/BrowserMockup";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { siteConfig } from "@/lib/site";
import { easeGlass } from "@/lib/motion";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { x, y } = usePointerParallax();
  const textRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: textScrollProgress } = useScroll({
    target: textRef,
    offset: ["start end", "end start"],
  });

  const textScrollY = useTransform(textScrollProgress, [0, 1], shouldReduceMotion ? [0, 0] : [8, -8]);
  const textMouseX = useTransform(x, [-1, 1], shouldReduceMotion ? [0, 0] : [-4, 4]);
  const textMouseY = useTransform(y, [-1, 1], shouldReduceMotion ? [0, 0] : [-3, 3]);
  const textY = useTransform([textScrollY, textMouseY], (values: number[]) => values[0] + values[1]);

  return (
    <section id="start" className="relative overflow-hidden pb-20 pt-36 sm:pt-44 lg:pb-28 lg:pt-52">
      <AtmosphericBackground />

      <Container className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <motion.div ref={textRef} style={{ x: textMouseX, y: textY }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeGlass }}
            className="balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]"
          >
            Ihr Unternehmen verdient einen digitalen Auftritt, der genauso
            professionell ist wie Ihre Arbeit.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: easeGlass }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Ich entwickle moderne Webseiten und digitale Lösungen für
            Unternehmen, die professioneller auftreten, einfacher gefunden
            werden und im Alltag Zeit sparen möchten.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: easeGlass }}
            className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Button href="#kontakt" variant="primary">
              Projekt besprechen
            </Button>
            <Button href="#leistungen" variant="secondary">
              Leistungen ansehen
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.34, ease: easeGlass }}
            className="glass-subtle backdrop-blur-[var(--glass-blur-sm)] mt-12 inline-flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2a2a25] to-accent text-[0.8rem] font-medium text-accent-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.35)]">
              LL
            </span>
            <span className="text-sm text-muted-foreground">
              Persönlich entwickelt von {siteConfig.founder}
            </span>
          </motion.div>
        </motion.div>

        <BrowserMockup mouseX={x} mouseY={y} />
      </Container>
    </section>
  );
}
