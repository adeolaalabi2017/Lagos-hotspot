import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "paid":
    case "active":
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "unpaid":
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "on hold":
    case "expired":
    case "cancelled":
    case "declined":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

/** Up to two initials for an avatar fallback, e.g. "Ada Obi" -> "AO". */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
