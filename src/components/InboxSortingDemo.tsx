"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useInView } from "framer-motion";
import { CalendarDays, Check, FileText, MessageSquare, RotateCcw } from "lucide-react";
import { easeGlass } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

/**
 * Animierter Posteingang für die Leistungskarte „KI-Implementierung &
 * Automatisierung". Jeder Vorgang durchläuft vier lesbare Beats: Zögern in der
 * Liste, kurzer Halt (der Entschluss), Flug in die Ablage, Plopp der Ablage als
 * Landebestätigung.
 *
 * Die Sequenz startet einmalig, sobald der Rahmen in den Viewport kommt, und
 * bleibt danach im sortierten Endzustand stehen. Zurücksetzen bricht eine
 * laufende Sequenz sauber ab. Bei prefers-reduced-motion wird ohne Bewegung
 * direkt der Endzustand gezeigt.
 *
 * Farben laufen über die Theme-Tokens. Nur die gemalten Flächen (Kopfzeile,
 * Bildschirm, Vorgangskarten) tragen eine dark:-Variante.
 */

type TrayId = "anfragen" | "termine" | "belege";

const TRAYS: Array<{ id: TrayId; label: string; icon: typeof CalendarDays }> = [
  { id: "anfragen", label: "Anfragen", icon: MessageSquare },
  { id: "termine", label: "Termine", icon: CalendarDays },
  { id: "belege", label: "Belege", icon: FileText },
];

const ITEMS: Array<{ id: string; label: string; tray: TrayId }> = [
  { id: "item-1", label: "Anfrage über das Formular", tray: "anfragen" },
  { id: "item-2", label: "Terminwunsch für Donnerstag", tray: "termine" },
  { id: "item-3", label: "Rechnung eines Lieferanten", tray: "belege" },
  { id: "item-4", label: "Rückfrage zum Angebot", tray: "anfragen" },
];

/**
 * Flugweite bis zur Mitte der jeweiligen Ablagezeile, im Browser gemessen
 * (Desktop 185/217/249, Mobil 184/216/248 – die Höhen sind breitenunabhängig).
 * Zu kurze Werte sehen aus, als lösten sich die Vorgänge unterwegs auf.
 */
const TRAY_OFFSET: Record<TrayId, number> = {
  anfragen: 185,
  termine: 217,
  belege: 249,
};

/**
 * Flugdauer je Ablage, so gewählt dass die Geschwindigkeit konstant bleibt
 * (rund 340 px/s). Gleiche Dauer bei ungleicher Strecke wirkt unphysikalisch.
 */
const FLIGHT_MS: Record<TrayId, number> = {
  anfragen: 560,
  termine: 640,
  belege: 730,
};

/** Zögerdauer je Durchgang – nimmt ab, weil das Muster ab dem dritten Mal bekannt ist. */
const THINK_MS = [480, 420, 360, 320];

/** Ruhe zwischen Flugende und dem nächsten Zögern. */
const GAP_MS = [240, 220, 200, 0];

/** Kurzer Halt nach dem Wackeln: macht den Entschluss vor dem Absprung lesbar. */
const ANTICIPATION_MS = 140;

/** Der Plopp startet knapp vor dem Aufschlag, sonst wirkt die Ablage träge. */
const PLOP_LEAD_MS = 60;

const INTRO_MS = 620;

