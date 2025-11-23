import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { X, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";

interface EditEntryDialogProps {
    entry: TimelineEntryData;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedEntry: TimelineEntryData) => void;
    onRemove: (id: string) => void;
}

export function EditEntryDialog({ entry, isOpen, onClose, onUpdate, onRemove }: EditEntryDialogProps) {
    const [type, setType] = useState<EntryType>(entry.type);
    const [title, setTitle] = useState(entry.title);
    const [description, setDescription] = useState(entry.description || "");
    const [date, setDate] = useState(entry.date);
    const [time, setTime] = useState(() => format(parse(entry.time, "hh:mm a", new Date()), "HH:mm"));
    const [provider, setProvider] = useState(entry.provider || "");
    const [location, setLocation] = useState(entry.location || "");
    const [followUp, setFollowUp] = useState(entry.followUp || "");

    // Recurrence state
    const [isRecurring, setIsRecurring] = useState(!!entry.recurring);
    const [recurrenceType, setRecurrenceType] = useState<"daily" | "weekly" | "interval" | "specific_days" | "times_per_day">("daily");
    const [interval, setInterval] = useState("1"); // Renamed from intervalDays
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [timesPerDay, setTimesPerDay] = useState<string[]>(["09:00"]);

    // Lab specific fields
    const [labValue, setLabValue] = useState(entry.value || "");
    const [labUnit, setLabUnit] = useState(entry.unit || "");
    const [labRange, setLabRange] = useState(entry.referenceRange || "");
    const [labStatus, setLabStatus] = useState<EntryStatus>(entry.status || "awaiting_result");


    useEffect(() => {
        if (isOpen) {
            setType(entry.type);
            setTitle(entry.title);
            setDescription(entry.description || "");
            setDate(entry.date);
            setTime(format(parse(entry.time, "hh:mm a", new Date()), "HH:mm"));
            setProvider(entry.provider || "");
            setLocation(entry.location || "");
            setFollowUp(entry.followUp || "");
            setIsRecurring(!!entry.recurring); // Renamed from setRecurring
            setLabValue(entry.value || "");
            setLabUnit(entry.unit || "");
            setLabRange(entry.referenceRange || "");
            setLabStatus(entry.status || "awaiting_result");

            const initialRecurrence = entry.recurring || 'daily';

            if (typeof initialRecurrence === 'string' && initialRecurrence.startsWith('{')) {
                try {
                    const parsed = JSON.parse(initialRecurrence);
                    setRecurrenceType(parsed.type);
                    if (parsed.type === 'interval') setInterval(parsed.value.toString()); // Use setInterval
                    if (parsed.type === 'specific_days') setSelectedDays(parsed.days);
                    if (parsed.type === 'times_per_day') setTimesPerDay(parsed.times);
                } catch (e) {
                    setRecurrenceType('daily');
                }
            } else {
                // Legacy or simple string
                if (initialRecurrence === 'daily' || initialRecurrence === 'weekly') {
                    setRecurrenceType(initialRecurrence);
                } else {
                    // Fallback for unknown strings
                    setRecurrenceType('daily');
                }
            }
        }
    }, [entry, isOpen]);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !date || !time) return;

        const [hours, minutes] = time.split(":");
        const hoursNum = parseInt(hours, 10);
        const ampm = hoursNum >= 12 ? "PM" : "AM";
        const formattedHours = hoursNum % 12 || 12;
        const formattedTime = `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;

        const recurrenceString = (() => {
            if (recurrenceType === "daily") return "daily";
            if (recurrenceType === "weekly") return "weekly";
            if (recurrenceType === "interval") return JSON.stringify({ type: "interval", value: parseInt(interval) || 1, unit: "days" }); // Use interval
            if (recurrenceType === "specific_days") return JSON.stringify({ type: "specific_days", days: selectedDays });
            if (recurrenceType === "times_per_day") return JSON.stringify({ type: "times_per_day", times: timesPerDay });
            return undefined;
        })();

        const updatedEntry: TimelineEntryData = {
            ...entry,
            type,
            title,
            description,
            date,
            time: formattedTime,
            provider: provider || undefined,
            location: location || undefined,
            followUp: followUp || undefined,
            status: type === "lab" ? labStatus : entry.status,
            recurring: isRecurring ? recurrenceString : undefined,
            value: type === "lab" ? labValue : undefined,
            unit: type === "lab" ? labUnit : undefined,
            referenceRange: type === "lab" ? labRange : undefined,
        };

        onUpdate(updatedEntry);
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this entry?")) {
            onRemove(entry.id);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Timeline Entry</DialogTitle>
                    <DialogDescription>
                        Update the details for this entry or delete it.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Entry Type</Label>
                        <Select value={type} onValueChange={(v: EntryType) => setType(v)}>
                            <SelectTrigger id="edit-type">
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
                            <Label htmlFor="edit-labStatus">Status</Label>
                            <Select value={labStatus} onValueChange={(v: EntryStatus) => setLabStatus(v)}>
                                <SelectTrigger id="edit-labStatus">
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
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                            id="edit-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                    </div>

                    {type === "lab" && (
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-labValue">Result Value</Label>
                                <Input
                                    id="edit-labValue"
                                    placeholder="e.g. 98"
                                    value={labValue}
                                    onChange={(e) => setLabValue(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-labUnit">Unit</Label>
                                <Input
                                    id="edit-labUnit"
                                    placeholder="e.g. mg/dL"
                                    value={labUnit}
                                    onChange={(e) => setLabUnit(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-labRange">Ref Range</Label>
                                <Input
                                    id="edit-labRange"
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
                            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-provider">Provider (Optional)</Label>
                        <Input
                            id="edit-provider"
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                        />
                    </div>

                    {/* Location & Follow-up */}
                    {(type === "appointment" || type === "generic") && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-location">Location (Optional)</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="edit-location"
                                        className="pl-9"
                                        placeholder="e.g. 123 Medical Center Dr"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>
                            </div>

                            {type === "appointment" && (
                                <div className="space-y-2">
                                    <Label htmlFor="edit-followUp">Follow-up Reminder (Optional)</Label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="edit-followUp"
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
                            <Checkbox id="recurring" checked={isRecurring} onCheckedChange={(checked) => setIsRecurring(checked as boolean)} />
                            <Label htmlFor="recurring" className="text-sm font-normal cursor-pointer">Recurring Event</Label>
                        </div>
                        {isRecurring && (
                            <div className="space-y-3 pt-2">
                                <Select
                                    value={recurrenceType}
                                    onValueChange={(value: any) => setRecurrenceType(value)}
                                >
                                    <SelectTrigger id="recurrenceType" className="h-9">
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
                                                    id={`edit-day-${index}`}
                                                    checked={selectedDays.includes(index)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setSelectedDays([...selectedDays, index]);
                                                        else setSelectedDays(selectedDays.filter(d => d !== index));
                                                    }}
                                                />
                                                <Label htmlFor={`edit-day-${index}`} className="text-xs font-normal">{day}</Label>
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

                    <DialogFooter className="gap-2 sm:justify-between">
                        <Button type="button" variant="destructive" onClick={handleDelete}>Delete</Button>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}