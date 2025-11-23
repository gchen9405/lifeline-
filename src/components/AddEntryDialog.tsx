import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimelineEntryData, EntryType, EntryStatus } from "./TimelineEntry";
import { Plus, X, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddEntryDialogProps {
  onAddEntry: (entry: Omit<TimelineEntryData, "id">) => void;
  buttonClassName?: string;
  triggerContent?: React.ReactNode;
}

export function AddEntryDialog({ onAddEntry, buttonClassName, triggerContent }: AddEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<EntryType>("medication");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [provider, setProvider] = useState("");
  const [location, setLocation] = useState("");
  const [followUp, setFollowUp] = useState("");

  // Recurrence state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState("daily");
  const [interval, setInterval] = useState("2");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timesPerDay, setTimesPerDay] = useState<string[]>(["09:00"]);

  // Lab state
  const [labValue, setLabValue] = useState("");
  const [labUnit, setLabUnit] = useState("");
  const [labRange, setLabRange] = useState("");
  const [labStatus, setLabStatus] = useState<EntryStatus>("returned");

  const resetForm = () => {
    setType("medication");
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setProvider("");
    setLocation("");
    setFollowUp("");
    setIsRecurring(false);
    setRecurrenceType("daily");
    setInterval("2");
    setSelectedDays([]);
    setTimesPerDay(["09:00"]);
    setLabValue("");
    setLabUnit("");
    setLabRange("");
    setLabStatus("returned");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !date || !time) return;

    // Format time to AM/PM
    const [hours, minutes] = time.split(":");
    const hoursNum = parseInt(hours, 10);
    const ampm = hoursNum >= 12 ? "PM" : "AM";
    const formattedHours = hoursNum % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedTime = `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;

    let recurrenceString: string | undefined;
    if (isRecurring) {
      if (recurrenceType === "daily") recurrenceString = "daily";
      else if (recurrenceType === "weekly") recurrenceString = "weekly";
      else if (recurrenceType === "interval") recurrenceString = JSON.stringify({ type: "interval", value: parseInt(interval) || 1, unit: "days" });
      else if (recurrenceType === "specific_days") recurrenceString = JSON.stringify({ type: "specific_days", days: selectedDays });
      else if (recurrenceType === "times_per_day") recurrenceString = JSON.stringify({ type: "times_per_day", times: timesPerDay });
    }

    const newEntry: Omit<TimelineEntryData, "id"> = {
      type,
      title,
      description,
      date,
      time: formattedTime,
      provider: provider || undefined,
      status: type === "lab" ? labStatus : "upcoming",
      recurring: recurrenceString,
      value: type === "lab" ? labValue : undefined,
      unit: type === "lab" ? labUnit : undefined,
      referenceRange: type === "lab" ? labRange : undefined,
      location: location || undefined,
      followUp: followUp || undefined,
    };

    onAddEntry(newEntry);
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={buttonClassName}>
          {triggerContent || (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Timeline Entry</DialogTitle>
          <DialogDescription>
            Add a new medication, lab result, or appointment to your timeline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Entry Type</Label>
            <Select value={type} onValueChange={(v: EntryType) => setType(v)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="lab">Lab Result</SelectItem>
                <SelectItem value="generic">Generic Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lab Status */}
          {type === "lab" && (
            <div className="space-y-2">
              <Label htmlFor="labStatus">Status</Label>
              <Select value={labStatus} onValueChange={(v: EntryStatus) => setLabStatus(v)}>
                <SelectTrigger id="labStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="awaiting_result">Awaiting Result</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder={
                type === "medication"
                  ? "e.g. Lisinopril"
                  : type === "appointment"
                    ? "e.g. Cardiology Checkup"
                    : type === "lab"
                      ? "e.g. Blood Test"
                      : "e.g. Symptom Log"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add details about this entry..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
            />
          </div>

          {type === "lab" && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="labValue">Result Value</Label>
                <Input
                  id="labValue"
                  placeholder="e.g. 98"
                  value={labValue}
                  onChange={(e) => setLabValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labUnit">Unit</Label>
                <Input
                  id="labUnit"
                  placeholder="e.g. mg/dL"
                  value={labUnit}
                  onChange={(e) => setLabUnit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labRange">Ref Range</Label>
                <Input
                  id="labRange"
                  placeholder="e.g. 70-100"
                  value={labRange}
                  onChange={(e) => setLabRange(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Provider (Optional)</Label>
            <Input
              id="provider"
              placeholder="e.g. Dr. Smith"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </div>

          {/* Location & Follow-up */}
          {(type === "appointment" || type === "generic") && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="location"
                    className="pl-9"
                    placeholder="e.g. 123 Medical Center Dr"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {type === "appointment" && (
                <div className="space-y-2">
                  <Label htmlFor="followUp">Follow-up Reminder (Optional)</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="followUp"
                      type="date"
                      className="pl-9"
                      value={followUp}
                      onChange={(e) => setFollowUp(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <Label htmlFor="recurring" className="text-sm font-normal cursor-pointer">
                Recurring Event
              </Label>
            </div>
            {isRecurring && (
              <div className="space-y-4 rounded-lg border bg-slate-50 p-4">
                <div className="space-y-2">
                  <Label htmlFor="recurrenceType">Recurrence Pattern</Label>
                  <Select
                    value={recurrenceType}
                    onValueChange={(value: any) => setRecurrenceType(value)}
                  >
                    <SelectTrigger id="recurrenceType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="interval">Every X Days</SelectItem>
                      <SelectItem value="specific_days">Specific Days</SelectItem>
                      <SelectItem value="times_per_day">X Times a Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {recurrenceType === "interval" && (
                  <div className="space-y-2">
                    <Label htmlFor="interval">Interval (Days)</Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      value={interval}
                      onChange={(e) => setInterval(e.target.value)}
                    />
                  </div>
                )}

                {recurrenceType === "specific_days" && (
                  <div className="flex flex-wrap gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                      <div key={day} className="flex items-center space-x-1">
                        <Checkbox
                          id={`day-${index}`}
                          checked={selectedDays.includes(index)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedDays([...selectedDays, index]);
                            else setSelectedDays(selectedDays.filter(d => d !== index));
                          }}
                        />
                        <Label htmlFor={`day-${index}`} className="text-xs font-normal">{day}</Label>
                      </div>
                    ))}
                  </div>
                )}

                {recurrenceType === "times_per_day" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-normal text-slate-500">Times</Label>
                    <div className="flex flex-wrap gap-2">
                      {timesPerDay.map((t, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <Input
                            type="time"
                            value={t}
                            onChange={(e) => {
                              const newTimes = [...timesPerDay];
                              newTimes[i] = e.target.value;
                              setTimesPerDay(newTimes);
                            }}
                            className="h-8 w-24 text-xs"
                          />
                          {timesPerDay.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setTimesPerDay(timesPerDay.filter((_, idx) => idx !== i))}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Plus className="h-4 w-4 rotate-45" />
                            </button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setTimesPerDay([...timesPerDay, "09:00"])}
                        className="h-8"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Time
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Entry</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
