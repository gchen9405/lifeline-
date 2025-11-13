import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Pill, 
  FlaskConical, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export type EntryType = "medication" | "lab" | "appointment";
export type EntryStatus = "completed" | "missed" | "upcoming" | "pending";

export interface TimelineEntryData {
  id: string;
  type: EntryType;
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
  onStatusChange?: (id: string, status: EntryStatus) => void;
}

const entryConfig = {
  medication: {
    icon: Pill,
    color: "text-medical-blue",
    bgColor: "bg-medical-blue/10",
    borderColor: "border-medical-blue/20",
  },
  lab: {
    icon: FlaskConical,
    color: "text-accent-cyan",
    bgColor: "bg-accent-cyan/10",
    borderColor: "border-accent-cyan/20",
  },
  appointment: {
    icon: Calendar,
    color: "text-accent-purple",
    bgColor: "bg-accent-purple/10",
    borderColor: "border-accent-purple/20",
  },
};

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    variant: "success" as const,
  },
  missed: {
    icon: XCircle,
    label: "Missed",
    variant: "destructive" as const,
  },
  upcoming: {
    icon: Clock,
    label: "Upcoming",
    variant: "warning" as const,
  },
  pending: {
    icon: AlertCircle,
    label: "Pending",
    variant: "outline" as const,
  },
};

export function TimelineEntry({ entry, onStatusChange }: TimelineEntryProps) {
  const config = entryConfig[entry.type];
  const status = statusConfig[entry.status];
  const Icon = config.icon;
  const StatusIcon = status.icon;

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="relative flex flex-col items-center">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border-2",
          config.bgColor,
          config.borderColor
        )}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>
        <div className="absolute top-10 h-full w-0.5 bg-border" />
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <Card className={cn(
          "p-4 border-l-4 transition-all hover:shadow-md",
          config.borderColor
        )}>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{entry.title}</h3>
                  {(entry.type === "medication" || entry.type === "appointment") && 
                    entry.status !== "completed" && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={false}
                        onCheckedChange={(checked) => 
                          onStatusChange?.(entry.id, checked ? "completed" : "upcoming")
                        }
                        className="h-5 w-5"
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{entry.description}</p>
                {entry.provider && (
                  <p className="text-xs text-muted-foreground/80">
                    Provider: {entry.provider}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{entry.time}</span>
                </div>
                {entry.type !== "lab" && 
                  ((entry.type === "medication" || entry.type === "appointment") && 
                   entry.status === "completed") && (
                  <Badge variant={status.variant} className="gap-1.5">
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
