import { useAssessments } from "@/hooks/assessments/useAssessments";
import { useMentees } from "@/hooks/mentees/useMentees";
import { useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import {
    type ReviewBadgeCounts,
    type ReviewCategoryCounts,
    type ReviewDashboardCounts,
    type ReviewFilterTab,
    type ReviewItem,
    REVIEW_PRIORITY,
    computeDashboardCounts,
    computePendingActionCount,
    getReviewCategory,
    mapSubmissionStatusToReview,
} from "@/lib/mentor/reviewCenter.types";
import type { TaskSubmission } from "@/lib/roadmap/types";
import { assessmentService } from "@/services/assessment.service";
import { roadmapService } from "@/services/roadmap.service";
import { useAuthStore } from "@/stores";
import { mapWithConcurrency } from "@/utils/apiConcurrency";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

const SEEN_STORAGE_KEY = "mentor_review_center_seen";
const MAX_MENTEES = 20;
const MAX_ROADMAPS_PER_MENTEE = 6;

async function loadSeenIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

async function persistSeenIds(ids: Set<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // silent
  }
}

export function useReviewCenter() {
  const { user } = useAuthStore();
  const mentorId = user?.id;
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<ReviewFilterTab>("all");

  const {
    data: menteesData,
    isLoading: isLoadingMentees,
  } = useMentees(MAX_MENTEES, mentorId);

  const { data: allRoadmaps, isLoading: isLoadingRoadmaps } = useAllRoadmaps();
  const { data: assessments, isLoading: isLoadingAssessments } = useAssessments();

  const mentees = useMemo(() => {
    const pages = menteesData?.pages ?? [];
    return pages.flatMap((p) => p.mentees ?? []);
  }, [menteesData]);

  const menteeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of mentees as any[]) {
      if (!m?.id) continue;
      const name = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim();
      map.set(String(m.id), name || "Pastor");
    }
    return map;
  }, [mentees]);

  const roadmapNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of (allRoadmaps ?? []) as any[]) {
      if (!r?._id) continue;
      map.set(String(r._id), String(r.name ?? "Roadmap"));
    }
    return map;
  }, [allRoadmaps]);

  const roadmapTasksById = useMemo(() => {
    const map = new Map<string, { id: string; name: string }[]>();
    for (const r of (allRoadmaps ?? []) as any[]) {
      if (!r?._id) continue;
      const tasks = (r.roadmaps ?? [])
        .filter((t: any) => t?._id)
        .map((t: any) => ({ id: String(t._id), name: String(t.name ?? t.title ?? "Task") }));
      map.set(String(r._id), tasks);
    }
    return map;
  }, [allRoadmaps]);

  const assessmentNameById = useMemo(() => {
    const map = new Map<string, string>();
    (assessments ?? []).forEach((a: any) => {
      if (!a?._id) return;
      map.set(String(a._id), String(a.name ?? a.title ?? "Assessment"));
    });
    return map;
  }, [assessments]);

  const menteeIdsKey = useMemo(() => {
    return (mentees as any[])
      .map((m) => String(m?.id ?? ""))
      .filter(Boolean)
      .sort()
      .join(",");
  }, [mentees]);

  const { data: reviewData, isLoading: isLoadingReview } = useQuery({
    queryKey: ["mentor-review-center", mentorId ?? "", menteeIdsKey],
    enabled: !!mentorId && !isLoadingMentees && !isLoadingRoadmaps && !isLoadingAssessments,
    staleTime: 60_000,
    retry: 2,
    queryFn: async (): Promise<ReviewItem[]> => {
      const seenIds = await loadSeenIds();
      const items: ReviewItem[] = [];

      await mapWithConcurrency(mentees as any[], 2, async (mentee: any) => {
        const pastorId = String(mentee?.id ?? "");
        if (!pastorId) return;
        const pastorName = menteeNameById.get(pastorId) ?? "Pastor";

        // --- Roadmap submissions ---
        const roadmapIds: string[] = (mentee.assignedRoadmapIds ?? [])
          .map((x: any) => String(x))
          .filter(Boolean)
          .slice(0, MAX_ROADMAPS_PER_MENTEE);

        for (const rid of roadmapIds) {
          try {
            const roadmapName = roadmapNameById.get(rid) ?? "Roadmap";
            const tasks = roadmapTasksById.get(rid) ?? [];
            const submissions: TaskSubmission[] = [];
            await mapWithConcurrency(tasks, 4, async (task) => {
              try {
                const subs = await roadmapService.getTaskSubmissions(
                  rid,
                  task.id,
                  pastorId,
                );
                submissions.push(...subs);
              } catch {
                // skip task
              }
            });

            if (submissions.length > 0) {
              const latestByTask = new Map<string, typeof submissions[0]>();
              for (const sub of submissions) {
                const taskId = sub.nestedRoadMapItemId ?? "unknown";
                const existing = latestByTask.get(taskId);
                if (!existing || sub.submissionNumber > existing.submissionNumber) {
                  latestByTask.set(taskId, sub);
                }
              }

              for (const [taskId, sub] of latestByTask) {
                const taskMeta = tasks.find((t) => t.id === taskId);
                const reviewStatus = mapSubmissionStatusToReview(sub.status);
                const category = getReviewCategory(reviewStatus);
                const itemId = `roadmap-${rid}-${taskId}-${pastorId}`;

                items.push({
                  id: itemId,
                  type: "roadmap",
                  pastorId,
                  pastorName,
                  title: taskMeta?.name ?? roadmapName,
                  status: reviewStatus,
                  category,
                  submittedAt: sub.submittedAt ?? sub.createdAt,
                  resubmissionCount: Math.max(0, sub.submissionNumber - 1),
                  isSeen: seenIds.has(itemId),
                  roadmapId: rid,
                  nestedRoadMapItemId: taskId,
                  taskName: taskMeta?.name,
                });
              }
            } else {
              // No submissions — check if roadmap has tasks (NOT_STARTED)
              for (const task of tasks) {
                const itemId = `roadmap-${rid}-${task.id}-${pastorId}`;
                items.push({
                  id: itemId,
                  type: "roadmap",
                  pastorId,
                  pastorName,
                  title: task.name,
                  status: "NOT_STARTED",
                  category: "not_started",
                  submittedAt: null,
                  resubmissionCount: 0,
                  isSeen: seenIds.has(itemId),
                  roadmapId: rid,
                  nestedRoadMapItemId: task.id,
                  taskName: task.name,
                });
              }
            }
          } catch {
            continue;
          }
        }

        // --- Assessment submissions ---
        const assessmentIds: string[] = (mentee.assignedAssessmentIds ?? [])
          .map((x: any) => String(x))
          .filter(Boolean)
          .slice(0, 5);

        for (const aid of assessmentIds) {
          const itemId = `assessment-${aid}-${pastorId}`;
          try {
            const res = await assessmentService.fetchAnswers(aid, pastorId);
            if (!res?.success || !res?.data) {
              items.push({
                id: itemId,
                type: "assessment",
                pastorId,
                pastorName,
                title: assessmentNameById.get(aid) ?? "Assessment",
                status: "NOT_STARTED",
                category: "not_started",
                submittedAt: null,
                resubmissionCount: 0,
                isSeen: seenIds.has(itemId),
                assessmentId: aid,
              });
              continue;
            }

            const answers = res.data;
            const hasSections = Array.isArray(answers.sections) && answers.sections.length > 0;
            const hasPreSurvey = !!answers.preSurveySubmittedAt;

            if (!hasSections && !hasPreSurvey) {
              items.push({
                id: itemId,
                type: "assessment",
                pastorId,
                pastorName,
                title: assessmentNameById.get(aid) ?? "Assessment",
                status: "NOT_STARTED",
                category: "not_started",
                submittedAt: null,
                resubmissionCount: 0,
                isSeen: seenIds.has(itemId),
                assessmentId: aid,
              });
              continue;
            }

            const submittedAt = answers.preSurveySubmittedAt ?? answers.createdAt;
            const isReviewed = answers.recommendationsSentByMentor === true;
            const reviewStatus = isReviewed ? "REVIEWED" : "SUBMITTED";
            const category = getReviewCategory(reviewStatus);

            items.push({
              id: itemId,
              type: "assessment",
              pastorId,
              pastorName,
              title: assessmentNameById.get(aid) ?? "Assessment",
              status: reviewStatus,
              category,
              submittedAt,
              resubmissionCount: 0,
              isSeen: seenIds.has(itemId),
              assessmentId: aid,
            });
          } catch {
            items.push({
              id: itemId,
              type: "assessment",
              pastorId,
              pastorName,
              title: assessmentNameById.get(aid) ?? "Assessment",
              status: "NOT_STARTED",
              category: "not_started",
              submittedAt: null,
              resubmissionCount: 0,
              isSeen: seenIds.has(itemId),
              assessmentId: aid,
            });
          }
        }
      });

      return items;
    },
  });

  const allItems = reviewData ?? [];

  const filteredItems = useMemo(() => {
    let items = allItems;
    if (activeFilter === "roadmaps") items = items.filter((i) => i.type === "roadmap");
    if (activeFilter === "assessments") items = items.filter((i) => i.type === "assessment");

    return items.sort((a, b) => {
      const priorityDiff = REVIEW_PRIORITY[a.category] - REVIEW_PRIORITY[b.category];
      if (priorityDiff !== 0) return priorityDiff;
      const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [allItems, activeFilter]);

  const categoryCounts = useMemo((): ReviewCategoryCounts => {
    const counts: ReviewCategoryCounts = {
      pending_review: 0,
      reviewed: 0,
      resubmitted: 0,
      not_started: 0,
    };
    for (const item of allItems) {
      counts[item.category]++;
    }
    return counts;
  }, [allItems]);

  const badgeCounts = useMemo((): ReviewBadgeCounts => {
    const counts: ReviewBadgeCounts = { roadmaps: 0, assessments: 0 };
    for (const item of allItems) {
      if (!item.isSeen && item.status !== "NOT_STARTED") {
        if (item.type === "roadmap") counts.roadmaps++;
        else counts.assessments++;
      }
    }
    return counts;
  }, [allItems]);

  const totalUnseen = badgeCounts.roadmaps + badgeCounts.assessments;

  const dashboardCounts = useMemo(
    (): ReviewDashboardCounts => computeDashboardCounts(allItems),
    [allItems],
  );

  const pendingActionCount = useMemo(
    () => computePendingActionCount(dashboardCounts),
    [dashboardCounts],
  );

  const markAsSeen = useCallback(
    async (itemId: string) => {
      const seenIds = await loadSeenIds();
      if (seenIds.has(itemId)) return;
      seenIds.add(itemId);
      await persistSeenIds(seenIds);
      queryClient.invalidateQueries({ queryKey: ["mentor-review-center"] });
    },
    [queryClient],
  );

  const isLoading =
    isLoadingMentees || isLoadingRoadmaps || isLoadingAssessments || isLoadingReview;

  return {
    items: filteredItems,
    allItems,
    categoryCounts,
    dashboardCounts,
    pendingActionCount,
    badgeCounts,
    totalUnseen,
    activeFilter,
    setActiveFilter,
    markAsSeen,
    isLoading,
  };
}
