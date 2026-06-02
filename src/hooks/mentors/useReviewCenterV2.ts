import { useMentees } from "@/hooks/mentees/useMentees";
import { useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { useAssessments } from "@/hooks/assessments/useAssessments";
import {
  type ReviewBadgeCounts,
  type ReviewCategoryCounts,
  type ReviewDashboardCounts,
  type ReviewFilterTab,
  type ReviewItem,
  REVIEW_PRIORITY,
  buildPastorGroups,
  computeDashboardCounts,
  computePendingActionCount,
  getReviewCategory,
  mapSubmissionStatusToReview,
  type ReviewPastorGroup,
} from "@/lib/mentor/reviewCenter.types";
import { assessmentService } from "@/services/assessment.service";
import { roadmapService } from "@/services/roadmap.service";
import { useAuthStore } from "@/stores";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mapWithConcurrency } from "@/utils/apiConcurrency";
import type { TaskSubmission } from "@/lib/roadmap/types";
import React, { useCallback, useMemo, useState } from "react";

const SEEN_STORAGE_KEY = "mentor_review_center_seen";
const MAX_MENTEES = 20;
const MAX_ROADMAPS_PER_MENTEE = 6;
const LEGACY_EXTRAS_CONCURRENCY = 2;
const LEGACY_EXTRAS_MAX_RETRIES = 2;
const LEGACY_EXTRAS_RETRY_BASE_MS = 450;

const isMongoObjectIdLike = (id: string | undefined | null): id is string => {
  return (
    !!id &&
    typeof id === "string" &&
    id.trim().length === 24 &&
    /^[0-9a-fA-F]{24}$/.test(id.trim())
  );
};

function buildLatestLegacyRoadmapSubmission(
  extras: any,
): { status: "SUBMITTED" | "RESUBMITTED"; category: "pending_review" | "resubmitted"; resubmissionCount: number; submittedAt: string } | null {
  const allExtras: any[] = (extras?.extras ?? []).filter(
    (e: any) => e?.name && e?.type !== "JUMPSTART_COMPLETE",
  );

  if (allExtras.length === 0) return null;

  // Group by field name and look for duplicate versions.
  const byName = new Map<string, any[]>();
  for (const e of allExtras) {
    const key = String(e.name);
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key)!.push(e);
  }

  const maxVersions = Math.max(
    ...Array.from(byName.values()).map((arr) => arr.length),
  );

  if (!Number.isFinite(maxVersions) || maxVersions <= 0) return null;

  const status = maxVersions > 1 ? "RESUBMITTED" : "SUBMITTED";
  const category = maxVersions > 1 ? "resubmitted" : "pending_review";
  const resubmissionCount = Math.max(0, maxVersions - 1);

  // Latest version is the one at maxVersions - 1, so submittedAt ~ updatedAt.
  const submittedAtDate = new Date(String(extras.updatedAt ?? extras.createdAt ?? ""));
  const submittedAt = Number.isNaN(submittedAtDate.getTime())
    ? new Date(String(extras.createdAt ?? "")).toISOString()
    : submittedAtDate.toISOString();

  return { status, category, resubmissionCount, submittedAt };
}

async function loadSeenIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
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

function uniqueNonEmpty(values: Array<string | undefined | null>): string[] {
  return [...new Set(values.map((v) => String(v ?? "").trim()).filter(Boolean))];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTooManyRequestsError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { statusCode?: number; message?: string };
  if (maybeError.statusCode === 429) return true;
  const message = String(maybeError.message ?? "");
  return message.includes("429") || message.includes("Too Many Requests");
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { statusCode?: number; message?: string };
  if (maybeError.statusCode === 404) return true;
  const message = String(maybeError.message ?? "");
  return message.includes("404") || message.includes("Cannot GET");
}