export function InboxSortingDemo() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [instant, setInstant] = useState(false);
  const quick = prefersReducedMotion || instant;
  const d = (seconds: number) => (quick ? 0 : seconds);

  const [visible, setVisible] = useState(false);
  const [sortedCount, setSortedCount] = useState(0);
  /** Getrennt von sortedCount: Der Zähler steigt erst, wenn der Vorgang ankommt. */
  const [landedCount, setLandedCount] = useState(0);
  const [thinkingId, setThinkingId] = useState<string | null>(null);
  const [highlightTray, setHighlightTray] = useState<TrayId | null>(null);

  // Der Plopp läuft über Steuerungen statt über einen Zustand: So spielt die
  // Keyframe-Folge immer vollständig ab und muss nicht zurückgesetzt werden.
  const plopAnfragen = useAnimationControls();
  const plopTermine = useAnimationControls();
  const plopBelege = useAnimationControls();
  const plopControls: Record<TrayId, typeof plopAnfragen> = {
    anfragen: plopAnfragen,
    termine: plopTermine,
    belege: plopBelege,
  };

  const frameRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const inView = useInView(frameRef, { once: true, amount: 0.4 });

  const pending = ITEMS.slice(sortedCount);
  const counts = ITEMS.slice(0, landedCount).reduce<Record<string, number>>((acc, item) => {
    acc[item.tray] = (acc[item.tray] ?? 0) + 1;
    return acc;
  }, {});
  // An der Landung festgemacht, nicht am Abflug: Das Fazit darf nicht erscheinen,
  // während der letzte Vorgang noch unterwegs ist.
  const done = landedCount === ITEMS.length;

  // Abbrechbarer Warte-Helfer, wie in der Webseiten-Demo: Timeout-Handles
  // werden gesammelt und beim Unmount vollständig geräumt.
  function wait(ms: number) {
    return new Promise<void>((resolve) => {
      const id = setTimeout(() => {
        timeoutsRef.current.delete(id);
        resolve();
      }, ms);
      timeoutsRef.current.add(id);
    });
  }

  function playPlop(tray: TrayId) {
    setHighlightTray(tray);
    void plopControls[tray].start(
      { scale: [1, 1.09, 0.98, 1], y: [0, 2, -1, 0] },
      { duration: d(0.4), ease: easeGlass, times: [0, 0.34, 0.62, 1] },
    );
    void wait(400).then(() => setHighlightTray((current) => (current === tray ? null : current)));
  }

  function showEndState() {
    setVisible(true);
    setThinkingId(null);
    setHighlightTray(null);
    setSortedCount(ITEMS.length);
    setLandedCount(ITEMS.length);
  }

  // Eine einzelne, lineare Sequenz. Nach jedem await wird geprüft, ob dieser
  // Lauf noch aktuell ist – sonst bricht er sofort und sauber ab.
  async function runSequence(myRunId: number) {
    const isCurrent = () => runIdRef.current === myRunId;

    setVisible(true);
    await wait(INTRO_MS);

    for (let i = 0; i < ITEMS.length; i += 1) {
      const item = ITEMS[i];
      const flight = FLIGHT_MS[item.tray];

      if (!isCurrent()) return;
      setThinkingId(item.id); // wackelt: die Ablage wird gesucht
      await wait(THINK_MS[i]);

      if (!isCurrent()) return;
      setThinkingId(null); // steht still: entschieden
      await wait(ANTICIPATION_MS);

      if (!isCurrent()) return;
      setSortedCount(i + 1); // Abflug
      await wait(flight - PLOP_LEAD_MS);

      if (!isCurrent()) return;
      playPlop(item.tray); // Landung, Zähler zieht mit
      setLandedCount(i + 1);
      await wait(PLOP_LEAD_MS + GAP_MS[i]);
    }
  }

  useEffect(() => {
    if (!inView) return;

    runIdRef.current += 1;
    const myRunId = runIdRef.current;

    if (prefersReducedMotion) {
      // Über wait() verzögert, damit setState nicht synchron im Effekt-Body läuft.
      wait(0).then(() => {
        if (runIdRef.current === myRunId) showEndState();
      });
    } else {
      runSequence(myRunId);
    }

    // Strict Mode startet Effekte in der Entwicklung probeweise zweimal – der
    // erste Lauf wird invalidiert und aufgeräumt.
    const timeouts = timeoutsRef.current;
    return () => {
      runIdRef.current += 1;
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, prefersReducedMotion]);

  function handleReplay() {
    runIdRef.current += 1;
    const myRunId = runIdRef.current;
    setInstant(true);
    setSortedCount(0);
    setLandedCount(0);
    setThinkingId(null);
    setHighlightTray(null);
    requestAnimationFrame(() => {
      setInstant(false);
      if (prefersReducedMotion) {
        showEndState();
        return;
      }
      runSequence(myRunId);
    });
  }

  return (
    <div className="flex h-full flex-col justify-center p-8 sm:p-10">
      <motion.div
        ref={frameRef}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={visible ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ duration: d(0.5), ease: easeGlass }}
        className="glass-elevated relative overflow-hidden rounded-lg"
      >
        <div className="flex items-center gap-2 border-b border-black/[0.06] bg-white/[0.94] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.05]">
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-clay">
            Posteingang
          </span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={handleReplay}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[0.65rem] font-medium text-foreground/75 shadow-soft transition-colors hover:border-clay/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <RotateCcw aria-hidden="true" className="h-3 w-3" strokeWidth={2} />
            Neu abspielen
          </button>
        </div>

        <div className="bg-white/[0.94] p-4 sm:p-5 dark:bg-background">
          {/* Eingang: die Fläche ist auf die volle Liste dimensioniert, damit
              die Karte beim Leerräumen nicht in der Höhe springt. */}
          <div className="relative min-h-[168px]">
            <AnimatePresence initial={false}>
              {pending.map((item) => {
                const thinking = thinkingId === item.id;
                // Der zögernde Vorgang ist immer der oberste der Restliste,
                // sein Index in ITEMS ist deshalb sortedCount.
                const thinkSeconds = (THINK_MS[sortedCount] ?? THINK_MS[0]) / 1000;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={
                      thinking
                        ? {
                            opacity: 1,
                            y: 0,
                            x: [0, -3, 2.5, -1.5, 0],
                            rotate: [0, -1.2, 0.9, -0.4, 0],
                          }
                        : { opacity: 1, y: 0, x: 0, rotate: 0 }
                    }
                    exit={{
                      opacity: [1, 1, 0],
                      y: TRAY_OFFSET[item.tray],
                      scale: 0.9,
                      transition: {
                        duration: d(FLIGHT_MS[item.tray] / 1000),
                        // Leicht beschleunigend statt stark ausbremsend: ein
                        // Wurf, kein Heranschweben.
                        ease: [0.35, 0, 0.25, 1],
                        // Eigene Kurve, damit das Ausblenden erst auf den
                        // letzten Zentimetern einsetzt und der Vorgang auf
                        // der ganzen Strecke sichtbar bleibt.
                        opacity: {
                          duration: d(FLIGHT_MS[item.tray] / 1000),
                          times: [0, 0.82, 1],
                          ease: "linear",
                        },
                      },
                    }}
                    transition={
                      thinking
                        ? {
                            duration: d(thinkSeconds),
                            ease: "easeInOut",
                            times: [0, 0.25, 0.5, 0.75, 1],
                          }
                        : { duration: d(0.3), ease: easeGlass }
                    }
                    className={cn(
                      "mb-2 flex items-center gap-2.5 rounded-md border px-3 py-2 transition-colors duration-300",
                      thinking
                        ? "border-clay/40 bg-clay/[0.08] dark:bg-clay/[0.14]"
                        : "border-black/[0.05] bg-white/80 dark:border-white/[0.07] dark:bg-white/[0.05]",
                    )}
                  >
                    <motion.span
                      aria-hidden="true"
                      animate={thinking ? { scale: [1, 1.7, 1, 1.7, 1] } : { scale: 1 }}
                      transition={{ duration: d(thinking ? thinkSeconds : 0.25), ease: "easeInOut" }}
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay"
                    />
                    <span className="truncate text-xs text-foreground/80">{item.label}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <AnimatePresence>
              {done ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: d(0.46), ease: easeGlass, delay: d(0.12) }}
                  className="absolute inset-0 flex items-center justify-center gap-2"
                >
                  <Check aria-hidden="true" className="h-3.5 w-3.5 text-clay" strokeWidth={2.5} />
                  <span className="text-xs text-muted-foreground">Alles einsortiert</span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Ablagen: beim Eintreffen federt die Zeile und der Zähler zieht an. */}
          <div className="mt-3 space-y-2 border-t border-black/[0.06] pt-3 dark:border-white/[0.08]">
            {TRAYS.map((tray) => {
              const count = counts[tray.id] ?? 0;
              const Icon = tray.icon;

              return (
                <motion.div
                  key={tray.id}
                  animate={plopControls[tray.id]}
                  className="relative flex items-center gap-2.5 rounded-md px-1 py-0.5"
                >
                  {/* Kurzes Aufleuchten der Zeile als Landebestätigung */}
                  <motion.span
                    aria-hidden="true"
                    initial={false}
                    animate={{ opacity: highlightTray === tray.id ? 1 : 0 }}
                    transition={{
                      duration: d(highlightTray === tray.id ? 0.14 : 0.4),
                      ease: easeGlass,
                    }}
                    className="pointer-events-none absolute inset-0 rounded-md bg-clay/[0.12] dark:bg-clay/[0.18]"
                  />
                  <Icon
                    aria-hidden="true"
                    className="relative h-3.5 w-3.5 shrink-0 text-foreground/45"
                    strokeWidth={2}
                  />
                  <span className="relative flex-1 text-xs text-foreground/70">{tray.label}</span>
                  {/* Der Schlüssel wechselt mit dem Zählstand – dadurch spielt die
                      Pop-Bewegung bei jeder Landung neu an. */}
                  <motion.span
                    key={`${tray.id}-${count}`}
                    initial={count === 0 ? false : { scale: 1.3 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: d(0.36), ease: easeGlass }}
                    className="relative min-w-[1.5rem] rounded-full bg-accent-soft px-1.5 py-0.5 text-center text-[0.7rem] font-medium tabular-nums text-foreground/70"
                  >
                    {count}
                  </motion.span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
