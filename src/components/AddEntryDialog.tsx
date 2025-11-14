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
import { Plus } from "lucide-react";
import { TimelineEntryData } from "./TimelineEntry";
import { cn } from "@/lib/utils";

interface AddEntryDialogProps {
  onAddEntry: (entry: Omit<TimelineEntryData, "id">) => void;
  buttonClassName?: string;
}

export function AddEntryDialog({ onAddEntry, buttonClassName }: AddEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TimelineEntryData["type"]>("medication");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [provider, setProvider] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<TimelineEntryData['recurring']>('daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !date || !time) return;

    // Format time to AM/PM
    const [hours, minutes] = time.split(":");
    const hoursNum = parseInt(hours, 10);
    const ampm = hoursNum >= 12 ? "PM" : "AM";
    const formattedHours = hoursNum % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedTime = `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;

    onAddEntry({
      type,
      title,
      description,
      time: formattedTime,
      status: "upcoming",
      provider: provider || undefined,
      date: date,
      recurring: recurring ? recurrence : undefined,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setProvider("");
    setRecurring(false);
    setRecurrence('daily');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className={cn("gap-2", buttonClassName)}>
          <Plus className="h-5 w-5" />
          Add Entry
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
            <Select value={type} onValueChange={(value) => setType(value as TimelineEntryData["type"])}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="lab">Lab Result</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Morning Medication or Doctor Appointment"
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
              placeholder="e.g., Dr. Smith, City Hospital"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={recurring}
                onCheckedChange={(checked) => setRecurring(checked as boolean)}
              />
              <Label htmlFor="recurring" className="text-sm font-normal cursor-pointer">
                Recurring Event
              </Label>
            </div>
            {recurring && (
              <Select value={recurrence} onValueChange={(value) => setRecurrence(value as TimelineEntryData['recurring'])}>
                <SelectTrigger id="recurrence" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
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