async function getRoadmapExtrasWithRetry(
  roadmapId: string,
  nestedRoadMapItemId: string,
  userId: string,
): Promise<any> {
  let attempt = 0;
  while (true) {
    try {
      return await roadmapService.getRoadmapExtras(
        roadmapId,
        nestedRoadMapItemId,
        userId,
      );
    } catch (error) {
      if (!isTooManyRequestsError(error) || attempt >= LEGACY_EXTRAS_MAX_RETRIES) {
        throw error;
      }
      const backoffMs =
        LEGACY_EXTRAS_RETRY_BASE_MS * Math.pow(2, attempt) +
        Math.floor(Math.random() * 150);
      attempt += 1;
      await sleep(backoffMs);
    }
  }
}

export function useReviewCenterV2() {
  const { user } = useAuthStore();
  const mentorId = user?.id;
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<ReviewFilterTab>("all");

  const { data: menteesData, isLoading: isLoadingMentees } = useMentees(
    MAX_MENTEES,
    mentorId,
  );
  const { data: allRoadmaps, isLoading: isLoadingRoadmaps } = useAllRoadmaps();
  const {
    data: assessments,
    isLoading: isLoadingAssessments,
  } = useAssessments();

  const mentees = useMemo(() => {
    const pages = (menteesData?.pages ?? []) as any[];
    return pages.flatMap((p) => p?.mentees ?? []);
  }, [menteesData]);

  const menteeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of mentees as any[]) {
      const ids = uniqueNonEmpty([m?.id, m?._id]);
      if (ids.length === 0) continue;
      const name = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim();
      for (const id of ids) {
        map.set(String(id), name || "Pastor");
      }
    }
    return map;
  }, [mentees]);

  const roadmapNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of (allRoadmaps ?? []) as any[]) {
      const id = r?._id;
      if (!id) continue;
      map.set(String(id), String(r?.name ?? "Roadmap"));
    }
    return map;
  }, [allRoadmaps]);

  const roadmapTasksById = useMemo(() => {
    const map = new Map<string, { id: string; name: string }[]>();
    for (const r of (allRoadmaps ?? []) as any[]) {
      const rid = r?._id;
      if (!rid) continue;
      const tasks = (r.roadmaps ?? [])
        .filter((t: any) => t?._id)
        .map((t: any) => ({
          id: String(t._id),
          name: String(t?.name ?? t?.title ?? "Task"),
        }));
      map.set(String(rid), tasks);
    }
    return map;
  }, [allRoadmaps]);

  const assessmentNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of (assessments ?? []) as any[]) {
      const id = a?._id;
      if (!id) continue;
      map.set(String(id), String(a?.name ?? a?.title ?? "Assessment"));
    }
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
    enabled:
      !!mentorId &&
      !isLoadingMentees &&
      !isLoadingRoadmaps &&
      !isLoadingAssessments,
    staleTime: 60_000,
    retry: 2,
    queryFn: async (): Promise<ReviewItem[]> => {
      const seenIds = await loadSeenIds();
      const items: ReviewItem[] = [];
      const extrasRequestCache = new Map<string, Promise<any>>();
      const blockedExtrasByRoadmapUser = new Set<string>();

      const getCachedExtras = (
        roadmapId: string,
        nestedRoadMapItemId: string,
        userId: string,
      ): Promise<any> => {
        const key = `${roadmapId}:${nestedRoadMapItemId}:${userId}`;
        const existing = extrasRequestCache.get(key);
        if (existing) return existing;
        const req = getRoadmapExtrasWithRetry(roadmapId, nestedRoadMapItemId, userId);
        extrasRequestCache.set(key, req);
        return req;
      };

      await mapWithConcurrency(mentees as any[], 2, async (mentee: any) => {
        // Router/UI should keep the app's canonical id, but APIs can be inconsistent.
        const pastorId = String(mentee?.id ?? mentee?._id ?? "");
        if (!pastorId) return;
        const pastorName = menteeNameById.get(pastorId) ?? "Pastor";
        const pastorIdCandidates = uniqueNonEmpty([
          mentee?.id,
          mentee?._id,
          pastorId,
        ]);

        // --- Roadmap submissions ---
        const roadmapIds: string[] = (mentee.assignedRoadmapIds ?? [])
          .map((x: any) => String(x))
          .filter(Boolean)
          .slice(0, MAX_ROADMAPS_PER_MENTEE);

        for (const rid of roadmapIds) {
          try {
            const roadmapName = roadmapNameById.get(rid) ?? "Roadmap";
            const tasks = roadmapTasksById.get(rid) ?? [];
            let submissions: TaskSubmission[] = [];

            // Prefer roadmap-level listing. If backend doesn't support it (or errors),
            // fall back to per-task nestedRoadMapItemId fetches.
            for (const candidateUserId of pastorIdCandidates) {
              try {
                const allSubs = await roadmapService.getAllSubmissionsForUser(
                  rid,
                  candidateUserId,
                );
                if (allSubs.length > 0) {
                  submissions = allSubs;
                  break;
                }
              } catch {
                // try next candidate
              }
            }

            if (submissions.length === 0) {
              for (const candidateUserId of pastorIdCandidates) {
                let taskSubmissionsEndpointMissing = false;
                await mapWithConcurrency(tasks, LEGACY_EXTRAS_CONCURRENCY, async (task) => {
                  if (taskSubmissionsEndpointMissing) return;
                  try {
                    const subs = await roadmapService.getTaskSubmissions(
                      rid,
                      task.id,
                      candidateUserId,
                    );
                    submissions.push(...subs);
                  } catch (error) {
                    if (isNotFoundError(error)) {
                      // Endpoint not supported for this roadmap/user.
                      // Stop making further per-task submissions calls in this cycle.
                      taskSubmissionsEndpointMissing = true;
                    }
                  }
                });
                if (submissions.length > 0) break;
              }
            }

            if (submissions.length > 0) {
              const latestByTask = new Map<string, TaskSubmission>();
              for (const sub of submissions) {
                const taskId = String(sub.nestedRoadMapItemId ?? "unknown");
                const existing = latestByTask.get(taskId);
                if (
                  !existing ||
                  sub.submissionNumber > existing.submissionNumber
                ) {
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
                  title: taskMeta?.name ?? "Task",
                  status: reviewStatus,
                  category,
                  submittedAt: sub.submittedAt ?? sub.createdAt,
                  resubmissionCount: Math.max(0, sub.submissionNumber - 1),
                  isSeen: seenIds.has(itemId),
                  roadmapId: rid,
                  roadmapName,
                  nestedRoadMapItemId: taskId,
                  taskName: taskMeta?.name,
                });
              }
            } else {
              // Submissions APIs returned none for this roadmap+pastor.
              // Fallback to legacy extras so we still show "submitted/resubmitted".
              const legacyUserIdCandidates = pastorIdCandidates.filter((u) =>
                isMongoObjectIdLike(u),
              );
              const legacyUserIdForItems =
                legacyUserIdCandidates[0] ?? pastorId;
              const canUseLegacy = isMongoObjectIdLike(legacyUserIdForItems);

              await mapWithConcurrency(tasks, LEGACY_EXTRAS_CONCURRENCY, async (task) => {
                const itemId = `roadmap-${rid}-${task.id}-${legacyUserIdForItems}`;
                const roadmapUserKey = `${rid}:${legacyUserIdForItems}`;

                if (!canUseLegacy) {
                  items.push({
                    id: itemId,
                    type: "roadmap",
                    pastorId: legacyUserIdForItems,
                    pastorName,
                    title: task.name,
                    status: "NOT_STARTED",
                    category: "not_started",
                    submittedAt: null,
                    resubmissionCount: 0,
                    isSeen: seenIds.has(itemId),
                    roadmapId: rid,
                    roadmapName,
                    nestedRoadMapItemId: task.id,
                    taskName: task.name,
                  });
                  return;
                }

                if (blockedExtrasByRoadmapUser.has(roadmapUserKey)) {
                  items.push({
                    id: itemId,
                    type: "roadmap",
                    pastorId: legacyUserIdForItems,
                    pastorName,
                    title: task.name,
                    status: "NOT_STARTED",
                    category: "not_started",
                    submittedAt: null,
                    resubmissionCount: 0,
                    isSeen: seenIds.has(itemId),
                    roadmapId: rid,
                    roadmapName,
                    nestedRoadMapItemId: task.id,
                    taskName: task.name,
                  });
                  return;
                }

                try {
                  const extrasResp = await getCachedExtras(
                    rid,
                    task.id,
                    legacyUserIdForItems,
                  );

                  const synthetic = buildLatestLegacyRoadmapSubmission(extrasResp);
                  if (!synthetic) {
                    items.push({
                      id: itemId,
                      type: "roadmap",
                      pastorId: legacyUserIdForItems,
                      pastorName,
                      title: task.name,
                      status: "NOT_STARTED",
                      category: "not_started",
                      submittedAt: null,
                      resubmissionCount: 0,
                      isSeen: seenIds.has(itemId),
                      roadmapId: rid,
                      roadmapName,
                      nestedRoadMapItemId: task.id,
                      taskName: task.name,
                    });
                    return;
                  }

                  items.push({
                    id: itemId,
                    type: "roadmap",
                    pastorId: legacyUserIdForItems,
                    pastorName,
                    title: task.name,
                    status: synthetic.status,
                    category: synthetic.category,
                    submittedAt: synthetic.submittedAt,
                    resubmissionCount: synthetic.resubmissionCount,
                    isSeen: seenIds.has(itemId),
                    roadmapId: rid,
                    roadmapName,
                    nestedRoadMapItemId: task.id,
                    taskName: task.name,
                  });
                } catch (error) {
                  // If the backend rate-limits this roadmap+user, skip further extras
                  // calls for this pair in the current query cycle.
                  if (isTooManyRequestsError(error)) {
                    blockedExtrasByRoadmapUser.add(roadmapUserKey);
                  }
                  items.push({
                    id: itemId,
                    type: "roadmap",
                    pastorId: legacyUserIdForItems,
                    pastorName,
                    title: task.name,
                    status: "NOT_STARTED",
                    category: "not_started",
                    submittedAt: null,
                    resubmissionCount: 0,
                    isSeen: seenIds.has(itemId),
                    roadmapId: rid,
                    roadmapName,
                    nestedRoadMapItemId: task.id,
                    taskName: task.name,
                  });
                }
              });
            }
          } catch {
            // Skip this roadmap for the current pastor.
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
            const hasSections =
              Array.isArray(answers.sections) && answers.sections.length > 0;
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

            const submittedAt =
              answers.preSurveySubmittedAt ?? answers.createdAt;
            const isReviewed =
              answers.recommendationsSentByMentor === true;
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

  const dashboardCounts = useMemo<ReviewDashboardCounts>(() => {
    return computeDashboardCounts(allItems);
  }, [allItems]);

  const pendingActionCount = useMemo(() => {
    return computePendingActionCount(dashboardCounts);
  }, [dashboardCounts]);

  const menteeAvatarById = useMemo(() => {
    const map = new Map<string, { profilePicture?: string | null; profileImage?: string | null }>();
    for (const m of mentees as any[]) {
      const ids = uniqueNonEmpty([m?.id, m?._id]);
      if (ids.length === 0) continue;
      const avatar = {
        profilePicture: m?.profilePicture ?? null,
        profileImage: m?.profileImage ?? null,
      };
      for (const id of ids) map.set(String(id), avatar);
    }
    return map;
  }, [mentees]);

  const pastorGroups = useMemo((): ReviewPastorGroup[] => {
    return buildPastorGroups(allItems).map((group) => {
      const avatar = menteeAvatarById.get(group.pastorId);
      return avatar ? { ...group, ...avatar } : group;
    });
  }, [allItems, menteeAvatarById]);
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
    pastorGroups,
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

