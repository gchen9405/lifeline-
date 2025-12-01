import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { TimelineEntryData } from "./TimelineEntry";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { ImportDialog } from "./ImportDialog";

interface SummaryCardProps {
  entries: TimelineEntryData[];
  onImport: (entries: Omit<TimelineEntryData, "id">[]) => void;
}

export function SummaryCard({ entries, onImport }: SummaryCardProps) {
  const medications = entries.filter(e => e.type === "medication");
  const labResults = entries.filter(e => e.type === "lab");
  const appointments = entries.filter(e => e.type === "appointment");

  const completedMeds = medications.filter(m => m.status === "taken").length;
  const missedMedEntries = medications.filter(m => m.status === "missed");
  const missedMeds = missedMedEntries.length;

  const handleExport = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // Title
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Treatment Summary", margin, yPos);
      yPos += 10;

      // Subtitle
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Overview of your health timeline", margin, yPos);
      yPos += 15;

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Statistics Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Overview Statistics", margin, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      // Medications
      doc.setFont("helvetica", "bold");
      doc.text("Medications:", margin, yPos);
      doc.setFont("helvetica", "normal");
      let medText = `${medications.length} total`;
      if (completedMeds > 0) {
        medText += ` - ${completedMeds} taken`;
      }
      if (missedMeds > 0) {
        medText += ` - ${missedMeds} missed`;
      }
      doc.text(medText, margin + 50, yPos);
      yPos += 8;

      // Lab Results
      doc.setFont("helvetica", "bold");
      doc.text("Lab Results:", margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${labResults.length} total`, margin + 50, yPos);
      yPos += 8;

      // Appointments
      doc.setFont("helvetica", "bold");
      doc.text("Appointments:", margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${appointments.length} total`, margin + 50, yPos);
      yPos += 12;

      // Missed Medications Warning
      if (missedMeds > 0) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text(
          `Warning: You have ${missedMeds} missed medication${missedMeds > 1 ? "s" : ""}`,
          margin,
          yPos
        );
        yPos += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        missedMedEntries.forEach((entry) => {
          doc.text(`• ${entry.title} (${entry.date} at ${entry.time})`, margin + 5, yPos);
          yPos += 5;
        });

        doc.setTextColor(0, 0, 0);
        yPos += 12;
      }

      // Recent Activity Section
      const recentEntries = entries.slice(0, 5);
      if (recentEntries.length > 0) {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Recent Activity", margin, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        recentEntries.forEach((entry, index) => {
          // Check if we need a new page
          if (yPos > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage();
            yPos = margin;
          }

          // Entry title
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${entry.title}`, margin, yPos);
          yPos += 6;

          // Entry details
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          doc.text(`   Type: ${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}`, margin + 5, yPos);
          yPos += 5;
          doc.text(`   Date: ${entry.date}`, margin + 5, yPos);
          yPos += 5;
          doc.text(`   Time: ${entry.time}`, margin + 5, yPos);
          yPos += 5;
          // Only show status for non-lab entries
          if (entry.type !== "lab") {
            doc.text(`   Status: ${entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}`, margin + 5, yPos);
            yPos += 5;
          }

          if (entry.description) {
            const descriptionLines = doc.splitTextToSize(`   Description: ${entry.description}`, pageWidth - margin * 2 - 5);
            doc.text(descriptionLines, margin + 5, yPos);
            yPos += descriptionLines.length * 5;
          }

          if (entry.provider) {
            doc.text(`   Provider: ${entry.provider}`, margin + 5, yPos);
            yPos += 5;
          }

          doc.setTextColor(0, 0, 0);
          yPos += 5; // Space between entries
        });
      }

      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `treatment-summary-${dateStr}.pdf`;

      // Save the PDF
      doc.save(filename);
      toast.success("Summary exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export summary. Please try again.");
    }
  };

  return (
    <Card className="space-y-6 rounded-2xl border border-white/60 bg-white/75 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
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
          <ImportDialog
            onImport={onImport}
            buttonClassName="gap-2"
            variant="outline"
            size="sm"
            triggerContent={
              <>
                <FileText className="h-4 w-4" />
                Import
              </>
            }
          />
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2 rounded-xl border border-white/60 bg-white/80 p-4 shadow-sm">
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

        <div className="space-y-2 rounded-xl border border-white/60 bg-white/80 p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Lab Results</p>
          <p className="text-3xl font-bold text-foreground">{labResults.length}</p>
        </div>

        <div className="space-y-2 rounded-xl border border-white/60 bg-white/80 p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Appointments</p>
          <p className="text-3xl font-bold text-foreground">{appointments.length}</p>
        </div>
      </div>

      {missedMeds > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive mb-2">
            ⚠️ You have {missedMeds} missed medication{missedMeds > 1 ? "s" : ""}
          </p>
          <ul className="list-disc list-inside text-sm text-destructive/90 space-y-1 ml-2">
            {missedMedEntries.map((entry) => (
              <li key={entry.id}>
                {entry.title} <span className="text-destructive/70 text-xs">({entry.date} at {entry.time})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <div className="space-y-2">
          {entries.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-white/60 bg-white/80 p-3 shadow-sm"
            >
              <div>
                <p className="font-medium text-sm text-foreground">{entry.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {entry.time}
                </p>
              </div>
              {entry.type !== "lab" && (
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
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
