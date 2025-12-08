import { useEffect, useRef } from "react";
import { useEntriesStore } from "@/store/entries";
import { toast, Toaster } from "sonner";
import { differenceInMinutes, parseISO } from "date-fns";
import { BellRing } from "lucide-react";

const REMINDER_THRESHOLD_MINUTES = 15;
const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

const convertTo24Hour = (timeStr: string): string => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, '0')}:${minutes}`;
};
/**
 * A system that runs in the background to check for upcoming events
 * and sends reminders to the user.
 */
export function ReminderSystem() {
    const entries = useEntriesStore((s) => s.entries);
    const reminded = useRef(new Set<string>());

    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();

            for (const entry of entries) {
                // Only remind for upcoming medications and appointments
                if (entry.type !== "medication" && entry.type !== "appointment") {
                    continue;
                }

                // Don't remind for entries that are already handled, have no time, or are not upcoming/pending.
                if (
                    (entry.status !== "upcoming") ||
                    !entry.date ||
                    !entry.time
                ) {
                    continue;
                }

                // Don't remind if we already have for this entry
                if (reminded.current.has(entry.id)) {
                    continue;
                }

                const time24 = convertTo24Hour(entry.time);
                const entryDateTime = parseISO(`${entry.date}T${time24}`);
                const minutesUntilEntry = differenceInMinutes(entryDateTime, now);

                if (minutesUntilEntry > 0 && minutesUntilEntry <= REMINDER_THRESHOLD_MINUTES) {
                    toast(`Reminder: time for ${entry.title}`, {
                        description: `in ${minutesUntilEntry} minutes.`,
                        icon: <BellRing className="h-4 w-4" />,
                    });
                    reminded.current.add(entry.id); // Mark as reminded
                }
            }
        };

        // Check immediately on load and then set an interval
        checkReminders();
        const intervalId = setInterval(checkReminders, CHECK_INTERVAL_MS);

        // Cleanup on unmount
        return () => clearInterval(intervalId);
    }, [entries]);

    return null; // This component does not render anything
}