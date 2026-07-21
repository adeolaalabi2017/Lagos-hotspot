"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export interface HourRow {
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
}

const DAYS = [
  { id: 0, label: "Sunday" },
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
];

export function defaultHours(): HourRow[] {
  return DAYS.map((d) => ({
    dayOfWeek: d.id,
    opensAt: d.id === 0 ? null : "09:00",
    closesAt: d.id === 0 ? null : "22:00",
    isClosed: d.id === 0,
  }));
}

export function HoursEditor({
  value,
  onChange,
}: {
  value: HourRow[];
  onChange: (rows: HourRow[]) => void;
}) {
  function patch(idx: number, partial: Partial<HourRow>) {
    onChange(value.map((row, i) => (i === idx ? { ...row, ...partial } : row)));
  }

  return (
    <div className="space-y-2">
      {value.map((row, idx) => {
        const day = DAYS.find((d) => d.id === row.dayOfWeek) ?? DAYS[idx];
        return (
          <div
            key={row.dayOfWeek}
            className="rounded-md border bg-card px-3 py-2.5 flex items-center gap-3"
          >
            <Label className="w-24 text-xs text-muted-foreground">
              {day.label}
            </Label>
            <Input
              type="time"
              value={row.opensAt ?? ""}
              disabled={row.isClosed}
              onChange={(e) => patch(idx, { opensAt: e.target.value })}
              className="h-8 w-28 text-sm"
              aria-label={`${day.label} opens`}
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="time"
              value={row.closesAt ?? ""}
              disabled={row.isClosed}
              onChange={(e) => patch(idx, { closesAt: e.target.value })}
              className="h-8 w-28 text-sm"
              aria-label={`${day.label} closes`}
            />
            <div className="ml-auto flex items-center gap-2">
              <Label className="text-xs text-muted-foreground cursor-pointer">
                Closed
              </Label>
              <Switch
                checked={row.isClosed}
                onCheckedChange={(checked) =>
                  patch(idx, { isClosed: checked })
                }
                aria-label={`${day.label} closed`}
              />
            </div>
          </div>
        );
      })}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            onChange(
              value.map((row) =>
                row.isClosed
                  ? { ...row, isClosed: false }
                  : row
              )
            )
          }
          disabled={value.every((r) => !r.isClosed)}
        >
          Open all days
        </Button>
      </div>
    </div>
  );
}
