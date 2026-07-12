import { cn } from "@/lib/cn";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-clay" aria-hidden="true" />
      {children}
    </span>
  );
}
