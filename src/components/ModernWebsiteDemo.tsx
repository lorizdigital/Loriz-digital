"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useInView } from "framer-motion";
import { LayoutGrid, RotateCcw, Smartphone, Sparkles } from "lucide-react";
import { easeGlass } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

/**
 * Animierte Mini-Landingpage für die Leistungskarte „Moderne Webseiten".
 * Läuft einmalig an, sobald der Rahmen in den Viewport kommt, und geht danach
 * in einen ruhigen, weiterhin bedienbaren Endzustand über (Button togglet
 * zwischen zwei Mini-Abschnitten). Jede echte Nutzerinteraktion während der
 * automatischen Sequenz beendet diese sofort und sauber.
 */

type Step =
  | "idle"
  | "frame"
  | "chrome"
  | "content"
  | "cursorIn"
  | "cursorMove"
  | "click"
  | "scrolled"
  | "done";

const STEP_ORDER: Step[] = [
  "idle",
  "frame",
  "chrome",
  "content",
  "cursorIn",
  "cursorMove",
  "click",
  "scrolled",
  "done",
];

function stepAtLeast(current: Step, target: Step) {
  return STEP_ORDER.indexOf(current) >= STEP_ORDER.indexOf(target);
}

const DOT_COLORS = ["#e3aba1", "#e8cf9c", "#a9d0b4"];

const FEATURES = [
  { icon: LayoutGrid, tint: "bg-accent" },
  { icon: Smartphone, tint: "bg-clay" },
  { icon: Sparkles, tint: "bg-[#8a9bb0]" },
];

const CURSOR_START = { x: 12, y: 86 };
const CURSOR_BUTTON = { x: 26, y: 70 };

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const dotContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const dotVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
};

