import { motion } from "framer-motion";
import { LorizMark } from "@/components/icons/LorizMark";
import { InquiryContactAvatar } from "./InquiryContactAvatar";
import { easeGlass } from "@/lib/motion";

type MotionPreference = {
  reducedMotion: boolean;
};

export function AssistantMessage({
  children,
  reducedMotion,
}: React.PropsWithChildren<MotionPreference>) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.34, ease: easeGlass }}
      className="flex items-start gap-2.5"
    >
      <InquiryContactAvatar className="mt-1 h-7 w-7" imageSize="28px" />
      <p className="max-w-[calc(100%_-_2.4rem)] break-words rounded-[1.1rem] border border-border/70 bg-surface-muted/65 px-4 py-3 text-sm leading-relaxed text-foreground shadow-soft [overflow-wrap:anywhere] sm:max-w-[85%]">
        <span className="sr-only">Loriz Digital: </span>
        {children}
      </p>
    </motion.div>
  );
}

export function UserMessage({
  children,
  reducedMotion,
}: React.PropsWithChildren<MotionPreference>) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.34, ease: easeGlass }}
      className="flex justify-end"
    >
      <p className="max-w-[92%] break-words rounded-[1.1rem] border border-clay/20 bg-accent-soft px-4 py-3 text-sm font-medium leading-relaxed text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.28)] [overflow-wrap:anywhere] sm:max-w-[82%]">
        {children}
      </p>
    </motion.div>
  );
}

export function SendingGlyph({ reducedMotion }: MotionPreference) {
  return (
    <span
      aria-hidden="true"
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-clay/20 bg-surface"
    >
      <motion.span
        animate={
          reducedMotion
            ? undefined
            : { opacity: [0.55, 1, 0.55], scale: [0.96, 1, 0.96] }
        }
        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
        className="flex items-center justify-center"
      >
        <LorizMark className="h-5 w-5 text-foreground" />
      </motion.span>
    </span>
  );
}

export function SuccessGlyph({ reducedMotion }: MotionPreference) {
  return (
    <motion.div
      aria-hidden="true"
      initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.55, ease: easeGlass }}
      className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-clay/20 bg-accent-soft shadow-soft"
    >
      <motion.span
        initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: reducedMotion ? 0 : 0.5,
          delay: reducedMotion ? 0 : 0.08,
          ease: easeGlass,
        }}
        className="flex items-center justify-center"
      >
        <LorizMark className="h-7 w-7 text-foreground" />
      </motion.span>
    </motion.div>
  );
}
