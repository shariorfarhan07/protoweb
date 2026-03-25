"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompareState {
  ids: number[];
  add: (id: number) => void;
  remove: (id: number) => void;
  toggle: (id: number) => void;
  clear: () => void;
  has: (id: number) => boolean;
  isFull: () => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],

      add: (id) =>
        set((state) => {
          if (state.ids.includes(id) || state.ids.length >= 4) return state;
          return { ids: [...state.ids, id] };
        }),

      remove: (id) =>
        set((state) => ({ ids: state.ids.filter((i) => i !== id) })),

      toggle: (id) => {
        if (get().has(id)) get().remove(id);
        else get().add(id);
      },

      clear: () => set({ ids: [] }),
      has: (id) => get().ids.includes(id),
      isFull: () => get().ids.length >= 4,
    }),
    {
      name: "prototypebd-compare",
    }
  )
);
