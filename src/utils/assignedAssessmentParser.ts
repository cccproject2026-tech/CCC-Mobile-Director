import { ApiAssessment, AssignedAssessmentView } from "@/types/assessment.types";

export type AssignedAssessmentRow = {
  assessmentId: string;
  assignmentId?: string;
  dueDate?: string;
  meetingDate?: string;
  updatedAt?: string;
  progressStatus?: "not_started" | "in_progress" | "completed" | "submitted" | "reviewed";
  hasCdp?: boolean;
  assessment: ApiAssessment;
};

export function parseAssignedAssessmentsListBody(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data;
    if (o.data && typeof o.data === "object") {
      const d = o.data as Record<string, unknown>;
      if (Array.isArray(d.assignments)) return d.assignments;
      if (Array.isArray(d.items)) return d.items;
      if (Array.isArray(d.rows)) return d.rows;
    }
  }
  return [];
}

function pickDueDate(row: Record<string, unknown>): string | undefined {
  const keys = [
    "dueDate",
    "deadline",
    "endDate",
    "assignedDueDate",
    "due_date",
  ] as const;
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  const assignment = row.assignment;
  if (assignment && typeof assignment === "object") {
    const a = assignment as Record<string, unknown>;
    for (const k of keys) {
      const v = a[k];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return undefined;
}

export function flattenAssignedAssessmentRow(item: unknown): Omit<AssignedAssessmentRow, "assessment"> & { assessment: Record<string, unknown> } | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const nested = row.assessment;
  const hasNested = nested && typeof nested === "object" && !Array.isArray(nested);

  if (hasNested) {
    const assessment = nested as Record<string, unknown>;
    const assessmentId = String(assessment._id ?? assessment.id ?? row.assessmentId ?? "").trim();
    if (!assessmentId) return null;
    return {
      assessmentId,
      assignmentId:
        row._id != null
          ? String(row._id)
          : row.assignmentId != null
            ? String(row.assignmentId)
            : undefined,
      assessment,
      dueDate: pickDueDate(row),
      meetingDate: typeof row.meetingDate === "string" ? row.meetingDate : undefined,
      updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : undefined,
    };
  }

  const assessmentId = String(row._id ?? row.id ?? row.assessmentId ?? "").trim();
  if (!assessmentId) return null;
  const hasShape = typeof row.name === "string" || Array.isArray(row.sections);
  if (!hasShape) return null;

  return {
    assessmentId,
    assignmentId: row.assignmentId != null ? String(row.assignmentId) : undefined,
    assessment: row,
    dueDate: pickDueDate(row),
    meetingDate: typeof row.meetingDate === "string" ? row.meetingDate : undefined,
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : undefined,
  };
}

export function mapProgressStatus(
  raw?: string
): AssignedAssessmentRow["progressStatus"] {
  const s = (raw ?? "").toLowerCase().replace(/\s+/g, "_");
  if (s === "completed" || s === "complete" || s === "reviewed") return "completed";
  if (s === "submitted" || s === "in_progress" || s === "in-progress") return "submitted";
  return "not_started";
}

export function isOverdue(dueDate?: string, status?: string): boolean {
  if (!dueDate) return false;
  const s = (status ?? "").toLowerCase();
  if (s === "completed" || s === "submitted" || s === "reviewed") return false;
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

export function formatDueDateLabel(dueDate?: string): string {
  if (!dueDate) return "No due date";
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return "No due date";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Completed assessments eligible for CDP list (web director home parity). */
export function isCompletedAssessmentForCdp(
  assessment: Pick<AssignedAssessmentView, "sections" | "progressStatus">,
): boolean {
  const status = String(assessment.progressStatus ?? "")
    .toLowerCase()
    .trim();
  if (
    status === "completed" ||
    status === "reviewed" ||
    status === "submitted"
  ) {
    return true;
  }
  return (
    Array.isArray(assessment.sections) &&
    assessment.sections.some(
      (section) =>
        Array.isArray(section?.recommendations) &&
        section.recommendations.length > 0,
    )
  );
}

export function hasCdpPayload(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const root = body as Record<string, unknown>;
  const data = (root.data ?? root) as Record<string, unknown>;
  const sections = data.sections ?? data.sectionRecommendations;
  if (!Array.isArray(sections)) return false;
  for (const sec of sections) {
    if (!sec || typeof sec !== "object") continue;
    const s = sec as Record<string, unknown>;
    const layers = s.layers;
    if (!Array.isArray(layers)) continue;
    for (const layer of layers) {
      if (!layer || typeof layer !== "object") continue;
      const l = layer as Record<string, unknown>;
      const recs = l.recommendations;
      if (Array.isArray(recs) && recs.some((r) => String(r).trim())) return true;
      if (typeof l.mentorCdp === "string" && l.mentorCdp.trim()) return true;
    }
  }
  return false;
}
