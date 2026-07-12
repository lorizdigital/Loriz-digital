import { cn } from "@/lib/cn";

export type GlassDepth = "subtle" | "medium" | "floating" | "elevated";

const depthClasses: Record<GlassDepth, string> = {
  subtle: "glass-subtle backdrop-blur-[var(--glass-blur-sm)]",
  medium: "glass-medium backdrop-blur-[var(--glass-blur-md)]",
  floating: "glass-floating backdrop-blur-[var(--glass-blur-lg)]",
  elevated: "glass-elevated backdrop-blur-[var(--glass-blur-lg)]",
};

export function GlassSurface({
  depth = "medium",
  className,
  children,
}: {
  depth?: GlassDepth;
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(depthClasses[depth], className)}>{children}</div>;
}
