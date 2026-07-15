export type BookingService = {
  id: string;
  title: string;
  durationMinutes: number;
  description: string;
};

export type AvailableSlot = {
  id: string;
  time: string;
};

export type AvailableDay = {
  date: string;
  shortWeekday: string;
  dayOfMonth: string;
  accessibleLabel: string;
  available: boolean;
  slots: AvailableSlot[];
};

export type AvailabilityRequest = {
  serviceId: string;
};

export type CreateBookingRequest = {
  serviceId: string;
  date: string;
  slotId: string;
};

export type BookingReceipt = {
  id: string;
  status: "demo-confirmed";
};

export interface BookingAvailabilityAdapter {
  listServices(signal?: AbortSignal): Promise<BookingService[]>;
  listAvailability(
    request: AvailabilityRequest,
    signal?: AbortSignal,
  ): Promise<AvailableDay[]>;
  createBooking(
    request: CreateBookingRequest,
    options: { idempotencyKey: string; signal?: AbortSignal },
  ): Promise<BookingReceipt>;
}
