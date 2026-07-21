"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReserveButtonProps {
  hotspotId: string;
  hotspotTitle: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ReserveButton({
  hotspotId,
  hotspotTitle,
  variant = "default",
  size = "default",
  className,
}: ReserveButtonProps) {
  const { navigate } = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => todayISO());
  const [time, setTime] = useState("19:00");
  const [partySize, setPartySize] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const minDate = useMemo(() => todayISO(), []);

  function openDialog() {
    if (!isAuthenticated) {
      navigate("login");
      return;
    }
    setOpen(true);
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          listingId: hotspotId,
          date,
          time,
          partySize,
          name,
          phone,
          notes,
        }),
      });
      if (res.status === 401) {
        navigate("login");
        return;
      }
      if (res.status === 403) {
        toast.error("Your account is suspended and cannot make bookings.");
        return;
      }
      if (res.status === 409) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        toast.error(data.error ?? "You already requested this booking.");
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        toast.error(data.error ?? "Could not reserve");
        return;
      }
      toast.success("Reservation requested — we'll let the host know.");
      setOpen(false);
      navigate("dashboard-reservations");
    } catch {
      toast.error("Could not reserve");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={openDialog}
        >
          <CalendarPlus className="h-4 w-4 mr-2" />
          Reserve
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reserve a spot at {hotspotTitle}</DialogTitle>
          <DialogDescription>
            Submit a booking request. The host will confirm or decline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="rb-date">
                Date
              </label>
              <Input
                id="rb-date"
                type="date"
                value={date}
                min={minDate}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="rb-time">
                Time
              </label>
              <Input
                id="rb-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label
              className="text-xs text-muted-foreground"
              htmlFor="rb-party"
            >
              Party size (1–50)
            </label>
            <Input
              id="rb-party"
              type="number"
              min={1}
              max={50}
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value) || 1)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="text-xs text-muted-foreground"
                htmlFor="rb-name"
              >
                Your name
              </label>
              <Input
                id="rb-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                maxLength={80}
              />
            </div>
            <div>
              <label
                className="text-xs text-muted-foreground"
                htmlFor="rb-phone"
              >
                Phone
              </label>
              <Input
                id="rb-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                maxLength={30}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="rb-notes">
              Notes for the host
            </label>
            <Textarea
              id="rb-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anything we should know? Window seat, allergies, occasion…"
              maxLength={1000}
            />
            <div className="text-[11px] text-muted-foreground text-right">
              {notes.length}/1000
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Request reservation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
