import type { PastorFocusItem, PastorFocusSection } from "@/components/sheets/PastorFocusBottomSheet";
import { useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useMentees } from "@/hooks/mentees/useMentees";
import { useAssessments } from "@/hooks/assessments/useAssessments";
import { useMentorshipSessions } from "@/hooks/roadmaps/useMentorshipSessions";
import { useAuthStore } from "@/stores";
import { assessmentService } from "@/services/assessment.service";
import { roadmapService } from "@/services/roadmap.service";
import type { Appointment } from "@/types/appointment.types";
import { formatSessionDate } from "@/utils/date";
import { sessionOrdinalLabel, sessionTopicLine } from "@/constants/sessionTitles";
import { format } from "date-fns";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { resolveRoadmapThreadId } from "@/lib/roadmap/helpers";
import { mapWithConcurrency } from "@/utils/apiConcurrency";

const MAX_ITEMS_PER_SECTION = 3;
const MAX_MENTEES_FOR_FOCUS = 5;
const MAX_ASSESSMENTS_PER_MENTEE_FOR_SURVEY = 3;
const MAX_ROADMAPS_PER_MENTEE_FOR_QUERIES = 4;
const MAX_ROADMAPS_FOR_QUERIES_TOTAL = 10;

const toEpochMs = (value?: string | null) => {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "dd MMM, h:mm a");
};

const toDateOnlyISO = () => {
  // Using ISO for consistent "today" comparisons with appointment.meetingDate.split("T")[0]
  return new Date().toISOString().split("T")[0];
};

const clampByLimit = <T,>(arr: T[], limit: number) => arr.slice(0, Math.max(0, limit));

type MentorFocusResult = {
  pastorQueries: PastorFocusItem[];
  surveySubmissions: PastorFocusItem[];
  debug?: {
    scannedPastors: number;
    scannedRoadmaps: number;
    returnedThreads: number;
    returnedQueries: number;
    returnedPending: number;
    samplePastors: string[];
    sampleRoadmapIds: string[];
  };
};

