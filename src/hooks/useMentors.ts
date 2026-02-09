import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mentee, Mentor } from "@/types/user.types";
import { mentorsService } from "@/services/mentors.service";
import { menteesService } from "@/services/mentee.service";
import apiClient from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AssignPayload, MentorMenteesResult } from "@/types/mentor.types";

export const useMentors = (limit: number = 10) => {
    return useInfiniteQuery({
        queryKey: ["mentors"],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await mentorsService.getMentors(pageParam, limit);
            return {
                mentors: res.data.users as Mentor[],
                page: res.data.page,
                totalPages: res.data.totalPages,
                total: res.data.total
            };
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
};


/**
 * Fetch a single mentor by id and then all mentees whose ids are in mentor.assignedId.
 * Reuses the same progress merge logic as useMentees.
 */
export const useMentorMentees = (mentorId?: string | string[]): MentorMenteesResult => {
    const id = Array.isArray(mentorId) ? mentorId[0] : mentorId;

    const query = useQuery({
        queryKey: ["mentor-mentees", id],
        enabled: !!id,
        queryFn: async () => {
            // 1) get all mentors and find current mentor
            const mentorsRes = await mentorsService.getMentors();
            const mentors = mentorsRes.data.users as Mentor[];
            const mentor = mentors.find(m => m.id === id) ?? null;

            if (!mentor || !mentor.assignedId || mentor.assignedId.length === 0) {
                return { mentor, mentees: [] as Mentee[] };
            }

            // 2) fetch mentee users for all assigned ids
            // if you have a dedicated bulk endpoint use that; otherwise fetch all and filter
            const menteesRes = await menteesService.getMentees();
            const backendMentees: Mentee[] = menteesRes.data.users ?? [];

            const assignedMentees = backendMentees.filter(m =>
                mentor.assignedId!.includes(m.id),
            );

            // 3) fetch progress for each mentee (same pattern as useMentees)
            const progressResponses = await Promise.all(
                assignedMentees.map(async m => {
                    try {
                        const r = await apiClient.get(
                            ENDPOINTS.USERS.GET_PROGRESS(m.id),
                        );
                        return r.data?.data ?? null;
                    } catch {
                        return null;
                    }
                }),
            );

            const menteesWithProgress: Mentee[] = assignedMentees.map((m, idx) => {
                const progress = progressResponses[idx];
                const firstRoadmap = progress?.roadmaps?.items?.[0] ?? null;

                return {
                    ...m,
                    description: m.profileInfo ?? "",
                    progress: progress?.overallRoadmapProgress ?? 0,
                    phase: firstRoadmap?.phase ?? null,
                    phaseNumber: firstRoadmap?.phaseNumber ?? null,
                    completedOn: m.hasCompleted ? m.updatedAt : undefined,
                };
            });

            return { mentor, mentees: menteesWithProgress };
        },
    });

    return useMemo(
        () => ({
            mentor: query.data?.mentor ?? null,
            mentees: query.data?.mentees ?? [],
            isLoading: query.isLoading,
            isError: query.isError,
            error: query.error,
        }),
        [query.data, query.isLoading, query.isError, query.error],
    );
};

export const useAssignMenteesToMentor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ mentorId, menteeIds }: AssignPayload) => {
            await mentorsService.assignMenteesToMentor(mentorId, menteeIds);
        },
        onSuccess: () => {
            // refresh mentors & mentor-mentees caches
            queryClient.invalidateQueries({ queryKey: ['mentors'] });
            queryClient.invalidateQueries({ queryKey: ['mentor-mentees'] });
        },
    });
};



export const useRemoveMenteesFromMentor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ mentorId, menteeIds }: AssignPayload) => {
            await mentorsService.removeMenteesFromMentor(mentorId, menteeIds);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mentors"] });
            queryClient.invalidateQueries({ queryKey: ["mentor-mentees"] });
        },
    });
};