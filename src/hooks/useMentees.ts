import apiClient from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { menteesService } from "@/services/mentee.service";
import { Mentee, Mentor } from "@/types/user.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMentees = () => {
    return useQuery({
        queryKey: ['mentees'],
        queryFn: async () => {
            // fetch backend
            const res = await menteesService.getMentees();

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
                const firstRoadmap = progress?.roadmaps?.items?.[0] ?? null;

                return {
                    ...m,
                    description: "",
                    progress: progress?.overallRoadmapProgress ?? 0,
                    phase: firstRoadmap?.phase,
                    phaseNumber: firstRoadmap?.phaseNumber,
                    completedOn: m.hasCompleted ? m.updatedAt : undefined,
                };
            });

            return {
                mentees,
                total: res.data.total ?? mentees.length
            };
        },
        staleTime: 1000 * 60 * 5,
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
        staleTime: 1000 * 60 * 5,
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
        mutationFn: async ({ menteeIds, assessmentIds }: { menteeIds: string[]; assessmentIds: string[] }) => {
            await menteesService.assignAssessmentsToMentee(menteeIds, assessmentIds);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mentees'] });
            queryClient.invalidateQueries({ queryKey: ['progress'] });
        },
    });
}

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