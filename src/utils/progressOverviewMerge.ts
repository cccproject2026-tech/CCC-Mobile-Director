import {
  DirectorOverviewData,
  MonthlyDataItem,
  UserOverallProgress,
} from "@/types/progress.types";

function numFromApi(v: unknown): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function readRoleString(o: Record<string, unknown>): string {
  const r = o.role;
  if (typeof r === "string") return r;
  if (r && typeof r === "object") {
    const ro = r as Record<string, unknown>;
    if (typeof ro.name === "string") return ro.name;
    if (typeof ro.role === "string") return ro.role;
  }
  const u = o.user;
  if (u && typeof u === "object" && !Array.isArray(u)) {
    const ur = (u as Record<string, unknown>).role;
    if (typeof ur === "string") return ur;
  }
  return "";
}

function roleBucket(role: string): "mentor" | "pastor" | "other" {
  const r = (role || "").toLowerCase();
  if (r.includes("pastor")) return "pastor";
  if (r.includes("mentor") || r.includes("field-mentor")) return "mentor";
  return "other";
}

export function readUserOverallRow(row: UserOverallProgress | Record<string, unknown>) {
  const o = row as Record<string, unknown>;
  const overallProgress = numFromApi(o.overallProgress ?? o.overall_progress);
  const oc = o.overallCompleted ?? o.overall_completed;
  let overallCompleted = oc === true || oc === "true" || oc === 1;
  if (!overallCompleted) {
    const tr = numFromApi(o.totalRoadmaps ?? o.total_roadmaps);
    const cr = numFromApi(o.completedRoadmaps ?? o.completed_roadmaps);
    const ta = numFromApi(o.totalAssessments ?? o.total_assessments);
    const ca = numFromApi(o.completedAssessments ?? o.completed_assessments);
    if (overallProgress >= 99) overallCompleted = true;
    else if (tr > 0 && cr >= tr) overallCompleted = true;
    else if (ta > 0 && ca >= ta) overallCompleted = true;
  }
  return {
    role: readRoleString(o),
    overallProgress: Math.min(100, Math.max(0, overallProgress)),
    overallCompleted,
  };
}

function lastNMonths(n: number, ref = new Date()): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return out;
}

function monthlySeriesIsAllZeros(data: MonthlyDataItem[] | null | undefined): boolean {
  if (!data?.length) return true;
  return data.every(
    (r) => (r.mentorsCompleted ?? 0) === 0 && (r.pastorsCompleted ?? 0) === 0
  );
}

function buildMonthlyFromRows(rows: UserOverallProgress[], months = 12): MonthlyDataItem[] {
  const grid = lastNMonths(months);
  const key = (y: number, m: number) => y * 100 + m;
  const bucket = new Map<number, { mentors: number; pastors: number }>();
  for (const p of grid) {
    bucket.set(key(p.year, p.month), { mentors: 0, pastors: 0 });
  }
  const keyLast = key(grid[grid.length - 1].year, grid[grid.length - 1].month);

  for (const row of rows) {
    const o = row as Record<string, unknown>;
    const { role, overallCompleted } = readUserOverallRow(row);
    if (!overallCompleted) continue;
    const b = roleBucket(role);
    if (b === "other") continue;
    const dtRaw = o.completedAt ?? o.updatedAt ?? o.createdAt;
    let assignKey = keyLast;
    if (dtRaw) {
      const d = new Date(String(dtRaw));
      if (!Number.isNaN(d.getTime())) {
        const kk = key(d.getFullYear(), d.getMonth() + 1);
        if (bucket.has(kk)) assignKey = kk;
      }
    }
    const cell = bucket.get(assignKey)!;
    if (b === "mentor") cell.mentors += 1;
    else cell.pastors += 1;
  }

  return grid.map((p) => {
    const c = bucket.get(key(p.year, p.month))!;
    const d = new Date(p.year, p.month - 1, 1);
    return {
      month: p.month,
      year: p.year,
      monthName: d.toLocaleString("en-US", { month: "short" }),
      mentorsCompleted: c.mentors,
      pastorsCompleted: c.pastors,
    };
  });
}

