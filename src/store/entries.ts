import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimelineEntryData, EntryStatus } from "@/components/TimelineEntry";

type EntriesState = {
    entries: TimelineEntryData[];
    addEntry: (e: Omit<TimelineEntryData, "id">) => string;
    bulkAdd: (arr: Omit<TimelineEntryData, "id">[]) => void;
    removeEntry: (id: string) => void;
    setStatus: (id: string, status: EntryStatus) => void;
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
            setStatus: (id, status) => {
                set({
                    entries: get().entries.map((en) =>
                        en.id === id ? { ...en, status } : en
                    ),
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