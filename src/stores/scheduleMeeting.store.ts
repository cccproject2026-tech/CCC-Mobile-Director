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
  meetingTitle: string;
  meetingDescription: string;
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
  setMeetingTitle: (title: string) => void;
  setMeetingDescription: (description: string) => void;
  setPlatformLabel: (label: string) => void;
  setAppointmentId: (id?: string) => void;
  reset: () => void;
};

const initialDraft: ScheduleMeetingDraft = {
  mode: "schedule",
  person: null,
  selectedDayYmd: "",
  selectedSlot: null,
  meetingTitle: "",
  meetingDescription: "",
  meetingOptionLabel: "Zoom",
  appointmentId: undefined,
};

export const useScheduleMeetingStore = create<ScheduleMeetingStore>((set) => ({
  draft: initialDraft,
  setMode: (mode) => set((s) => ({ draft: { ...s.draft, mode } })),
  setPerson: (person) =>
    set((s) => ({
      draft: {
        ...s.draft,
        person,
        meetingTitle: "",
        meetingDescription: "",
        selectedDayYmd: "",
        selectedSlot: null,
      },
    })),
  setDay: (selectedDayYmd) =>
    set((s) => ({ draft: { ...s.draft, selectedDayYmd } })),
  setSlot: (selectedSlot) => set((s) => ({ draft: { ...s.draft, selectedSlot } })),
  setMeetingTitle: (meetingTitle) =>
    set((s) => ({ draft: { ...s.draft, meetingTitle } })),
  setMeetingDescription: (meetingDescription) =>
    set((s) => ({ draft: { ...s.draft, meetingDescription } })),
  setPlatformLabel: (meetingOptionLabel) =>
    set((s) => ({ draft: { ...s.draft, meetingOptionLabel } })),
  setAppointmentId: (appointmentId) =>
    set((s) => ({ draft: { ...s.draft, appointmentId } })),
  reset: () => set({ draft: initialDraft }),
}));

