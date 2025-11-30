import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimelineEntryData, EntryStatus } from "@/components/TimelineEntry";

type EntriesState = {
    entries: TimelineEntryData[];
    addEntry: (e: Omit<TimelineEntryData, "id">) => string;
    bulkAdd: (arr: Omit<TimelineEntryData, "id">[]) => void;
    updateEntry: (id: string, newEntry: TimelineEntryData) => void;
    removeEntry: (id: string) => void;
    setStatus: (id: string, status: EntryStatus, date?: string) => void;
    clearAll: () => void;
};

export const useEntriesStore = create<EntriesState>()(
    persist(
        (set, get) => ({
            entries: [],
            addEntry: (e) => {
                const id = crypto.randomUUID();
                set({ entries: [{ ...e, id }, ...get().entries] });
                return id;
            },
            bulkAdd: (arr) => {
                const withIds = arr.map((e) => ({ ...e, id: crypto.randomUUID() }));
                set({ entries: [...withIds, ...get().entries] });
            },
            updateEntry: (id, newEntry) => {
                set({
                    entries: get().entries.map((en) =>
                        en.id === id ? newEntry : en
                    ),
                });
            },
            setStatus: (id, status, date) => {
                set({
                    entries: get().entries.map((en) => {
                        if (en.id !== id) return en;
                        
                        // For recurring entries with a specific date, store status per date
                        if (en.recurring && date) {
                            const statusByDate = { ...(en.statusByDate || {}), [date]: status };
                            return { ...en, statusByDate };
                        }
                        
                        // For non-recurring entries or when no date is provided, update the main status
                        return { ...en, status };
                    }),
                });
            },
            removeEntry: (id) => {
                set({ entries: get().entries.filter((en) => en.id !== id) });
            },
            clearAll: () => set({ entries: [] }),
        }),
        {
            name: "lifeline-entries-v1", // localStorage key
            partialize: (state) => ({ entries: state.entries }),
        }
    )
);