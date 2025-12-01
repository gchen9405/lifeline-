import {
  Pill, Calendar, FlaskConical, CheckCircle2, XCircle, Clock, LucideIcon, Trash2, Edit,
  AlertCircle, Stethoscope, StickyNote, MapPin, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type EntryType = "medication" | "lab" | "appointment" | "generic";
export type EntryStatus = "completed" | "missed" | "upcoming" | "taken" | "awaiting_result" | "returned";

export interface TimelineEntryData {
  id: string;
  type: EntryType;
  title: string;
  description?: string;
  time: string;
  status: EntryStatus;
  provider?: string;
  date: string;
  recurring?: string; // "daily", "weekly", or JSON string for structured recurrence
  statusByDate?: Record<string, EntryStatus>; // Track status per date for recurring entries

  // Lab specific
  value?: string;
  unit?: string;
  referenceRange?: string;

  // New fields
  location?: string;
  followUp?: string; // ISO date string for follow-up reminder
}

interface TimelineEntryProps {
  entry: TimelineEntryData & { _displayDate?: string };
  onStatusChange: (id: string, newStatus: EntryStatus, displayDate?: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  isLast?: boolean;
}

const statusConfig: Record<EntryStatus, { label: string; chip: string }> = {
  completed: { label: "Completed", chip: "bg-emerald-100 text-emerald-700" },
  taken: { label: "Taken", chip: "bg-emerald-100 text-emerald-700" },
  upcoming: { label: "Upcoming", chip: "bg-slate-100 text-slate-600" },
  missed: { label: "Missed", chip: "bg-rose-100 text-rose-700" },
  returned: { label: "Returned", chip: "bg-blue-100 text-blue-700" },
  awaiting_result: { label: "Awaiting", chip: "bg-amber-100 text-amber-700" },
};

const STATUS_ICONS: Record<EntryStatus, LucideIcon> = {
  completed: CheckCircle2,
  taken: CheckCircle2,
  upcoming: Clock,
  missed: XCircle,
  returned: AlertCircle,
  awaiting_result: Clock,
};

const TYPE_CONFIG: Record<EntryType, { icon: LucideIcon; accent: string; indicator: string }> = {
  medication: {
    icon: Pill,
    accent: "text-blue-600",
    indicator: "bg-blue-100 border-blue-200",
  },
  appointment: {
    icon: Stethoscope,
    accent: "text-purple-600",
    indicator: "bg-purple-100 border-purple-200",
  },
  lab: {
    icon: FlaskConical,
    accent: "text-amber-600",
    indicator: "bg-amber-100 border-amber-200",
  },
  generic: {
    icon: StickyNote,
    accent: "text-slate-600",
    indicator: "bg-slate-100 border-slate-200",
  },
};

interface StatusActionConfig { label: string; next: EntryStatus; }
const getStatusToggle = (type: TimelineEntryData["type"], status: EntryStatus): StatusActionConfig => {
  const isComplete = status === "completed" || status === "taken";
  if (type === "medication") return { label: isComplete ? "Mark as Upcoming" : "Mark as Taken", next: isComplete ? "upcoming" : "taken" };
  if (type === "appointment") return { label: isComplete ? "Mark as Upcoming" : "Mark as Completed", next: isComplete ? "upcoming" : "completed" };
  return { label: "", next: status };
};

export const TimelineEntry = ({ entry, onStatusChange, onEdit, onRemove, isLast }: TimelineEntryProps) => {
  const isToggleable = entry.type === "medication" || entry.type === "appointment";
  const config = TYPE_CONFIG[entry.type];
  const StatusIcon = STATUS_ICONS[entry.status];
  const statusMeta = statusConfig[entry.status];
  const statusToggle = getStatusToggle(entry.type, entry.status);

  return (
    <div className="relative flex gap-6 pb-6 last:pb-0">
      {/* connector line (lighter & precisely aligned to icon center) */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[27.5px] top-[70px] h-[calc(100%-40px)] w-0.5 bg-slate-400"
        />
      )}

      {/* left rail icon */}
      <div className="relative flex flex-col items-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-white/60">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border shadow-sm", config.indicator)}>
            <config.icon className={cn("h-5 w-5", config.accent)} />
          </div>
        </div>
      </div>

      {/* card */}
      <div className="flex-1">
        <div className="rounded-2xl border border-white/60 bg-white/90 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          {/* top row — small time + status chip; action at far right */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">{entry.time}</span>
            <span className={cn("inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold", statusMeta.chip)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusMeta.label}
            </span>
            <div className="ml-auto flex items-center gap-4">
              {isToggleable && statusToggle.label && (
                <button
                  type="button"
                  onClick={() => onStatusChange(entry.id, statusToggle.next, entry._displayDate)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  {statusToggle.label}
                </button>
              )}
              {onEdit && (
                <button type="button" onClick={() => onEdit(entry.id)} className="text-slate-400 hover:text-slate-700"><Edit className="h-4 w-4" /></button>
              )}
              <button type="button" onClick={() => onRemove(entry.id)} className="text-slate-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove entry</span>
              </button>
            </div>
          </div>

          {/* title + description */}
          <div className="mt-2 space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">{entry.title}</h3>
            <p className="text-sm text-slate-600">{entry.description}</p>
          </div>

          {/* meta row — show provider & time once (avoid duplicate time) */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              {entry.time}
            </div>
            {entry.provider && (
              <div className="mt-1 text-xs font-medium text-slate-500">
                {entry.provider}
              </div>
            )}

            {entry.location && (
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entry.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-slate-700 flex items-center gap-0.5"
                >
                  {entry.location}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            )}

            {/* Lab Result Display */}
            {entry.type === "lab" && entry.referenceRange && entry.value && (
              <div className="w-full mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Result: {entry.value} {entry.unit}</span>
                  <span>Range: {entry.referenceRange} {entry.unit}</span>
                </div>
                {/* Simple visual bar */}
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative">
                  {(() => {
                    try {
                      const val = parseFloat(entry.value);
                      const [min, max] = entry.referenceRange.split("-").map(parseFloat);
                      if (isNaN(val) || isNaN(min) || isNaN(max)) return null;

                      // Calculate position (clamped 0-100%)
                      const range = max - min;
                      const padding = range * 0.2; // Add 20% padding to visual range
                      const visualMin = min - padding;
                      const visualMax = max + padding;
                      const visualRange = visualMax - visualMin;

                      const percent = Math.max(0, Math.min(100, ((val - visualMin) / visualRange) * 100));
                      const minPercent = ((min - visualMin) / visualRange) * 100;
                      const maxPercent = ((max - visualMin) / visualRange) * 100;

                      const isOutOfRange = val < min || val > max;
                      const color = isOutOfRange ? "bg-rose-500" : "bg-emerald-500";

                      return (
                        <>
                          {/* Normal Range Zone */}
                          <div
                            className="absolute top-0 bottom-0 bg-slate-300/50"
                            style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
                          />
                          {/* Value Marker */}
                          <div
                            className={`absolute top-0 bottom-0 w-2 rounded-full ${color} ring-2 ring-white`}
                            style={{ left: `calc(${percent}% - 4px)` }}
                          />
                        </>
                      );
                    } catch (e) { return null; }
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};