import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@assessment_meeting_links";

export type AssessmentMeetingLink = {
  appointmentId: string;
  meetingDate: string;
  meetingLink?: string;
};

export async function loadAssessmentMeetingLinks(): Promise<
  Record<string, AssessmentMeetingLink>
> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, AssessmentMeetingLink>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function saveAssessmentMeetingLink(
  assessmentId: string,
  link: AssessmentMeetingLink,
): Promise<void> {
  const existing = await loadAssessmentMeetingLinks();
  existing[assessmentId] = link;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export async function getAssessmentMeetingLink(
  assessmentId: string,
): Promise<AssessmentMeetingLink | null> {
  const all = await loadAssessmentMeetingLinks();
  return all[assessmentId] ?? null;
}

/** Notes prefix when scheduling from an assessment flow (for API-side discovery). */
export const ASSESSMENT_MEETING_NOTE_PREFIX = "assessment:";

export function assessmentMeetingNote(assessmentId: string): string {
  return `${ASSESSMENT_MEETING_NOTE_PREFIX}${assessmentId}`;
}

export function parseAssessmentIdFromNotes(notes?: string): string | null {
  if (!notes?.startsWith(ASSESSMENT_MEETING_NOTE_PREFIX)) return null;
  return notes.slice(ASSESSMENT_MEETING_NOTE_PREFIX.length).trim() || null;
}
