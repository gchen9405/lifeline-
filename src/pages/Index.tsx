import { useEffect, useMemo, useState } from "react";
import { TimelineEntry, TimelineEntryData, EntryStatus } from "@/components/TimelineEntry";
import { ReminderSystem } from "@/components/ReminderSystem";
import { AddEntryDialog } from "@/components/AddEntryDialog";
import { SummaryCard } from "@/components/SummaryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, TrendingUp, CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { Toaster as Sonner, toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEntriesStore } from "@/store/entries";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 🔗 read/write global store
  const entries = useEntriesStore((s) => s.entries);
  const addEntry = useEntriesStore((s) => s.addEntry);
  const bulkAdd = useEntriesStore((s) => s.bulkAdd);
  const setStatus = useEntriesStore((s) => s.setStatus);

  // Seed demo data once if store is empty
  useEffect(() => {
    if (entries.length === 0) {
      const today = format(new Date(), "yyyy-MM-dd");
      bulkAdd([
        {
          type: "medication",
          title: "Morning Medication - Lisinopril 10mg",
          description: "Blood pressure medication prescribed by Dr. Johnson",
          time: "08:00 AM", // Note: `status` is now 'taken'
          status: "taken",
          provider: "Dr. Johnson (Primary Care)",
          date: today,
        },
        {
          type: "medication",
          title: "Evening Medication - Metformin 500mg",
          description: "Diabetes medication prescribed by Dr. Smith",
          time: "06:00 PM",
          status: "missed",
          provider: "Dr. Smith (Endocrinologist)",
          date: today,
        },
        {
          type: "lab",
          title: "Returned Lab Result",
          description: "Fasting glucose: 105 mg/dL (normal range)",
          time: "07:30 AM", // Note: `status` is now 'returned'
          status: "returned",
          provider: "City Hospital Lab",
          date: today,
        },
        {
          type: "appointment",
          title: "Cardiology Follow-up",
          description: "Quarterly check-up with cardiologist",
          time: "10:00 AM",
          status: "upcoming",
          provider: "Dr. Williams (Cardiology)",
          date: today,
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddEntry = (newEntry: Omit<TimelineEntryData, "id">) => {
    addEntry(newEntry);
  };

  const handleStatusChange = (id: string, status: EntryStatus) => {
    setStatus(id, status);
  };

  const selectedDateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  const filteredEntries = useMemo(
    () => {
      const parseTime = (timeStr: string): number => {
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (modifier === "PM" && hours < 12) {
          hours += 12;
        }
        if (modifier === "AM" && hours === 12) {
          hours = 0;
        }
        return hours * 60 + minutes;
      };
      return entries.filter((e) => e.date === selectedDateStr).sort((a, b) => parseTime(a.time) - parseTime(b.time));
    },
    [entries, selectedDateStr]
  );

  return (
    <TooltipProvider>
      <Sonner />
      <ReminderSystem />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-foreground">Micro-Timeline</h1>
                <p className="text-sm text-muted-foreground">
                  Your unified health journey across all providers
                </p>
              </div>
              <AddEntryDialog onAddEntry={handleAddEntry} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="timeline" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="timeline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="summary" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-6">
              <div className="rounded-lg border bg-card/50 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Timeline</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {filteredEntries.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No entries yet</p>
                    <AddEntryDialog onAddEntry={handleAddEntry} />
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredEntries.map((entry) => (
                      <TimelineEntry
                        key={entry.id}
                        entry={entry}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <div className="rounded-lg border bg-card/50 p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Select Date</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose a date to view its timeline
                  </p>
                </div>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-6">
              <SummaryCard entries={entries} />
            </TabsContent>
          </Tabs>
        </main>

        {/* Chatbot can now read the global store directly */}
        <ChatbotWidget />
      </div>
    </TooltipProvider>
  );
};

export default Index;