import type {
  AvailableDay,
  BookingAvailabilityAdapter,
  BookingService,
  CreateBookingRequest,
} from "./types";

const SERVICES: BookingService[] = [
  {
    id: "first-conversation",
    title: "Unverbindliches Erstgespräch",
    durationMinutes: 30,
    description: "Ihr Vorhaben in Ruhe einordnen",
  },
  {
    id: "project-review",
    title: "Projekt-Check",
    durationMinutes: 45,
    description: "Eine bestehende Idee konkretisieren",
  },
];

const DAYS: AvailableDay[] = [
  {
    date: "2026-07-20",
    shortWeekday: "Mo",
    dayOfMonth: "20",
    accessibleLabel: "Montag, 20. Juli 2026, nicht verfügbar",
    available: false,
    slots: [],
  },
  {
    date: "2026-07-21",
    shortWeekday: "Di",
    dayOfMonth: "21",
    accessibleLabel: "Dienstag, 21. Juli 2026, verfügbar",
    available: true,
    slots: [
      { id: "2026-07-21-0930", time: "09:30" },
      { id: "2026-07-21-1100", time: "11:00" },
      { id: "2026-07-21-1430", time: "14:30" },
    ],
  },
  {
    date: "2026-07-22",
    shortWeekday: "Mi",
    dayOfMonth: "22",
    accessibleLabel: "Mittwoch, 22. Juli 2026, verfügbar",
    available: true,
    slots: [
      { id: "2026-07-22-1000", time: "10:00" },
      { id: "2026-07-22-1330", time: "13:30" },
      { id: "2026-07-22-1600", time: "16:00" },
    ],
  },
  {
    date: "2026-07-23",
    shortWeekday: "Do",
    dayOfMonth: "23",
    accessibleLabel: "Donnerstag, 23. Juli 2026, nicht verfügbar",
    available: false,
    slots: [],
  },
  {
    date: "2026-07-24",
    shortWeekday: "Fr",
    dayOfMonth: "24",
    accessibleLabel: "Freitag, 24. Juli 2026, verfügbar",
    available: true,
    slots: [
      { id: "2026-07-24-0900", time: "09:00" },
      { id: "2026-07-24-1200", time: "12:00" },
      { id: "2026-07-24-1500", time: "15:00" },
    ],
  },
];

function cloneServices(): BookingService[] {
  return SERVICES.map((service) => ({ ...service }));
}

function cloneDays(): AvailableDay[] {
  return DAYS.map((day) => ({
    ...day,
    slots: day.slots.map((slot) => ({ ...slot })),
  }));
}

export const demoBookingAdapter: BookingAvailabilityAdapter = {
  async listServices(signal) {
    signal?.throwIfAborted();
    return cloneServices();
  },

  async listAvailability({ serviceId }, signal) {
    signal?.throwIfAborted();
    if (!SERVICES.some((service) => service.id === serviceId)) return [];
    return cloneDays();
  },

  async createBooking(request, { idempotencyKey, signal }) {
    signal?.throwIfAborted();
    validateDemoSelection(request);
    return {
      id: `demo-${idempotencyKey}`,
      status: "demo-confirmed",
    };
  },
};

export function validateDemoSelection(request: CreateBookingRequest): void {
  const service = SERVICES.find((item) => item.id === request.serviceId);
  const day = DAYS.find((item) => item.date === request.date && item.available);
  const slot = day?.slots.find((item) => item.id === request.slotId);

  if (!service || !day || !slot) {
    throw new Error("Die Demo-Auswahl ist nicht verfügbar.");
  }
}
