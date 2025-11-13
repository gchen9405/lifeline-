import {
  Pill, Calendar, FlaskConical, CheckCircle2, XCircle, Clock, LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type EntryStatus = "completed" | "upcoming" | "missed" | "taken" | "returned";
export interface TimelineEntryData {
  id: string;
  type: "medication" | "appointment" | "lab";
  title: string;
  description: string;
  time: string;
  status: EntryStatus;
  provider?: string;
  date?: string;
  recurring?: boolean;
}

interface TimelineEntryProps {
  entry: TimelineEntryData;
  onStatusChange: (id: string, newStatus: EntryStatus) => void;
  isLast?: boolean;
}

const statusConfig: Record<EntryStatus, { label: string; chip: string }> = {
  completed: { label: "Completed", chip: "bg-emerald-100 text-emerald-700" },
  taken: { label: "Taken", chip: "bg-emerald-100 text-emerald-700" },
  upcoming: { label: "Upcoming", chip: "bg-slate-100 text-slate-600" },
  missed: { label: "Missed", chip: "bg-rose-100 text-rose-600" },
  returned: { label: "Returned", chip: "bg-sky-100 text-sky-700" },
};

const statusIcons: Record<EntryStatus, LucideIcon> = {
  completed: CheckCircle2,
  taken: CheckCircle2,
  upcoming: Clock,
  missed: XCircle,
  returned: CheckCircle2,
};

const typeConfig: Record<TimelineEntryData["type"], { icon: LucideIcon; accent: string; indicator: string }> = {
  medication: { icon: Pill, accent: "text-sky-600", indicator: "from-sky-100 to-blue-50 border-sky-100" },
  appointment: { icon: Calendar, accent: "text-purple-600", indicator: "from-purple-100 to-indigo-50 border-purple-100" },
  lab: { icon: FlaskConical, accent: "text-cyan-600", indicator: "from-cyan-100 to-sky-50 border-cyan-100" },
};

interface StatusActionConfig { label: string; next: EntryStatus; }
const getStatusToggle = (type: TimelineEntryData["type"], status: EntryStatus): StatusActionConfig => {
  const isComplete = status === "completed" || status === "taken";
  if (type === "medication") return { label: isComplete ? "Mark as Upcoming" : "Mark as Taken", next: isComplete ? "upcoming" : "taken" };
  if (type === "appointment") return { label: isComplete ? "Mark as Upcoming" : "Mark as Completed", next: isComplete ? "upcoming" : "completed" };
  return { label: "", next: status };
};

export const TimelineEntry = ({ entry, onStatusChange, isLast }: TimelineEntryProps) => {
  const isToggleable = entry.type === "medication" || entry.type === "appointment";
  const config = typeConfig[entry.type];
  const StatusIcon = statusIcons[entry.status];
  const statusMeta = statusConfig[entry.status];
  const statusToggle = getStatusToggle(entry.type, entry.status);

  return (
    <div className="relative flex gap-6 pb-8 last:pb-0">
      {/* connector line (lighter & precisely aligned to icon center) */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[36px] top-[72px] h-[calc(100%-36px)] w-px bg-white/55"
        />
      )}

      {/* left rail icon */}
      <div className="relative flex flex-col items-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-white/60">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-full border bg-gradient-to-br", config.indicator)}>
            <config.icon className={cn("h-5 w-5", config.accent)} />
          </div>
        </div>
      </div>

      {/* card */}
      <div className="flex-1">
        <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          {/* top row — small time + status chip; action at far right */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">{entry.time}</span>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold", statusMeta.chip)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusMeta.label}
            </span>
            {isToggleable && statusToggle.label && (
              <button
                type="button"
                onClick={() => onStatusChange(entry.id, statusToggle.next)}
                className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                {statusToggle.label}
              </button>
            )}
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
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                {entry.provider}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};