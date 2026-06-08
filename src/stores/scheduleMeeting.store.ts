import type { TimeSlot as APITimeSlot } from "@/types/appointment.types";
import { create } from "zustand";

export type SchedulePerson = {
  id: string;
  name: string;
  role?: string;
  profilePicture?: string;
  profileImage?: string;
};

export type ScheduleMeetingMode = "schedule" | "reschedule";

export type ScheduleMeetingDraft = {
  mode: ScheduleMeetingMode;
  person: SchedulePerson | null;
  selectedDayYmd: string;
  selectedSlot: APITimeSlot | null;
  meetingOptionLabel: string;
  /** Optional: used to find appointment for reschedule. */
  appointmentId?: string;
};

type ScheduleMeetingStore = {
  draft: ScheduleMeetingDraft;
  setMode: (mode: ScheduleMeetingMode) => void;
  setPerson: (person: SchedulePerson | null) => void;
  setDay: (ymd: string) => void;
  setSlot: (slot: APITimeSlot | null) => void;
  setPlatformLabel: (label: string) => void;
  setAppointmentId: (id?: string) => void;
  reset: () => void;
};

const initialDraft: ScheduleMeetingDraft = {
  mode: "schedule",
  person: null,
  selectedDayYmd: "",
  selectedSlot: null,
  meetingOptionLabel: "Zoom",
  appointmentId: undefined,
};

export const useScheduleMeetingStore = create<ScheduleMeetingStore>((set) => ({
  draft: initialDraft,
  setMode: (mode) => set((s) => ({ draft: { ...s.draft, mode } })),
  setPerson: (person) => set((s) => ({ draft: { ...s.draft, person } })),
  setDay: (selectedDayYmd) =>
    set((s) => ({ draft: { ...s.draft, selectedDayYmd } })),
  setSlot: (selectedSlot) => set((s) => ({ draft: { ...s.draft, selectedSlot } })),
  setPlatformLabel: (meetingOptionLabel) =>
    set((s) => ({ draft: { ...s.draft, meetingOptionLabel } })),
  setAppointmentId: (appointmentId) =>
    set((s) => ({ draft: { ...s.draft, appointmentId } })),
  reset: () => set({ draft: initialDraft }),
}));

