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
  const hasStartedRef = useRef(false);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    function wait(ms: number) {
      return new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          timeoutsRef.current.delete(id);
          resolve();
        }, ms);
        timeoutsRef.current.add(id);
      });
    }

    if (shouldReduceMotion) {
      wait(0).then(() => {
        setTextStep("founder");
        setLogoStart(true);
      });
      return;
    }

    async function run() {
      setTextStep("claim");
      await wait(350);
      setTextStep("description");
      await wait(350);
      setTextStep("cta");
      setLogoStart(true);
      await wait(350);
      setTextStep("founder");
    }
    run();
  }, [shouldReduceMotion]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    };
  }, []);

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
    <section id="start" className="relative overflow-hidden pb-20 pt-36 sm:pt-44 lg:pb-28 lg:pt-52">
      <AtmosphericBackground />

      <Container className="grid items-center gap-16 lg:grid-cols-[0.86fr_1.14fr] lg:gap-14">
        <motion.div ref={textRef} style={{ x: textMouseX, y: textY }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={textStepAtLeast(textStep, "claim") ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: easeGlass }}
            className="balance text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-[3.6rem]"
          >
            {siteConfig.slogan}
          </motion.h1>

          {/* Mobil/Tablet: Logo direkt unter der Headline statt ganz unten nach
              der CTA-Reihe – wirkt als Begleiter der Marke, nicht als Anhang.
              Ab lg übernimmt die Instanz in der zweiten Grid-Spalte. */}
          <div className="my-5 sm:my-6 lg:hidden">
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
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
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

        <div className="hidden lg:contents">
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
