import { MapPin, MessagesSquare, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const signals = [
  { icon: UserRound, label: "Ein fester Ansprechpartner – von der Idee bis zum Livegang" },
  { icon: MessagesSquare, label: "Klar und verständlich statt Fachchinesisch" },
  { icon: MapPin, label: "Aus Calden – persönlich statt anonym" },
];

export function TrustSignals({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        "flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2",
        className,
      )}
    >
      {signals.map((signal) => (
        <li key={signal.label} className="flex items-center gap-2 text-sm text-muted-foreground">
          <signal.icon aria-hidden="true" className="h-4 w-4 shrink-0 text-clay" strokeWidth={1.75} />
          {signal.label}
        </li>
      ))}
    </ul>
  );
}
