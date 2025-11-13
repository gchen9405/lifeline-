import {
  Pill,
  Calendar,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export type EntryStatus =
  | "completed"
  | "upcoming"
  | "missed"
  | "taken"
  | "returned";
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
  entry: Omit<TimelineEntryData, "id"> & { id: string };
  onStatusChange: (id: string, newStatus: EntryStatus) => void;
}

export const TimelineEntry = ({ entry, onStatusChange }: TimelineEntryProps) => {
  const baseStatusIcons = {
    completed: CheckCircle2,
    missed: XCircle,
    upcoming: Clock,
    taken: CheckCircle2,
  };

  const statusColors: Record<EntryStatus, string> = {
    completed: "text-green-500 border-green-500/30",
    missed: "text-red-500 border-red-500/30",
    upcoming: "text-amber-500 border-amber-500/30",
    taken: "text-green-600 border-green-500/30",
    returned: "text-cyan-500 border-cyan-500/30",
  };

  const statusIcons: Record<EntryStatus, LucideIcon> = {
    ...baseStatusIcons,
    returned: CheckCircle2,
  };

  const typeConfig: Record<
    TimelineEntryData["type"],
    {
      icon: LucideIcon;
      color: string;
    }
  > = {
    medication: {
      icon: Pill,
      color: "text-blue-500",
    },
    appointment: {
      icon: Calendar,
      color: "text-purple-500",
    },
    lab: {
      icon: FlaskConical,
      color: "text-cyan-500",
    },
  };

  const getStatusActionText = (
    type: TimelineEntryData["type"],
    status: EntryStatus
  ): string => {
    const isComplete = ["completed", "taken"].includes(status);
    if (type === "medication") return isComplete ? "Mark as Missed" : "Mark as Taken";
    if (type === "appointment") return isComplete ? "Mark as Incomplete" : "Mark as Completed";
    return "";
  };

  const config = typeConfig[entry.type];
  const StatusIcon = statusIcons[entry.status];
  const isToggleable = entry.type === "medication" || entry.type === "appointment";
  const isChecked = entry.status === "completed" || entry.status === "taken";

  return (
    <div className="relative flex items-start pb-8">
      {/* Timeline line */}
      <div className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-border" />
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-card",
            statusColors[entry.status]
          )}
        >
          <config.icon className={cn("h-5 w-5", config.color)} />
        </div>
      </div>

      {/* Content */}
      <div className="ml-4 flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-4 w-4", statusColors[entry.status])} />
              <p className="text-sm text-muted-foreground">{entry.time}</p>
            </div>
            <h3 className="font-semibold text-foreground">{entry.title}</h3>
            <p className="text-sm text-muted-foreground">{entry.description}</p>
            {entry.provider && (
              <p className="mt-1 text-xs text-muted-foreground">
                Provider: {entry.provider}
              </p>
            )}
          </div>
          {isToggleable && (
            <div className="ml-4 flex items-center self-center">
              <Checkbox
                id={`entry-${entry.id}`}
                checked={isChecked}
                onCheckedChange={(checked) => {
                  const newStatus = checked
                    ? entry.type === "medication" ? "taken" : "completed"
                    : "upcoming";
                  onStatusChange(entry.id, newStatus);
                }}
                aria-label={getStatusActionText(entry.type, entry.status)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
