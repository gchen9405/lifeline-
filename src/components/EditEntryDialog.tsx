import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { TimelineEntryData } from "./TimelineEntry";
import { format, parse } from "date-fns";

interface EditEntryDialogProps {
    entry: TimelineEntryData;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (entry: TimelineEntryData) => void;
    onRemove: (id: string) => void;
}

export function EditEntryDialog({ entry, isOpen, onClose, onUpdate, onRemove }: EditEntryDialogProps) {
    const [type, setType] = useState<TimelineEntryData["type"]>(entry.type);
    const [title, setTitle] = useState(entry.title);
    const [description, setDescription] = useState(entry.description);
    const [date, setDate] = useState(entry.date);
    const [time, setTime] = useState(() => format(parse(entry.time, "hh:mm a", new Date()), "HH:mm"));
    const [provider, setProvider] = useState(entry.provider || "");
    const [recurring, setRecurring] = useState(!!entry.recurring);
    const [recurrence, setRecurrence] = useState<TimelineEntryData['recurring']>(entry.recurring || 'daily');

    useEffect(() => {
        if (isOpen) {
            setType(entry.type);
            setTitle(entry.title);
            setDescription(entry.description);
            setDate(entry.date);
            setTime(format(parse(entry.time, "hh:mm a", new Date()), "HH:mm"));
            setProvider(entry.provider || "");
            setRecurring(!!entry.recurring);
            setRecurrence(entry.recurring || 'daily');
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

        onUpdate({
            ...entry,
            type,
            title,
            description,
            time: formattedTime,
            provider: provider || undefined,
            date: date,
            recurring: recurring ? recurrence : undefined,
        });
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
                        <Select value={type} onValueChange={(value) => setType(value as TimelineEntryData["type"])}>
                            <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="medication">Medication</SelectItem>
                                <SelectItem value="lab">Lab Result</SelectItem>
                                <SelectItem value="appointment">Appointment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                    </div>

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
                        <Label htmlFor="provider">Provider (Optional)</Label>
                        <Input id="provider" value={provider} onChange={(e) => setProvider(e.target.value)} />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="recurring" checked={recurring} onCheckedChange={(checked) => setRecurring(checked as boolean)} />
                            <Label htmlFor="recurring" className="text-sm font-normal cursor-pointer">Recurring Event</Label>
                        </div>
                        {recurring && (
                            <Select value={recurrence} onValueChange={(value) => setRecurrence(value as TimelineEntryData['recurring'])}>
                                <SelectTrigger id="recurrence" className="h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                </SelectContent>
                            </Select>
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
        </Dialog>
    );
}