export function ModernWebsiteDemo() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [forceInstant, setForceInstant] = useState(false);
  const instant = prefersReducedMotion || forceInstant;
  const d = (seconds: number) => (instant ? 0 : seconds);

  const [step, setStep] = useState<Step>("idle");
  const [section, setSection] = useState<0 | 1>(0);
  const [cursorPos, setCursorPos] = useState(CURSOR_START);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [portHeight, setPortHeight] = useState(0);

  const buttonControls = useAnimationControls();
  const frameRef = useRef<HTMLDivElement>(null);
  const portRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const runIdRef = useRef(0);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const inView = useInView(frameRef, { once: true, amount: 0.4 });

  // Port-Höhe messen (fixe aspect-ratio-Box), damit Sektion 1/2 exakt
  // übereinander gestapelt und per translateY sauber verschoben werden können.
  useEffect(() => {
    const el = portRef.current;
    if (!el) return;
    const update = () => setPortHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Kontrollierter, abbrechbarer Warte-Helfer – Timeout-Handles werden in
  // einem Set gesammelt und beim Unmount vollständig geräumt.
  function wait(ms: number) {
    return new Promise<void>((resolve) => {
      const id = setTimeout(() => {
        timeoutsRef.current.delete(id);
        resolve();
      }, ms);
      timeoutsRef.current.add(id);
    });
  }

  function playClickPulse() {
    return buttonControls.start(
      { scale: [1, 0.96, 1] },
      { duration: d(0.18), ease: easeGlass },
    );
  }

  // Eine einzelne, lineare Orchestrierungs-Sequenz statt verstreuter Timer.
  // Nach jedem await wird geprüft, ob diese Ausführung noch aktuell ist –
  // sonst bricht sie sofort und sauber ab (Nutzer-Übernahme oder Replay).
  async function runSequence(myRunId: number) {
    const isCurrent = () => runIdRef.current === myRunId;

    setStep("frame");
    await wait(520);
    if (!isCurrent()) return;

    setStep("chrome");
    await wait(420);
    if (!isCurrent()) return;

    setStep("content");
    await wait(850);
    if (!isCurrent()) return;

    setStep("cursorIn");
    setCursorVisible(true);
    await wait(260);
    if (!isCurrent()) return;

    setStep("cursorMove");
    setCursorPos(CURSOR_BUTTON);
    await wait(720);
    if (!isCurrent()) return;

    setButtonHover(true);
    await wait(200);
    if (!isCurrent()) return;

    setStep("click");
    await playClickPulse();
    if (!isCurrent()) return;
    setSection(1);
    await wait(650);
    if (!isCurrent()) return;

    setStep("scrolled");
    setButtonHover(false);
    await wait(300);
    if (!isCurrent()) return;

    setCursorVisible(false);
    setStep("done");
  }

  useEffect(() => {
    if (!inView || hasStartedRef.current) return;
    hasStartedRef.current = true;

    if (prefersReducedMotion) {
      // Sinnvoller statischer Endzustand direkt, ohne Cursor und ohne Sequenz.
      // Über wait() verzögert, damit setState nicht synchron im Effekt-Body läuft.
      wait(0).then(() => setStep("done"));
      return;
    }

    runIdRef.current += 1;
    runSequence(runIdRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, prefersReducedMotion]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    };
  }, []);

  function handleUserTakeover() {
    if (step === "done") return;
    runIdRef.current += 1; // invalidiert jede laufende Sequenz
    setForceInstant(true);
    setCursorVisible(false);
    setButtonHover(false);
    setStep("done");
    requestAnimationFrame(() => setForceInstant(false));
  }

  function handleButtonClick() {
    handleUserTakeover();
    setSection((current) => (current === 0 ? 1 : 0));
    playClickPulse();
  }

  function handleReplay() {
    runIdRef.current += 1;
    const myRunId = runIdRef.current;
    setForceInstant(true);
    setSection(0);
    setStep("idle");
    setButtonHover(false);
    setCursorVisible(false);
    requestAnimationFrame(() => {
      setForceInstant(false);
      runSequence(myRunId);
    });
  }

  return (
    <div className="flex h-full flex-col justify-center p-8 sm:p-10">
      <motion.div
        ref={frameRef}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={
          stepAtLeast(step, "frame") ? { opacity: 1, y: 0, scale: 1 } : undefined
        }
        transition={{ duration: d(0.5), ease: easeGlass }}
        className="glass-elevated group relative overflow-hidden rounded-lg"
      >
        {/* Browser-Leiste */}
        <div className="flex items-center gap-2 border-b border-black/[0.06] bg-white/45 px-4 py-3">
          <motion.div
            variants={dotContainerVariants}
            initial="hidden"
            animate={stepAtLeast(step, "chrome") ? "visible" : "hidden"}
            className="flex gap-1.5"
          >
            {DOT_COLORS.map((color, i) => (
              <motion.span
                key={i}
                variants={dotVariants}
                transition={{ duration: d(0.25), ease: easeGlass }}
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </motion.div>
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: stepAtLeast(step, "chrome") ? 1 : 0 }}
            transition={{ duration: d(0.3), delay: d(0.15) }}
            className="ml-2 h-6 flex-1 rounded-full bg-white/70"
          />
          <button
            type="button"
            onClick={handleReplay}
            aria-label="Animation erneut abspielen"
            className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-foreground/40 opacity-0 transition-opacity duration-300 hover:text-foreground/70 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 group-hover:opacity-100"
          >
            <RotateCcw aria-hidden="true" className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>

        {/* Sichtbares Fenster: feste aspect-ratio, Inhalt wird per translateY verschoben */}
        <div
          ref={portRef}
          className="relative w-full overflow-hidden bg-white/[0.94]"
          style={{ aspectRatio: "3 / 2" }}
        >
          <motion.div
            animate={{ y: section === 0 ? 0 : -portHeight }}
            transition={{ duration: d(0.65), ease: easeGlass }}
          >
            {/* Sektion 1: Mini-Hero */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={stepAtLeast(step, "content") ? "visible" : "hidden"}
              className="grid grid-cols-5 content-center gap-x-4 gap-y-3 p-5 sm:p-6"
              style={{ height: portHeight || undefined }}
            >
              <motion.div
                variants={itemVariants}
                transition={{ duration: d(0.35), ease: easeGlass }}
                className="col-span-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  <div className="h-1.5 w-10 rounded-full bg-foreground/60" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="hidden h-1.5 w-6 rounded-full bg-surface-muted sm:block"
                    aria-hidden="true"
                  />
                  <div
                    className="hidden h-1.5 w-6 rounded-full bg-surface-muted sm:block"
                    aria-hidden="true"
                  />
                  <div className="h-4 w-10 rounded-full bg-accent/80" aria-hidden="true" />
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                transition={{ duration: d(0.35), ease: easeGlass }}
                className="col-start-1 col-span-3 row-start-2 space-y-2"
              >
                <div className="h-1.5 w-12 rounded-full bg-clay/60" aria-hidden="true" />
                <div className="h-3 w-full rounded-md bg-foreground/85" aria-hidden="true" />
                <div className="h-3 w-4/5 rounded-md bg-foreground/85" aria-hidden="true" />
                <div className="h-1.5 w-full rounded-full bg-surface-muted" aria-hidden="true" />
              </motion.div>

              <motion.div
                variants={itemVariants}
                transition={{ duration: d(0.35), ease: easeGlass }}
                className="col-start-1 col-span-3 row-start-3"
              >
                {/* Echte Trefferfläche ≥44px (Touch-Ziel-Mindestgröße), die
                    sichtbare Pille bleibt davon unabhängig kompakt. */}
                <button
                  type="button"
                  onClick={handleButtonClick}
                  onPointerEnter={handleUserTakeover}
                  onFocus={handleUserTakeover}
                  aria-label="Beispiel-Website: Abschnitt wechseln"
                  className="-m-2 flex h-11 w-fit items-center rounded-full p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
                >
                  <motion.span
                    animate={buttonControls}
                    className={cn(
                      "inline-flex h-7 w-fit items-center rounded-full px-4 shadow-soft transition-colors hover:bg-accent/90",
                      buttonHover ? "bg-accent/90" : "bg-accent",
                    )}
                  >
                    <span
                      className="h-1.5 w-10 rounded-full bg-accent-foreground/70"
                      aria-hidden="true"
                    />
                  </motion.span>
                </button>
              </motion.div>

              <motion.div
                variants={itemVariants}
                transition={{ duration: d(0.35), ease: easeGlass }}
                aria-hidden="true"
                className="relative col-start-4 col-span-2 row-start-2 row-end-4 overflow-hidden rounded-lg bg-gradient-to-br from-clay/35 via-accent-soft to-[#e4e9ee]"
              />
            </motion.div>

            {/* Sektion 2: kompakte Leistungsübersicht */}
            <div
              className="grid grid-cols-3 content-center gap-2.5 p-5 sm:p-6"
              style={{ height: portHeight || undefined }}
            >
              {FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border/70 bg-surface-muted/50 p-3 text-center"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full",
                      feature.tint,
                    )}
                  >
                    <feature.icon aria-hidden="true" className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                  </span>
                  <div className="h-1.5 w-full rounded-full bg-foreground/25" aria-hidden="true" />
                  <div className="h-1.5 w-2/3 rounded-full bg-foreground/15" aria-hidden="true" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Simulierter Cursor */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute z-20"
            initial={{ left: `${CURSOR_START.x}%`, top: `${CURSOR_START.y}%`, opacity: 0 }}
            animate={{
              left: `${cursorPos.x}%`,
              top: `${cursorPos.y}%`,
              opacity: cursorVisible ? 1 : 0,
            }}
            transition={{ duration: d(0.7), ease: easeGlass }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 1.5 L2 15.5 L6 12 L8.5 17 L10.5 16 L8 11 L13 11 Z"
                fill="var(--foreground)"
                stroke="var(--surface)"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