export const useMentorFocusItems = () => {
  const { user } = useAuthStore();

  const mentorId = user?.id;
  const todayISO = useMemo(() => toDateOnlyISO(), []);

  const {
    appointments,
    isLoading: isLoadingAppointments,
    getUpcomingAppointments,
  } = useAppointments({ mentorId });

  const {
    data: mentorshipProgramSessions = [],
    isLoading: isLoadingMentorshipSessions,
  } = useMentorshipSessions(mentorId);

  // Assigned mentees (these are the "Pastors" the mentor supports)
  const {
    data: menteesData,
    isLoading: isLoadingMentees,
  } = useMentees(MAX_MENTEES_FOR_FOCUS, mentorId);

  const allRoadmapsQuery = useAllRoadmaps();
  const { data: assessments, isLoading: isLoadingAssessments } = useAssessments();

  const mentees = useMemo(() => {
    const pages = menteesData?.pages ?? [];
    const all = pages.flatMap((p) => p.mentees ?? []);
    return all;
  }, [menteesData]);

  const pastorQueriesScanStats = useMemo(() => {
    const menteeCount = (mentees as any[]).filter((m) => m?.id).length;
    const totalAssignedRoadmaps = (mentees as any[]).reduce((acc, m) => {
      const ids = Array.isArray(m?.assignedRoadmapIds) ? m.assignedRoadmapIds : [];
      return acc + Math.min(ids.length, MAX_ROADMAPS_PER_MENTEE_FOR_QUERIES);
    }, 0);
    return { menteeCount, totalAssignedRoadmaps };
  }, [mentees]);

  const menteeIdsKey = useMemo(() => {
    const ids = (mentees as any[])
      .map((m) => String(m?.id ?? ""))
      .filter(Boolean)
      .sort();
    return ids.join(",");
  }, [mentees]);

  const menteeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of mentees as any[]) {
      if (!m?.id) continue;
      const name = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim();
      map.set(String(m.id), name || "Pastor");
    }
    return map;
  }, [mentees]);

  const roadmaps = allRoadmapsQuery.data ?? [];
  const roadmapIdsKey = useMemo(() => {
    const ids = (roadmaps as any[])
      .map((r) => String(r?._id ?? ""))
      .filter(Boolean)
      .sort()
      .slice(0, 20);
    return ids.join(",");
  }, [roadmaps]);

  const roadmapNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of roadmaps as any[]) {
      if (!r?._id) continue;
      map.set(String(r._id), String(r.name ?? "Roadmap"));
    }
    return map;
  }, [roadmaps]);

  const assessmentNameById = useMemo(() => {
    const map = new Map<string, string>();
    (assessments ?? []).forEach((a: any) => {
      if (!a?._id) return;
      map.set(String(a._id), String(a.name ?? a.title ?? "Survey"));
    });
    return map;
  }, [assessments]);

  const startOfTodayLocal = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  /** Roadmap mentorship sessions (same source as Sessions tab) — today. */
  const mentorshipProgramTodayItems = useMemo((): PastorFocusItem[] => {
    const list = mentorshipProgramSessions
      .filter((session) => {
        const date = new Date(session.scheduledDate);
        if (Number.isNaN(date.getTime())) return false;
        return date.toDateString() === startOfTodayLocal.toDateString();
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledDate).getTime() -
          new Date(b.scheduledDate).getTime(),
      );
    return clampByLimit(
      list.map((session) => {
        const pastor = session.pastorName?.trim()
          ? session.pastorName
          : "Pastor";
        return {
          id: `mentorship-program-today-${session.id}`,
          title: sessionTopicLine(session.sessionNumber),
          description: `${sessionOrdinalLabel(session.sessionNumber)} · ${formatSessionDate(session.scheduledDate)} • ${session.status}`,
          meta: pastor,
          accentColor: "#38BDF8",
          route: {
            pathname: `/(mentor)/(tabs)/sessions/${session.id}`,
            params: {},
          },
        } as PastorFocusItem;
      }),
      MAX_ITEMS_PER_SECTION,
    );
  }, [mentorshipProgramSessions, startOfTodayLocal]);

  /** Sessions after today (aligned with mentor dashboard “Upcoming”). */
  const mentorshipProgramUpcomingItems = useMemo((): PastorFocusItem[] => {
    const dayEnd =
      startOfTodayLocal.getTime() + 24 * 60 * 60 * 1000;
    const list = mentorshipProgramSessions
      .filter((session) => {
        const date = new Date(session.scheduledDate);
        if (Number.isNaN(date.getTime())) return false;
        return date.getTime() > dayEnd;
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledDate).getTime() -
          new Date(b.scheduledDate).getTime(),
      );
    return clampByLimit(
      list.map((session) => {
        const pastor = session.pastorName?.trim()
          ? session.pastorName
          : "Pastor";
        return {
          id: `mentorship-program-upcoming-${session.id}`,
          title: sessionTopicLine(session.sessionNumber),
          description: `${sessionOrdinalLabel(session.sessionNumber)} · ${formatSessionDate(session.scheduledDate)} • ${session.status}`,
          meta: pastor,
          accentColor: "#22C55E",
          route: {
            pathname: `/(mentor)/(tabs)/sessions/${session.id}`,
            params: {},
          },
        } as PastorFocusItem;
      }),
      MAX_ITEMS_PER_SECTION,
    );
  }, [mentorshipProgramSessions, startOfTodayLocal]);

  const otherMeetings = useMemo(() => {
    if (!appointments?.length) return [];
    const upcoming = getUpcomingAppointments()
      .filter((apt: Appointment) => apt.meetingDate?.split("T")?.[0] !== todayISO)
      .sort((a, b) => toEpochMs(a.meetingDate) - toEpochMs(b.meetingDate));

    return clampByLimit(
      upcoming.map((apt: Appointment) => {
        const pastorName = menteeNameById.get(apt.userId) ?? "Pastor";
        return {
          id: `mentor-other-meeting-${apt.id}`,
          title: "Upcoming meeting",
          description: `Meeting starts ${formatDateTime(apt.meetingDate)}.`,
          meta: `${pastorName} • ${apt.platform}`,
          accentColor: "#22C55E",
          route: {
            pathname: "/appointments",
            params: {},
          },
        } as PastorFocusItem;
      }),
      MAX_ITEMS_PER_SECTION,
    );
  }, [appointments, getUpcomingAppointments, todayISO, menteeNameById]);

  const { data: focusResult, isLoading: isLoadingFocusResult } = useQuery<MentorFocusResult>({
    queryKey: [
      "mentor-focus",
      mentorId ?? "",
      menteeIdsKey,
      roadmapIdsKey,
    ],
    enabled:
      !!mentorId && !isLoadingMentees && !allRoadmapsQuery.isLoading && !isLoadingAssessments,
    staleTime: 30_000,
    retry: 2,
    placeholderData: (prev) => prev,
    queryFn: async () => {
      // 1) Pastor queries
      const pastorQueryTemp: { item: PastorFocusItem; sortAtMs: number }[] = [];
      const seenQueryIds = new Set<string>();
      const samplePastors: string[] = [];
      const sampleRoadmapIds: string[] = [];
      let scannedPastors = 0;
      let scannedRoadmaps = 0;
      let returnedThreads = 0;
      let returnedQueries = 0;
      let returnedPending = 0;

      // Deterministic + low-concurrency: only query roadmaps actually assigned
      // to the given mentee. High concurrency here can lead to rate-limits and
      // random empty results (errors are intentionally swallowed per request).
      // Do not cap mentees here; instead cap total roadmap calls. Otherwise pending
      // queries belonging to "later" mentees can disappear depending on list order.
      const menteesForScan = [...(mentees as any[])].sort((a, b) =>
        String(a?.id ?? "").localeCompare(String(b?.id ?? "")),
      );
      let totalRoadmapCalls = 0;

      for (const mentee of menteesForScan) {
        const pastorId = String(mentee?.id ?? "");
        if (!pastorId) continue;
        scannedPastors += 1;
        const pastorName = menteeNameById.get(pastorId) ?? "Pastor";
        if (samplePastors.length < 3) samplePastors.push(pastorName);

        const roadmapIds: string[] = clampByLimit(
          (mentee?.assignedRoadmapIds ?? []).map((x: any) => String(x)).filter(Boolean),
          MAX_ROADMAPS_PER_MENTEE_FOR_QUERIES,
        );

        for (const rid of roadmapIds) {
          const phaseRoadmap = (roadmaps as any[]).find((r) => String(r?._id) === rid);
          const nestedTasks = (phaseRoadmap?.roadmaps ?? []).filter(Boolean);
          const phaseLabel = roadmapNameById.get(rid) ?? "Roadmap";
          const threadTargets =
            nestedTasks.length > 0
              ? nestedTasks.map((task: any) => ({
                  threadId: resolveRoadmapThreadId(String(task._id), rid)!,
                  label: `${phaseLabel} • ${String(task.name ?? "Task")}`,
                }))
              : [{ threadId: resolveRoadmapThreadId(undefined, rid)!, label: phaseLabel }];

          for (const { threadId, label: roadmapName } of threadTargets) {
            totalRoadmapCalls += 1;
            if (totalRoadmapCalls > MAX_ROADMAPS_FOR_QUERIES_TOTAL) break;
            scannedRoadmaps += 1;
            if (sampleRoadmapIds.length < 4) sampleRoadmapIds.push(threadId);

            try {
              const threads = await roadmapService.getRoadmapQueries(threadId, pastorId);
              returnedThreads += (threads ?? []).length;
              returnedQueries += (threads ?? []).reduce(
                (acc: number, t: any) => acc + (Array.isArray(t?.queries) ? t.queries.length : 0),
                0,
              );

              const pending = (threads ?? [])
                .flatMap((t: any) => t?.queries ?? [])
                .filter((q: any) => String(q?.status ?? "").toLowerCase() === "pending");
              returnedPending += pending.length;

              for (const q of pending) {
                const qid = String(q?._id ?? q?.id ?? "");
                if (!qid || seenQueryIds.has(qid)) continue;
                seenQueryIds.add(qid);

                const createdAt = q?.createdDate ?? q?.created_at ?? null;
                const createdAtMs = toEpochMs(createdAt);
                const createdAtFormatted = formatDateTime(createdAt);

                pastorQueryTemp.push({
                  item: {
                    id: `pastor-query-${qid}`,
                    title: "Pastor query",
                    description:
                      String(q?.actualQueryText ?? "").slice(0, 140) ||
                      "Query needs response.",
                    meta: `${roadmapName} • ${createdAtFormatted}`,
                    accentColor: "#FB7185",
                    route: {
                      pathname: "/(mentor)/roadmap/queries",
                      params: {
                        roadmapId: threadId,
                        userId: pastorId,
                        menteeName: pastorName,
                      },
                    },
                  },
                  sortAtMs: createdAtMs,
                });
              }
            } catch {
              continue;
            }
          }

          if (totalRoadmapCalls > MAX_ROADMAPS_FOR_QUERIES_TOTAL) break;
        }

        if (totalRoadmapCalls > MAX_ROADMAPS_FOR_QUERIES_TOTAL) break;
      }

      pastorQueryTemp.sort((a, b) => b.sortAtMs - a.sortAtMs);
      const pastorQueries = clampByLimit(
        pastorQueryTemp.map((x) => x.item),
        MAX_ITEMS_PER_SECTION,
      );

      // 2) Survey submissions (pastor -> mentor review)
      const surveySubmissionTemp: { item: PastorFocusItem; sortAtMs: number }[] = [];
      const seenSubmissionKeys = new Set<string>();

      // Candidate assessments per pastor to keep API calls bounded.
      await mapWithConcurrency(mentees as any[], 2, async (mentee: any) => {
        const pastorId = String(mentee.id);
        const pastorName = menteeNameById.get(pastorId) ?? "Pastor";

        const assessmentIds: string[] = (mentee.assignedAssessmentIds ?? []).map((x: any) => String(x));
        const limitedAssessmentIds = clampByLimit(assessmentIds, MAX_ASSESSMENTS_PER_MENTEE_FOR_SURVEY);

        for (const aid of limitedAssessmentIds) {
          try {
            const res = await assessmentService.fetchAnswers(aid, pastorId);
            if (!res?.success || !res?.data) continue;

            const answers = res.data;
            const hasSections = Array.isArray(answers.sections) && answers.sections.length > 0;
            const hasPreSurvey = !!answers.preSurveySubmittedAt;

            if (!hasSections && !hasPreSurvey) continue;

            const submittedAt = answers.preSurveySubmittedAt ?? answers.createdAt;
            const recommendationsSentByMentor = answers.recommendationsSentByMentor;

            // Mentor should focus on ones that are not yet recommended/sent by mentor.
            if (recommendationsSentByMentor === true) continue;

            const key = `${aid}-${pastorId}`;
            if (seenSubmissionKeys.has(key)) continue;
            seenSubmissionKeys.add(key);

            const assessmentTitle = assessmentNameById.get(aid) ?? "Survey submission";

            const preSurveyFlag = answers.preSurveySubmittedAt ? "true" : "false";

            const submittedAtMs = toEpochMs(submittedAt);

            surveySubmissionTemp.push({
              item: {
                id: `survey-${key}`,
                title: assessmentTitle,
                description: "Survey submitted and awaiting your recommendation.",
                meta: `${pastorName} • ${formatDateTime(submittedAt)}`,
                accentColor: "#A78BFA",
                route: {
                  pathname: "/(mentor)/assessments/answer-questions",
                  params: {
                    assessmentId: aid,
                    viewMode: "true",
                    targetUserId: pastorId,
                    hasPreSurvey: preSurveyFlag,
                    scheduleMeeting: "false",
                  },
                },
              },
              sortAtMs: submittedAtMs,
            });
          } catch {
            continue;
          }
        }
      });

      // Time order: oldest first (more urgent items first).
      surveySubmissionTemp.sort((a, b) => a.sortAtMs - b.sortAtMs);
      const surveySubmissions = clampByLimit(
        surveySubmissionTemp.map((x) => x.item),
        MAX_ITEMS_PER_SECTION,
      );

      return {
        pastorQueries,
        surveySubmissions,
        debug: {
          scannedPastors,
          scannedRoadmaps,
          returnedThreads,
          returnedQueries,
          returnedPending,
          samplePastors,
          sampleRoadmapIds,
        },
      };
    },
  });

  const sections: PastorFocusSection[] = useMemo(() => {
    const pastorQueries = focusResult?.pastorQueries ?? [];
    const surveySubmissions = focusResult?.surveySubmissions ?? [];
    const debug = focusResult?.debug;

    const pastorQueriesEmptyMessage =
      pastorQueriesScanStats.menteeCount === 0
        ? "No assigned pastors yet."
        : pastorQueriesScanStats.totalAssignedRoadmaps === 0
          ? "No pastor roadmaps found to scan for queries."
          : `No pending pastor queries right now. (Scanned ${pastorQueriesScanStats.totalAssignedRoadmaps} roadmap assignments across ${pastorQueriesScanStats.menteeCount} pastors.)` +
            (debug
              ? ` API: pastors=${debug.scannedPastors}, roadmaps=${debug.scannedRoadmaps}, threads=${debug.returnedThreads}, queries=${debug.returnedQueries}, pending=${debug.returnedPending}.`
              : "");

    return [
      {
        id: "mentorship-sessions-today",
        title: "Today",
        emptyMessage: "No mentorship sessions scheduled for today.",
        items: mentorshipProgramTodayItems,
      },
      {
        id: "mentorship-program-upcoming",
        title: "Upcoming",
        emptyMessage: "No upcoming mentorship sessions.",
        items: mentorshipProgramUpcomingItems,
      },
      {
        id: "other-meetings",
        title: "Other Meetings",
        emptyMessage: "No other meetings coming up.",
        items: otherMeetings,
      },
      {
        id: "pastor-queries",
        title: "Pastor Queries",
        emptyMessage: pastorQueriesEmptyMessage,
        items: pastorQueries,
      },
      {
        id: "survey-submissions",
        title: "Survey Submissions (in time order)",
        emptyMessage: "No survey submissions pending review.",
        items: surveySubmissions,
      },
    ];
  }, [
    focusResult?.pastorQueries,
    focusResult?.surveySubmissions,
    mentorshipProgramTodayItems,
    mentorshipProgramUpcomingItems,
    otherMeetings,
    pastorQueriesScanStats,
  ]);

  const isLoading =
    isLoadingAppointments ||
    isLoadingMentees ||
    allRoadmapsQuery.isLoading ||
    isLoadingAssessments ||
    isLoadingFocusResult ||
    isLoadingMentorshipSessions ||
    false;

  return { sections, isLoading };
};

