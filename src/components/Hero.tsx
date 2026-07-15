"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { HeroLogoReveal } from "@/components/HeroLogoReveal";
import { HeroLogoMobileDock } from "@/components/HeroLogoMobileDock";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { siteConfig } from "@/lib/site";
import { easeGlass } from "@/lib/motion";

type TextStep = "idle" | "claim" | "description" | "cta" | "founder";

const TEXT_STEP_ORDER: TextStep[] = ["idle", "claim", "description", "cta", "founder"];

function textStepAtLeast(current: TextStep, target: TextStep) {
  return TEXT_STEP_ORDER.indexOf(current) >= TEXT_STEP_ORDER.indexOf(target);
}

export function Hero() {
  const shouldReduceMotion = usePrefersReducedMotion();
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

  // Gemeinsame Orchestrierung: Text-Stufen laufen linear durch, und genau der
  // Moment, in dem die CTA-Reihe erscheint, ist zugleich das explizite
  // Startsignal für die Logo-Aufbau-Animation (kein zweiter, unabhängiger
  // Timer in HeroLogoReveal).
  const [textStep, setTextStep] = useState<TextStep>("idle");
  const [logoStart, setLogoStart] = useState(false);
  const [logoReady, setLogoReady] = useState(false);
  const [forceMobileLogoComplete, setForceMobileLogoComplete] = useState(false);
  useEffect(() => {
    const timeouts = new Set<ReturnType<typeof setTimeout>>();

    function schedule(callback: () => void, delay: number) {
      const id = setTimeout(() => {
        timeouts.delete(id);
        callback();
      }, delay);
      timeouts.add(id);
    }

    if (shouldReduceMotion) {
      schedule(() => {
        setTextStep("founder");
        setLogoStart(true);
      }, 0);
    } else {
      schedule(() => setTextStep("claim"), 0);
      schedule(() => setTextStep("description"), 350);
      schedule(() => {
        setTextStep("cta");
        setLogoStart(true);
      }, 700);
      schedule(() => setTextStep("founder"), 1050);
    }

    // Der Effekt besitzt seine Timer selbst. Dadurch kann React ihn im
    // Strict Mode probeweise aufraeumen und anschliessend vollstaendig neu
    // starten, ohne dass transparente Hero-Inhalte zurueckbleiben.
    return () => timeouts.forEach(clearTimeout);
  }, [shouldReduceMotion]);

  const handleLogoComplete = useCallback(() => setLogoReady(true), []);

  useEffect(() => {
    if (logoReady) return;

    function onScroll() {
      if (window.scrollY <= 0 || !window.matchMedia("(max-width: 767px)").matches) return;
      setLogoStart(true);
      setForceMobileLogoComplete(true);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [logoReady]);

  return (
    <section
      id="start"
      className="relative overflow-hidden pb-14 pt-32 sm:pb-16 sm:pt-40 lg:pb-28 lg:pt-52"
    >
      <AtmosphericBackground />

      <Container className="grid items-center gap-12 md:grid-cols-[1.2fr_0.8fr] md:gap-8 lg:grid-cols-2 lg:gap-14 xl:grid-cols-[0.86fr_1.14fr]">
        <motion.div ref={textRef} style={{ x: textMouseX, y: textY }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={textStepAtLeast(textStep, "claim") ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: easeGlass }}
            className="balance text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl md:text-[3.25rem] lg:text-[3.6rem]"
          >
            {siteConfig.slogan}
          </motion.h1>

          {/* Mobil: Logo direkt unter der Headline. Ab Tablet steht es platzsparend
              in der zweiten Grid-Spalte; die Scroll-Ueberfuehrung bleibt rein mobil. */}
          <div className="my-5 sm:my-6 md:hidden">
            <HeroLogoMobileDock ready={logoReady}>
              <HeroLogoReveal
                start={logoStart}
                mouseX={x}
                mouseY={y}
                forceComplete={forceMobileLogoComplete || logoReady}
                onComplete={handleLogoComplete}
              />
            </HeroLogoMobileDock>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={textStepAtLeast(textStep, "description") ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: easeGlass }}
            className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground"
          >
            Ihre Arbeit ist erstklassig. Ihr Auftritt sollte es auch sein.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={textStepAtLeast(textStep, "cta") ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: easeGlass }}
            className="mt-10 flex flex-col gap-4 min-[860px]:flex-row min-[860px]:items-center"
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
            animate={textStepAtLeast(textStep, "founder") ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: easeGlass }}
            className="mt-10 flex items-center gap-3"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2a2a25] to-accent text-[0.7rem] font-medium text-accent-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.35)]">
              LL
            </span>
            <span className="text-sm text-muted-foreground">
              Persönlich entwickelt von {siteConfig.founder}
            </span>
          </motion.div>
        </motion.div>

        <div className="hidden md:contents">
          <HeroLogoReveal
            start={logoStart}
            mouseX={x}
            mouseY={y}
            onComplete={handleLogoComplete}
          />
        </div>
      </Container>
    </section>
  );
}
