import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Share2 } from "lucide-react";
import { TimelineEntryData } from "./TimelineEntry";
import { toast } from "sonner";

interface SummaryCardProps {
  entries: TimelineEntryData[];
}

export function SummaryCard({ entries }: SummaryCardProps) {
  const medications = entries.filter(e => e.type === "medication");
  const labResults = entries.filter(e => e.type === "lab");
  const appointments = entries.filter(e => e.type === "appointment");

  const completedMeds = medications.filter(m => m.status === "taken").length;
  const missedMeds = medications.filter(m => m.status === "missed").length;

  const handleExport = () => {
    toast.success("Summary exported successfully");
  };

  const handleShare = () => {
    toast.success("Sharing link copied to clipboard");
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Treatment Summary</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Overview of your health timeline
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Medications</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground">{medications.length}</p>
            <div className="flex gap-1">
              {completedMeds > 0 && (
                <Badge className="bg-success text-success-foreground">{completedMeds} taken</Badge>
              )}
              {missedMeds > 0 && (
                <Badge variant="destructive">{missedMeds} missed</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Lab Results</p>
          <p className="text-3xl font-bold text-foreground">{labResults.length}</p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Appointments</p>
          <p className="text-3xl font-bold text-foreground">{appointments.length}</p>
        </div>
      </div>

      {missedMeds > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            ⚠️ You have {missedMeds} missed medication{missedMeds > 1 ? "s" : ""}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <div className="space-y-2">
          {entries.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-md border bg-card p-3"
            >
              <div>
                <p className="font-medium text-sm text-foreground">{entry.title}</p>
                <p className="text-xs text-muted-foreground">{entry.time}</p>
              </div>
              <Badge
                className={
                  entry.status === "completed"
                    ? "bg-success text-success-foreground"
                    : entry.status === "missed"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-muted text-muted-foreground"
                }
              >
                {entry.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
