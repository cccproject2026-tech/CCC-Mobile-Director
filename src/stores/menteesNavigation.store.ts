import { create } from "zustand";

/** How the pastors (mentees) list action sheet should behave for this visit. */
export type MenteesListMenuMode = "assign-mentor-only" | "full";

type MenteesNavigationStore = {
  menuMode: MenteesListMenuMode;
  setAssignMentorOnlyMenu: () => void;
  setFullMenu: () => void;
};

export const useMenteesNavigationStore = create<MenteesNavigationStore>((set) => ({
  menuMode: "full",
  setAssignMentorOnlyMenu: () => set({ menuMode: "assign-mentor-only" }),
  setFullMenu: () => set({ menuMode: "full" }),
}));
