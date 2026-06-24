import { create } from "zustand";

export type MentorsListMenuMode = "assign-mentee-only" | "full";

type MentorsNavigationStore = {
  menuMode: MentorsListMenuMode;
  setAssignMenteeOnlyMenu: () => void;
  setFullMenu: () => void;
};

export const useMentorsNavigationStore = create<MentorsNavigationStore>((set) => ({
  menuMode: "full",
  setAssignMenteeOnlyMenu: () => set({ menuMode: "assign-mentee-only" }),
  setFullMenu: () => set({ menuMode: "full" }),
}));
