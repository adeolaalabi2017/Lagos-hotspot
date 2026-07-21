export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "declined",
  "cancelled",
  "completed",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export type BookingValidationResult =
  | { ok: true; date: Date; time: Date | null }
  | { ok: false; error: string };

/**
 * Validates date (YYYY-MM-DD) and time (HH:MM) and ensures the booking is
 * not in the past (with a 1-minute clock-skew tolerance).
 */
export function validateBookingDateTime(
  dateStr: string,
  timeStr: string | null,
  now: Date = new Date()
): BookingValidationResult {
  if (!DATE_RE.test(dateStr)) {
    return { ok: false, error: "Date must be YYYY-MM-DD" };
  }
  const [y, m, d] = dateStr.split("-").map((n) => Number(n));
  if (
    !Number.isFinite(y) ||
    !Number.isFinite(m) ||
    !Number.isFinite(d) ||
    m < 1 ||
    m > 12 ||
    d < 1 ||
    d > 31
  ) {
    return { ok: false, error: "Invalid date" };
  }
  let hours = 0;
  let minutes = 0;
  let time: Date | null = null;
  if (timeStr) {
    if (!TIME_RE.test(timeStr)) {
      return { ok: false, error: "Time must be HH:MM" };
    }
    const [hh, mm] = timeStr.split(":").map((n) => Number(n));
    if (
      !Number.isFinite(hh) ||
      !Number.isFinite(mm) ||
      hh < 0 ||
      hh > 23 ||
      mm < 0 ||
      mm > 59
    ) {
      return { ok: false, error: "Invalid time" };
    }
    hours = hh;
    minutes = mm;
    time = new Date(Date.UTC(y, m - 1, d, hh, mm));
  }
  const dateOnly = new Date(Date.UTC(y, m - 1, d));
  // Allow a 1-minute skew so users don't bounce off "yesterday just ended"
  const cutoff = new Date(now.getTime() - 60 * 1000);
  if (dateOnly.getTime() < new Date(cutoff.getTime() - 86_400_000 * 100).getTime()) {
    // Trivially: the date is in the very distant past; reject
    return { ok: false, error: "Booking date is in the past" };
  }
  if (timeStr) {
    if (time!.getTime() < cutoff.getTime()) {
      return { ok: false, error: "Booking time is in the past" };
    }
  } else {
    // If no time was supplied, reject if the day itself is before today
    const todayUtcMidnight = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      )
    );
    if (dateOnly.getTime() < todayUtcMidnight.getTime()) {
      return { ok: false, error: "Booking date is in the past" };
    }
  }
  return { ok: true, date: dateOnly, time };
}

export function validatePartySize(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 50
  );
}

export function clampText(value: unknown, max: number): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length <= max ? trimmed : null;
}

export type ValidationError = { error: string };

export type ParsedBookingInput =
  | {
      ok: true;
      listingId: string;
      dateStr: string;
      date: Date;
      timeStr: string | null;
      partySize: number;
      name: string | null;
      phone: string | null;
      notes: string | null;
    }
  | { ok: false; error: string };

const NOTES_MAX = 1000;
const NAME_MAX = 80;
const PHONE_MAX = 30;

export function parseBookingInput(body: unknown): ParsedBookingInput {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid payload" };
  }
  const b = body as Record<string, unknown>;
  const listingId = typeof b.listingId === "string" ? b.listingId.trim() : "";
  if (!listingId) return { ok: false, error: "Missing listingId" };

  const dateStr = typeof b.date === "string" ? b.date.trim() : "";
  if (!dateStr) return { ok: false, error: "Missing date" };

  const timeStrRaw =
    typeof b.time === "string" && b.time.trim().length > 0
      ? b.time.trim()
      : null;

  const dateResult = validateBookingDateTime(dateStr, timeStrRaw);
  if (!dateResult.ok) return { ok: false, error: dateResult.error };

  if (!validatePartySize(b.partySize)) {
    return { ok: false, error: "Party size must be an integer between 1 and 50" };
  }

  const notesRaw = clampText(b.notes, NOTES_MAX);
  if (b.notes != null && notesRaw == null) {
    return { ok: false, error: `Notes must be ≤ ${NOTES_MAX} characters` };
  }

  const nameRaw = clampText(b.name, NAME_MAX);
  if (b.name != null && nameRaw == null) {
    return { ok: false, error: `Name must be ≤ ${NAME_MAX} characters` };
  }

  const phoneRaw = clampText(b.phone, PHONE_MAX);
  if (b.phone != null && phoneRaw == null) {
    return { ok: false, error: `Phone must be ≤ ${PHONE_MAX} characters` };
  }

  return {
    ok: true,
    listingId,
    dateStr,
    date: dateResult.date,
    timeStr: timeStrRaw,
    partySize: b.partySize as number,
    name: nameRaw,
    phone: phoneRaw,
    notes: notesRaw,
  };
}

export function isBookingStatus(value: unknown): value is BookingStatus {
  return (
    typeof value === "string" &&
    (BOOKING_STATUSES as readonly string[]).includes(value)
  );
}
