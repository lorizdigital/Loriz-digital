"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, RotateCcw } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/data/projects";

type ProjectCoverflowProps = {
  projects: readonly Project[];
};

function circularDistance(index: number, activeIndex: number, length: number) {
  const forward = (index - activeIndex + length) % length;
  return forward > length / 2 ? forward - length : forward;
}

export function ProjectCoverflow({ projects }: ProjectCoverflowProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const activeProject = projects[activeIndex];

  // Beim bewussten Umklappen wandert der Tastaturfokus auf die neu sichtbare
  // Kartenseite. Ohne das bliebe er auf einem Element hinter `aria-hidden`.
  const detailsButtonRef = useRef<HTMLButtonElement>(null);
  const openLinkRef = useRef<HTMLAnchorElement>(null);
  const moveFocusOnFlip = useRef(false);

  // Nach einem Wisch feuert der Browser noch einen Klick auf das Element unter
  // dem Finger. Ohne diese Merkhilfe würde er die Karte umklappen.
  const wasDragged = useRef(false);

  useEffect(() => {
    if (!moveFocusOnFlip.current) return;
    moveFocusOnFlip.current = false;
    if (flippedIndex === null) detailsButtonRef.current?.focus();
    else openLinkRef.current?.focus();
  }, [flippedIndex]);

  const flip = useCallback((index: number | null) => {
    moveFocusOnFlip.current = true;
    setFlippedIndex(index);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + projects.length) % projects.length);
      setFlippedIndex(null);
    },
    [projects.length],
  );

  const showPrevious = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const showNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  const cardPositions = useMemo(
    () => projects.map((_, index) => circularDistance(index, activeIndex, projects.length)),
    [activeIndex, projects],
  );

  if (projects.length === 0) return null;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") showPrevious();
    if (event.key === "ArrowRight") showNext();
  }

  return (
    <div className="mt-12">
      <div
        aria-label="Projektgalerie"
        aria-roledescription="Coverflow"
        role="region"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative min-h-[610px] overflow-hidden rounded-[2rem] border border-border bg-surface-muted/45 px-4 py-10 sm:min-h-[650px] sm:px-8 lg:min-h-[720px] lg:px-12"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[18%] bottom-10 h-20 rounded-full bg-clay/10 blur-3xl" />

        <div className="relative mx-auto h-[540px] max-w-6xl [perspective:1800px] sm:h-[560px] lg:h-[600px]">
          {projects.map((project, index) => {
            const distance = cardPositions[index];
            const isActive = distance === 0;
            const isFlipped = flippedIndex === index;
            const isVisible = Math.abs(distance) <= 2;
            const x = `${distance * 43}%`;
            const rotateY = distance * -32;

            return (
              <motion.article
                key={project.title}
                aria-hidden={!isVisible}
                animate={{
                  opacity: isVisible ? (isActive ? 1 : 0.58) : 0,
                  x,
                  rotateY,
                  scale: isActive ? 1 : 0.78,
                  z: isActive ? 0 : -160,
                }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 210, damping: 28, mass: 0.82 }
                }
                style={{ zIndex: 20 - Math.abs(distance), transformStyle: "preserve-3d" }}
                className={`absolute left-1/2 top-0 h-[500px] w-[min(82vw,650px)] -translate-x-1/2 [transform-style:preserve-3d] sm:h-[540px] lg:h-[580px] ${
                  isActive ? "cursor-default" : "cursor-pointer"
                }`}
                onClick={() => !isActive && goTo(index)}
                onPointerDown={() => {
                  wasDragged.current = false;
                }}
                drag={isActive ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.14}
                onDragStart={() => {
                  wasDragged.current = true;
                }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 70) showPrevious();
                  if (info.offset.x < -70) showNext();
                }}
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                  className="relative h-full w-full [transform-style:preserve-3d]"
                >
                  <div
                    aria-hidden={isFlipped}
                    className="absolute inset-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated [backface-visibility:hidden]"
                  >
                    <div className="relative h-[calc(100%-5rem)] overflow-hidden bg-surface-muted sm:h-[calc(100%-5.5rem)]">
                      <Image
                        src={project.desktopImage}
                        alt={isActive ? project.alt : ""}
                        fill
                        sizes="(min-width: 1024px) 650px, 82vw"
                        className="hidden object-cover object-top sm:block"
                        draggable={false}
                      />
                      <div className="absolute inset-0 flex items-center justify-center p-4 sm:hidden">
                        <div className="relative h-full aspect-[1170/2532] overflow-hidden rounded-[1.5rem] border border-border bg-surface shadow-soft">
                          <Image
                            src={project.mobileImage}
                            alt={isActive ? project.alt : ""}
                            fill
                            sizes="222px"
                            className="object-cover object-top"
                            draggable={false}
                          />
                        </div>
                      </div>
                      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-24 bg-gradient-to-t from-surface/60 to-transparent sm:block" />

                      {/* Mobil ist die Vorschau selbst die naheliegendste
                          Tippfläche. Für Tastatur und Screenreader bleibt der
                          Button in der Titelzeile der einzige Weg, deshalb ist
                          diese Verdopplung bewusst nicht fokussierbar. */}
                      {isActive && (
                        <button
                          type="button"
                          aria-hidden="true"
                          tabIndex={-1}
                          onClick={(event) => {
                            event.stopPropagation();
                            if (wasDragged.current) return;
                            setFlippedIndex(index);
                          }}
                          className="absolute inset-0 cursor-pointer sm:hidden"
                        />
                      )}
                    </div>
                    <div className="flex h-20 items-center justify-between gap-3 px-5 sm:h-[5.5rem] sm:gap-4 sm:px-7">
                      <h3 className="min-w-0 text-lg font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
                        {project.title}
                      </h3>
                      {isActive && (
                        <button
                          type="button"
                          ref={detailsButtonRef}
                          tabIndex={isFlipped ? -1 : 0}
                          onClick={(event) => {
                            event.stopPropagation();
                            flip(index);
                          }}
                          className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
                        >
                          Details anzeigen
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    aria-hidden={!isFlipped}
                    className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-elevated [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-10"
                  >
                    <div>
                      <p className="text-sm font-medium text-clay">{project.title}</p>
                      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-xl">{project.description}</p>
                      <ul className="mt-6 grid gap-2.5 text-sm leading-relaxed text-foreground/85 sm:mt-8 sm:gap-3 sm:text-base">
                        {project.highlights.map((highlight) => (
                          <li key={highlight} className="border-l-2 border-clay/55 pl-3">
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-6 sm:flex sm:flex-wrap sm:items-center sm:gap-3 sm:pt-8">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        ref={isActive ? openLinkRef : undefined}
                        aria-label={`${project.title} in einem neuen Tab öffnen`}
                        tabIndex={isActive && isFlipped ? 0 : -1}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-accent px-3 text-sm font-medium text-accent-foreground transition-transform active:scale-[0.98] sm:gap-2 sm:px-5"
                      >
                        <span className="sm:hidden">Öffnen</span>
                        <span className="hidden sm:inline">Projekt öffnen</span>
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                      </a>
                      <button
                        type="button"
                        tabIndex={isActive && isFlipped ? 0 : -1}
                        onClick={(event) => {
                          event.stopPropagation();
                          flip(null);
                        }}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 sm:gap-2 sm:px-4"
                      >
                        <RotateCcw aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                        Vorschau
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.article>
            );
          })}
        </div>

        <div className="relative mx-auto mt-2 flex max-w-6xl items-center justify-between gap-4 sm:mt-5">
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Vorheriges Projekt anzeigen"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-soft transition-transform hover:-translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 active:scale-[0.98]"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          </button>
          <p className="min-w-0 text-center text-sm text-muted-foreground" aria-live="polite">
            {activeProject.title}
          </p>
          <button
            type="button"
            onClick={showNext}
            aria-label="Nächstes Projekt anzeigen"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-soft transition-transform hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45 active:scale-[0.98]"
          >
            <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="relative mx-auto mt-5 flex max-w-6xl justify-center gap-2" aria-label="Projekt auswählen">
          {projects.map((project, index) => (
            <button
              key={project.title}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`${project.title} anzeigen`}
              aria-current={index === activeIndex ? "true" : undefined}
              className="group inline-flex h-6 items-center justify-center rounded-full px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45"
            >
              <span
                aria-hidden="true"
                className={`h-2 rounded-full transition-all ${
                  index === activeIndex ? "w-7 bg-clay" : "w-2 bg-border group-hover:bg-clay/55"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
