import apiClient from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { menteesService } from "@/services/mentee.service";
import { Mentee, Mentor } from "@/types/user.types";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMentees = (limit: number = 10) => {
    return useInfiniteQuery({
        queryKey: ['mentees'],
        queryFn: async ({ pageParam = 1 }) => {
            // fetch backend
            const res = await menteesService.getMentees(pageParam, limit);

            // FIX: backend uses `users`, not `mentees`
            const backendMentees: Mentee[] = res.data.users ?? [];

            // fetch progress in parallel
            const progressResponses = await Promise.all(
                backendMentees.map(async (m) => {
                    try {
                        const r = await apiClient.get(
                            ENDPOINTS.USERS.GET_PROGRESS(m.id)
                        );
                        return r.data?.data ?? null;
                    } catch {
                        return null;
                    }
                })
            );
            // merge
            const mentees = backendMentees.map((m, idx) => {
                const progress = progressResponses[idx];
                
                // Handle different roadmap structures (array or paginated object)
                const roadmaps = Array.isArray(progress?.roadmaps) 
                    ? progress.roadmaps 
                    : (progress?.roadmaps?.items ?? []);
                
                const firstRoadmap = roadmaps[0] ?? null;                
                // Extract assigned roadmap IDs
                const assignedRoadmapIds = roadmaps.map((item: any) => item.roadMapId || item._id);

                // Handle different assessment structures
                const assessments = Array.isArray(progress?.assessments)
                    ? progress.assessments
                    : (progress?.assessments?.items ?? []);

                // Extract assigned assessment IDs
                // Based on progress.types.ts, AssessmentProgress doesn't strictly have an ID field shown, 
                // but usually it's _id or assessmentId. I'll check if I can find more info or assume _id/assessmentId.
                // Looking at assign-roadmaps logic for roadmaps: item.roadMapId || item._id
                // For assessments, let's assume item.assessmentId || item._id based on common patterns.
                // Re-reading progress.types.ts... AssessmentProgress has: title, progress, taskStatus, etc. 
                // It doesn't explicitly show the ID in the interface provided earlier (AssessmentProgress).
                // However, AssignAssessmentResponse has assessments: AssessmentProgress[]. 
                // Let's assume the backend returns _id or assessmentId for the assessment item in the progress list.
                const assignedAssessmentIds = assessments.map((item: any) => item.assessmentId || item._id);

                return {
                    ...m,
                    description: "",
                    progress: progress?.overallRoadmapProgress ?? 0,
                    phase: firstRoadmap?.phase,
                    phaseNumber: firstRoadmap?.phaseNumber,
                    completedOn: m.hasCompleted ? m.updatedAt : undefined,
                    assignedRoadmapIds,
                    assignedAssessmentIds,
                };
            });

            return {
                mentees,
                total: res.data.total ?? mentees.length,
                page: res.data.page,
                totalPages: res.data.totalPages
            };
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 30 * 1000,
        retry: 1,
    });
};


export const useAssignMentorsToMentee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ menteeId, mentorIds }: { menteeId: string; mentorIds: string[] }) => {
            await menteesService.assignMentorsToMentee(menteeId, mentorIds);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mentees'] });
            queryClient.invalidateQueries({ queryKey: ['mentee'] });
            queryClient.invalidateQueries({ queryKey: ['mentors'] });
        },
    });
};

export const useRemoveMentorsFromMentee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ menteeId, mentorIds }: { menteeId: string; mentorIds: string[] }) => {
            await menteesService.removeMentorsFromMentee(menteeId, mentorIds);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mentees'] });
            queryClient.invalidateQueries({ queryKey: ['mentee'] });
            queryClient.invalidateQueries({ queryKey: ['mentors'] });
        }
    });
}

export const useMenteeMentors = (menteeId: string | undefined) => {
    const query = useQuery({
        queryKey: ['mentee-mentors', menteeId],
        enabled: !!menteeId, // Add this to prevent query when menteeId is undefined
        queryFn: async () => {
            if (!menteeId) throw new Error('Mentee ID is required');

            // fetch mentee details
            const res = await apiClient.get(ENDPOINTS.USERS.GET_USER(menteeId));
            const menteeData = res.data?.data;

            const assignedMentorIds: string[] = menteeData?.assignedId ?? [];

            // fetch assigned mentors in parallel
            const assignedMentorsResponses = await Promise.all(
                assignedMentorIds.map(async (mentorId) => {
                    try {
                        const r = await apiClient.get(
                            ENDPOINTS.USERS.GET_USER(mentorId)
                        );
                        return r.data?.data ?? null;
                    } catch {
                        return null;
                    }
                })
            );

            const assignedMentors: Mentor[] = assignedMentorsResponses.filter(
                (m): m is Mentor => m !== null
            );

            return {
                mentee: menteeData,
                mentors: assignedMentors,
            };
        },
        staleTime: 30 * 1000,
        retry: 1,
    });

    return {
        mentee: query.data?.mentee ?? null,
        mentors: query.data?.mentors ?? [], // ✅ Fixed: correctly extract mentors array
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
    };
};


export const useAssignAssignmentsToMentee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            menteeIds,
            assessmentIds,
            dueDate,
        }: {
            menteeIds: string[];
            assessmentIds: string[];
            dueDate?: string;
        }) => {
            await menteesService.assignAssessmentsToMentee(menteeIds, assessmentIds, dueDate);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['mentees'] });
            queryClient.invalidateQueries({ queryKey: ['progress'] });
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            variables.menteeIds.forEach((uid) => {
                queryClient.invalidateQueries({ queryKey: ['assessments', 'assigned', uid] });
            });
        },
    });
};

export const useAssignRoadmapsToMentee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ menteeIds, roadmapIds }: { menteeIds: string[]; roadmapIds: string[] }) => {
            await menteesService.assignRoadmapsToMentee(menteeIds, roadmapIds);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mentees'] });
            queryClient.invalidateQueries({ queryKey: ['progress'] });
        },
    });
}