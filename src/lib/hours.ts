import type { HourRow } from "@/components/admin/HoursEditor";

export type OpenState =
  | { state: "open-now"; until: string | null }
  | { state: "closed-now"; opensAt: string | null }
  | { state: "closed-today" }
  | { state: "unknown" };

export function getDayOfWeekInZone(date: Date, timeZone: string): number {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone,
    });
    const part = fmt.formatToParts(date).find((p) => p.type === "weekday");
    if (!part) return date.getDay();
    const map: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    return map[part.value] ?? date.getDay();
  } catch {
    return date.getDay();
  }
}

export function getNowInZone(date: Date, timeZone: string): {
  hours: number;
  minutes: number;
} {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    });
    const parts = fmt.formatToParts(date);
    const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
    const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
    return { hours: Number(hh), minutes: Number(mm) };
  } catch {
    return { hours: date.getHours(), minutes: date.getMinutes() };
  }
}

function toMinutes(time: string | null | undefined): number | null {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isOpenNow(
  hours: HourRow[] | undefined | null,
  isOpenLegacy: boolean = true,
  now: Date = new Date(),
  timeZone: string = "Africa/Lagos"
): OpenState {
  if (!hours || hours.length === 0) {
    if (!isOpenLegacy) return { state: "closed-today" };
    return { state: "unknown" };
  }

  const dow = getDayOfWeekInZone(now, timeZone);
  const today = hours.find((h) => h.dayOfWeek === dow);
  if (!today) return { state: "closed-today" };
  if (today.isClosed) return { state: "closed-today" };

  const { hours: hh, minutes: mm } = getNowInZone(now, timeZone);
  const nowM = hh * 60 + mm;
  const opensM = toMinutes(today.opensAt);
  const closesM = toMinutes(today.closesAt);
  if (opensM == null || closesM == null) return { state: "closed-today" };

  if (nowM >= opensM && nowM <= closesM) {
    return { state: "open-now", until: today.closesAt ?? null };
  }
  if (nowM < opensM) {
    return { state: "closed-now", opensAt: today.opensAt };
  }
  return { state: "closed-today" };
}
