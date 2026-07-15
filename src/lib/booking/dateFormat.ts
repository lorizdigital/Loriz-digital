const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Formatiert das vom Verfügbarkeitsadapter gelieferte ISO-Datum ohne Zeitzonenverschiebung. */
export function formatBookingDate(date: string): string {
  const match = ISO_DATE_PATTERN.exec(date);
  if (!match) return date;

  const [, year, month, day] = match;
  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (
    parsedDate.getUTCFullYear() !== Number(year) ||
    parsedDate.getUTCMonth() !== Number(month) - 1 ||
    parsedDate.getUTCDate() !== Number(day)
  ) {
    return date;
  }

  return LONG_DATE_FORMATTER.format(parsedDate);
}
