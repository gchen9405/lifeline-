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
import { Toaster as Sonner } from "sonner";
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
          time: "08:00 AM",
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
          time: "07:30 AM",
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

  const filteredEntries = useMemo(() => {
    const parseTime = (timeStr: string): number => {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    return entries
      .filter((e) => e.date === selectedDateStr)
      .sort((a, b) => parseTime(a.time) - parseTime(b.time));
  }, [entries, selectedDateStr]);

  const friendlyDate = useMemo(
    () =>
      selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [selectedDate]
  );

  const tabConfig = [
    { value: "timeline", label: "Today", Icon: CalendarIcon },
    { value: "summary", label: "Summary", Icon: TrendingUp },
    { value: "calendar", label: "Calendar", Icon: CalendarDays },
  ] as const;

  return (
    <TooltipProvider>
      <Sonner />
      <ReminderSystem />
      <div className="min-h-screen px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <main className="mx-auto flex max-w-6xl flex-col gap-8">
          <Tabs defaultValue="timeline" className="space-y-8">
            {/* HERO (plain; no glass wrapper) */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <span className="text-sm font-semibold tracking-tight text-slate-700">Lifeline-</span>
                <h1 className="font-semibold text-[40px] leading-[1.05] text-[#0F1729] sm:text-[56px]">
                  Welcome Back
                </h1>
                <p className="text-[15px] text-slate-600">
                  See what’s happening across your health: daily updates to your complete health picture.
                </p>
              </div>

              <AddEntryDialog
                onAddEntry={handleAddEntry}
                buttonClassName="rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-xl transition hover:bg-slate-900/90"
              />
            </div>

            {/* Segmented tabs (compact) */}
            <TabsList className="mt-1 inline-flex rounded-full bg-white/70 p-1 ring-1 ring-black/5 shadow-sm backdrop-blur">
              {tabConfig.map(({ value, label, Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition
                             data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="timeline">
              <section
                className="rounded-[28px] border border-white/55
                bg-[linear-gradient(135deg,hsl(216_100%_97%/.92),hsl(274_100%_96%/.92))]
                p-8 shadow-[0_30px_70px_rgba(88,80,236,0.22)] backdrop-blur"
              >
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Today</p>
                  <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">{friendlyDate}</h2>
                </div>

                <div className="mt-10 space-y-10">
                  {filteredEntries.length === 0 ? (
                    <div className="rounded-[24px] border border-white/60 bg-white/90 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">                      <p className="text-lg font-semibold text-slate-700">No entries yet</p>
                      <p className="mt-2 text-sm text-slate-500">
                        Start tracking medications, labs, or appointments to fill your day.
                      </p>
                      <div className="mt-6 flex justify-center">
                        <AddEntryDialog
                          onAddEntry={handleAddEntry}
                          buttonClassName="rounded-full bg-slate-900/90 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900"
                        />
                      </div>
                    </div>
                  ) : (
                    filteredEntries.map((entry, index) => (
                      <TimelineEntry
                        key={entry.id}
                        entry={entry}
                        isLast={index === filteredEntries.length - 1}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="summary">
              <section className="rounded-[24px] border border-white/60 bg-white/80 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur">                <SummaryCard entries={entries} />
              </section>
            </TabsContent>

            <TabsContent value="calendar">
              <section className="rounded-[24px] border border-white/60 bg-white/80 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur">                <div className="mb-6 space-y-1">
                <h2 className="text-2xl font-semibold text-slate-900">Select a Date</h2>
                <p className="text-sm text-slate-600">Choose a date to view its detailed timeline.</p>
              </div>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-2xl border border-white/70 bg-white"
                  />
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </main>

        <ChatbotWidget />
      </div>
    </TooltipProvider>
  );
};

export default Index;