export function unwrapOverallProgressList(raw: unknown): UserOverallProgress[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "object") return [];
  const body = raw as Record<string, unknown>;
  for (const k of ["data", "users", "items", "records", "rows", "list"]) {
    const v = body[k];
    if (Array.isArray(v)) return v as UserOverallProgress[];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner = v as Record<string, unknown>;
      for (const k2 of ["data", "users", "items"]) {
        if (Array.isArray(inner[k2])) return inner[k2] as UserOverallProgress[];
      }
    }
  }
  return [];
}

export function aggregateDirectorOverviewFromUsers(
  rows: UserOverallProgress[]
): DirectorOverviewData {
  const mentors: UserOverallProgress[] = [];
  const pastors: UserOverallProgress[] = [];
  for (const row of rows) {
    const { role } = readUserOverallRow(row);
    const b = roleBucket(role);
    if (b === "mentor") mentors.push(row);
    else if (b === "pastor") pastors.push(row);
  }

  const avg = (arr: UserOverallProgress[]) => {
    if (!arr.length) return 0;
    let s = 0;
    for (const row of arr) s += readUserOverallRow(row).overallProgress;
    return Math.min(100, Math.round((s / arr.length) * 10) / 10);
  };
  const countCompleted = (arr: UserOverallProgress[]) =>
    arr.filter((row) => readUserOverallRow(row).overallCompleted).length;

  const all = [...mentors, ...pastors];
  let overallCombinedProgress = 0;
  if (all.length) {
    let s = 0;
    for (const row of all) s += readUserOverallRow(row).overallProgress;
    overallCombinedProgress = Math.min(100, Math.round((s / all.length) * 10) / 10);
  }

  const monthlyData = buildMonthlyFromRows(all, 12);

  return {
    totalMentors: mentors.length,
    completedMentors: countCompleted(mentors),
    mentorsOverallProgress: avg(mentors),
    totalPastors: pastors.length,
    completedPastors: countCompleted(pastors),
    pastorsOverallProgress: avg(pastors),
    totalUsers: all.length,
    completedUsers: countCompleted(all),
    overallCombinedProgress,
    monthlyData,
  };
}

export function mergeDirectorOverviewWithUserAggregate(
  api: DirectorOverviewData | null,
  fromUsers: DirectorOverviewData | null
): DirectorOverviewData | null {
  if (
    !fromUsers ||
    (fromUsers.totalUsers === 0 && !fromUsers.totalMentors && !fromUsers.totalPastors)
  ) {
    return api;
  }
  if (!api) return fromUsers;

  const pick = (a: number, b: number) => (a > 0 ? a : b);
  const apiM = api.monthlyData ?? [];
  const uM = fromUsers.monthlyData ?? [];
  const useUserMonthly =
    uM.length > 0 && (apiM.length === 0 || monthlySeriesIsAllZeros(apiM));

  return {
    ...api,
    totalMentors: Math.max(api.totalMentors, fromUsers.totalMentors),
    totalPastors: Math.max(api.totalPastors, fromUsers.totalPastors),
    completedMentors: Math.max(api.completedMentors, fromUsers.completedMentors),
    completedPastors: Math.max(api.completedPastors, fromUsers.completedPastors),
    totalUsers: Math.max(api.totalUsers, fromUsers.totalUsers),
    completedUsers: Math.max(api.completedUsers, fromUsers.completedUsers),
    mentorsOverallProgress: pick(api.mentorsOverallProgress, fromUsers.mentorsOverallProgress),
    pastorsOverallProgress: pick(api.pastorsOverallProgress, fromUsers.pastorsOverallProgress),
    overallCombinedProgress: pick(api.overallCombinedProgress, fromUsers.overallCombinedProgress),
    monthlyData: useUserMonthly ? uM : apiM.length > 0 ? apiM : uM,
  };
}

export function mapCourseCompletedStatus(user: {
  fieldMentorInvitation?: unknown;
  hasIssuedCertificate?: boolean;
  hasCompleted?: boolean;
}): "completed" | "certificate_issued" | "invited" | null {
  if (user.fieldMentorInvitation) return "invited";
  if (user.hasIssuedCertificate) return "certificate_issued";
  if (user.hasCompleted) return "completed";
  return null;
}
