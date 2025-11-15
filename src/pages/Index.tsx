import { useEffect, useMemo, useState, useCallback } from "react";
import {
  TimelineEntry,
  TimelineEntryData,
  EntryStatus,
} from "@/components/TimelineEntry";
import { ReminderSystem } from "@/components/ReminderSystem";
import { AddEntryDialog } from "@/components/AddEntryDialog";
import { SummaryCard } from "@/components/SummaryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  format,
  parseISO,
  isAfter,
  isEqual,
  getDay,
  addDays,
} from "date-fns";
import { EditEntryDialog } from "@/components/EditEntryDialog";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEntriesStore } from "@/store/entries";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingEntry, setEditingEntry] =
    useState<TimelineEntryData | null>(null);

  // 🔗 read/write global store
  const entries = useEntriesStore((s) => s.entries);
  const addEntry = useEntriesStore((s) => s.addEntry);
  const bulkAdd = useEntriesStore((s) => s.bulkAdd);
  const updateEntry = useEntriesStore((s) => s.updateEntry);
  const setStatus = useEntriesStore((s) => s.setStatus);
  const removeEntry = useEntriesStore((s) => s.removeEntry);

  // ---------- 1) Seed fixed mock data relative to "today" ----------
  useEffect(() => {
    if (entries.length === 0) {
      const now = new Date();
      const d = (offset: number) =>
        format(addDays(now, offset), "yyyy-MM-dd");

      bulkAdd([
        // Today
        {
          type: "lab",
          title: "Returned Lab Result",
          description: "Fasting glucose: 105 mg/dL (normal range)",
          time: "07:30 AM",
          status: "completed",
          provider: "City Hospital Lab",
          date: d(0),
        },
        {
          type: "medication",
          title: "Morning Medication – Lisinopril 10mg",
          description: "Blood pressure medication prescribed by Dr. Johnson",
          time: "08:00 AM",
          status: "taken",
          provider: "Dr. Johnson (Primary Care)",
          date: d(0),
          recurring: "weekly",
        },
        {
          type: "appointment",
          title: "Cardiology Follow-up",
          description: "Quarterly check-up with cardiologist",
          time: "10:00 AM",
          status: "completed",
          provider: "Dr. Williams (Cardiology)",
          date: d(0),
        },

        // Tomorrow
        {
          type: "medication",
          title: "Evening Medication – Metformin 500mg",
          description: "Diabetes medication prescribed by Dr. Smith",
          time: "06:00 PM",
          status: "taken",
          provider: "Dr. Smith (Endocrinologist)",
          date: d(1),
          recurring: "weekly",
        },
        {
          type: "appointment",
          title: "Nutrition Counseling",
          description: "Follow-up visit to review meal plan",
          time: "02:00 PM",
          status: "upcoming",
          provider: "City Wellness Clinic",
          date: d(1),
        },

        // +2 days
        {
          type: "medication",
          title: "Morning Medication – Lisinopril 10mg",
          description: "Blood pressure medication prescribed by Dr. Johnson",
          time: "08:00 AM",
          status: "taken",
          provider: "Dr. Johnson (Primary Care)",
          date: d(2),
          recurring: "weekly",
        },

        // +3 days
        {
          type: "medication",
          title: "Morning Medication – Lisinopril 10mg",
          description: "Blood pressure medication prescribed by Dr. Johnson",
          time: "08:00 AM",
          status: "missed",
          provider: "Dr. Johnson (Primary Care)",
          date: d(3),
          recurring: "weekly",
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

  const handleRemoveEntry = (id: string) => {
    removeEntry(id);
  };

  const handleUpdateEntry = useCallback(
    (updatedEntry: TimelineEntryData) => {
      updateEntry(updatedEntry.id, updatedEntry);
      setEditingEntry(null); // Close dialog on save
    },
    [updateEntry]
  );

  // ---------- 2) "Real" today vs selected calendar date ----------

  // real system "today"
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(
    () => format(today, "yyyy-MM-dd"),
    [today]
  );
  const todayFriendly = useMemo(
    () =>
      today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [today]
  );

  // selected date for calendar view
  const selectedDateStr = useMemo(
    () => format(selectedDate, "yyyy-MM-dd"),
    [selectedDate]
  );
  const selectedFriendly = useMemo(
    () =>
      selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [selectedDate]
  );

  const parseTime = (timeStr: string): number => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Entries strictly for *today* tab (always real today)
  const todayEntries = useMemo(
    () =>
      entries
        .filter((e) => e.date === todayStr)
        .sort((a, b) => parseTime(a.time) - parseTime(b.time)),
    [entries, todayStr]
  );

  // Entries for the *selected date* on the calendar tab
  const selectedDayEntries = useMemo(
    () =>
      entries
        .filter((e) => {
          const entryDate = parseISO(e.date);
          if (e.date === selectedDateStr) return true;

          if (isAfter(selectedDate, entryDate) || isEqual(selectedDate, entryDate)) {
            if (e.recurring === "daily") return true;
            if (e.recurring === "weekly" && getDay(selectedDate) === getDay(entryDate))
              return true;
          }
          return false;
        })
        .sort((a, b) => parseTime(a.time) - parseTime(b.time)),
    [entries, selectedDate, selectedDateStr]
  );

  const tabConfig = [
    { value: "timeline", label: "Today", Icon: CalendarDays },
    { value: "summary", label: "Summary", Icon: TrendingUp },
    { value: "calendar", label: "Calendar", Icon: CalendarIcon },
  ] as const;

  return (
    <TooltipProvider>
      <Sonner />
      <ReminderSystem />
      <div className="min-h-screen px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* App name pinned to top-left */}
        <header className="mb-6 flex items-center">
          <span className="font-['IBM_Plex_Sans_Condensed'] font-semibold text-[38px] tracking-[-0.06em] text-[#0F1729]">
            Lifeline-
          </span>
        </header>

        <main className="mx-auto flex max-w-6xl flex-col gap-8">
          <Tabs defaultValue="timeline" className="space-y-8">
            {/* HERO */}
            <div className="space-y-1">
              <h1 className="font-['IBM_Plex_Sans_Condensed'] font-semibold text-[48px] leading-none tracking-tighter text-[#0F1729] sm:text-[72px]">
                Welcome Back
              </h1>
              <p className="text-[24px] font-medium tracking-[-0.025em] text-[#0F1729]">
                See what’s happening across your health: daily updates to your complete health picture.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* equal-width segmented control */}
              <TabsList className="mt-1 inline-flex w-full max-w-md rounded-full bg-white/70 p-1 ring-1 ring-black/5 shadow-sm backdrop-blur">
                {tabConfig.map(({ value, label, Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium tracking-[-0.01em] text-slate-600 transition
                               data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <AddEntryDialog
                onAddEntry={handleAddEntry}
                buttonClassName="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-lg transition hover:bg-slate-900/90"
              />
            </div>

            {/* -------- TODAY TAB (real today only) -------- */}
            <TabsContent value="timeline">
              <section className="rounded-3xl border border-white/50 bg-white/40 p-8 shadow-[0_30px_70px_rgba(88,80,236,0.22)] backdrop-blur">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Today
                  </p>
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[#0F1729]">
                    {todayFriendly}
                  </h2>
                </div>

                <div className="mt-10 space-y-10">
                  {todayEntries.length === 0 ? (
                    <div className="rounded-xl border border-white/60 bg-white/90 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
                      <p className="text-lg font-semibold text-slate-700">
                        No entries yet
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Start tracking medications, labs, or appointments to fill your day.
                      </p>
                    </div>
                  ) : (
                    todayEntries.map((entry, index) => (
                      <TimelineEntry
                        key={entry.id}
                        entry={entry}
                        isLast={index === todayEntries.length - 1}
                        onStatusChange={handleStatusChange}
                        onEdit={() => setEditingEntry(entry)}
                        onRemove={handleRemoveEntry}
                      />
                    ))
                  )}
                </div>
              </section>
            </TabsContent>

            {/* -------- SUMMARY TAB -------- */}
            <TabsContent value="summary">
              <section className="rounded-3xl border border-white/50 bg-white/40 p-8 shadow-[0_30px_70px_rgba(88,80,236,0.22)] backdrop-blur">
                <SummaryCard entries={entries} />
              </section>
            </TabsContent>

            {/* -------- CALENDAR TAB (selected day) -------- */}
            <TabsContent value="calendar">
              <section className="grid gap-8 rounded-3xl border border-white/50 bg-white/40 p-8 shadow-[0_30px_70px_rgba(88,80,236,0.22)] backdrop-blur lg:grid-cols-[1.1fr,2fr]">
                {/* Calendar column pinned to top */}
                <div className="flex items-start justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="w-full max-w-sm rounded-2xl border border-white/60 bg-white/80 px-4 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.09)] backdrop-blur-sm"
                    classNames={{
                      months: "space-y-4",
                      // 👇 add horizontal padding + space for nav buttons
                      caption: "flex items-center justify-between px-5 pb-3",
                      // keep label centered between the two nav buttons
                      caption_label:
                        "flex-1 text-center text-sm font-medium tracking-[-0.01em] text-[#0F1729]",
                      // slightly larger button and inner padding to pull it off the edge
                      nav_button:
                        "inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100",
                      head_row: "grid grid-cols-7",
                      head_cell:
                        "flex items-center justify-center text-xs font-medium text-slate-500",
                      row: "mt-1 grid w-full grid-cols-7",
                      cell: "flex h-9 items-center justify-center",
                      day:
                        "h-9 w-9 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none",
                      day_selected:
                        "h-9 w-9 rounded-full bg-[#0F1729] text-white hover:bg-[#0F1729] hover:text-white focus:outline-none",
                      day_today: "border border-slate-300 text-[#0F1729]",
                      day_outside: "text-slate-300",
                    }}
                  />
                </div>

                {/* Right column: entries for selected date */}
                <div className="lg:col-span-1">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#0F1729]">
                      {selectedFriendly}
                    </h2>
                  </div>
                  <div className="mt-6 space-y-4">
                    {selectedDayEntries.length > 0 ? (
                      selectedDayEntries.map((entry, index) => (
                        <TimelineEntry
                          key={entry.id}
                          entry={entry}
                          isLast={index === selectedDayEntries.length - 1}
                          onStatusChange={handleStatusChange}
                          onEdit={() => setEditingEntry(entry)}
                          onRemove={handleRemoveEntry}
                        />
                      ))
                    ) : (
                      <div className="rounded-xl border border-white/60 bg-white/80 p-6 text-center shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
                        <p className="font-semibold text-slate-800">
                          No entries for this day.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </main>

        <ChatbotWidget />

        {editingEntry && (
          <EditEntryDialog
            entry={editingEntry}
            isOpen={!!editingEntry}
            onClose={() => setEditingEntry(null)}
            onUpdate={handleUpdateEntry}
            onRemove={(id) => {
              handleRemoveEntry(id);
              setEditingEntry(null);
            }}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default Index;