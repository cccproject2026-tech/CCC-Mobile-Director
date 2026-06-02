import { assessmentService } from '@/services/assessments.service';
import {
    ApiAssessment,
    ApiAssessmentSection,
    AssignedAssessmentView,
    CreateAssessmentRequest,
    SubmittedAnswersResponse,
} from '@/types/assessment.types';
import {
    hasCdpPayload,
    mapProgressStatus,
} from '@/utils/assignedAssessmentParser';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAssessmentProgress } from './useProgress';

export const assessmentKeys = {
    all: ['assessments'] as const,
    list: () => [...assessmentKeys.all, 'list'] as const,
    detail: (id: string) => [...assessmentKeys.all, 'detail', id] as const,
    assigned: (userId: string) => [...assessmentKeys.all, 'assigned', userId] as const,
    answers: (assessmentId: string, userId: string) =>
        [...assessmentKeys.all, 'answers', assessmentId, userId] as const,
    recommendations: (assessmentId: string, userId: string) =>
        [...assessmentKeys.all, 'recommendations', assessmentId, userId] as const,
};

function extractProgressItems(
    items: unknown,
): Array<{
    assessmentId: string;
    status?: string;
    progressPercentage?: number;
    completedSections?: number;
    totalSections?: number;
}> {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) => {
            const row = item as Record<string, unknown>;
            const assessmentId = String(
                row.assessmentId ?? row._id ?? row.id ?? '',
            ).trim();
            if (!assessmentId) return null;
            return {
                assessmentId,
                status: typeof row.status === 'string' ? row.status : undefined,
                progressPercentage:
                    typeof row.progressPercentage === 'number'
                        ? row.progressPercentage
                        : undefined,
                completedSections:
                    typeof row.completedSections === 'number'
                        ? row.completedSections
                        : undefined,
                totalSections:
                    typeof row.totalSections === 'number'
                        ? row.totalSections
                        : undefined,
            };
        })
        .filter(Boolean) as Array<{
        assessmentId: string;
        status?: string;
        progressPercentage?: number;
        completedSections?: number;
        totalSections?: number;
    }>;
}

function mergeAssignedWithProgress(
    rows: Awaited<ReturnType<typeof assessmentService.getAssignedAssessments>>,
    progressItems?: Array<{
        assessmentId: string;
        status?: string;
        progressPercentage?: number;
        completedSections?: number;
        totalSections?: number;
    }>,
): AssignedAssessmentView[] {
    const progressMap = new Map(
        (progressItems ?? []).map((item) => [item.assessmentId, item]),
    );

    return rows.map((row) => {
        const progress = progressMap.get(row.assessmentId);
        return {
            ...row.assessment,
            assignmentId: row.assignmentId,
            dueDate: row.dueDate,
            meetingDate: row.meetingDate,
            progressStatus: mapProgressStatus(progress?.status),
            progressPercentage: progress?.progressPercentage,
            completedSections: progress?.completedSections,
            totalSections: progress?.totalSections,
        };
    });
}

export const useAssessments = () => {
    return useQuery<ApiAssessment[]>({
        queryKey: assessmentKeys.list(),
        queryFn: () => assessmentService.getAssessments(),
        staleTime: 30 * 1000,
        retry: 2,
    });
};

export const useAssignedAssessmentsForUser = (userId: string | undefined) => {
    const { data: assessmentProgress, isLoading: progressLoading } =
        useAssessmentProgress(userId);

    const query = useQuery({
        queryKey: assessmentKeys.assigned(userId ?? ''),
        queryFn: () => assessmentService.getAssignedAssessments(userId!),
        enabled: !!userId,
        staleTime: 30 * 1000,
        retry: 2,
    });

    const data = useMemo(() => {
        if (!query.data) return [];
        return mergeAssignedWithProgress(
            query.data,
            extractProgressItems(assessmentProgress?.items),
        );
    }, [query.data, assessmentProgress?.items]);

    return {
        ...query,
        data,
        isLoading: query.isLoading || progressLoading,
    };
};

/** Assigned assessments for a user — uses GET /assessment/assigned/:userId (web parity). */
export const useAssignedAssessments = (userId: string | undefined) => {
    return useAssignedAssessmentsForUser(userId);
};

export const useCreateAssessmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newAssessment: CreateAssessmentRequest) =>
            assessmentService.createAssessment(newAssessment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: assessmentKeys.all });
            queryClient.invalidateQueries({ queryKey: ['progress'] });
        },
    });
};

export const useAssessment = (assessmentId: string | undefined) => {
    return useQuery<ApiAssessment>({
        queryKey: assessmentKeys.detail(assessmentId ?? ''),
        queryFn: () => assessmentService.getAssessmentById(assessmentId!),
        enabled: !!assessmentId,
        staleTime: 30 * 1000,
        retry: 2,
    });
};

export const useAssessmentAnswers = (
    assessmentId: string | undefined,
    userId: string | undefined,
) => {
    return useQuery<SubmittedAnswersResponse>({
        queryKey: assessmentKeys.answers(assessmentId ?? '', userId ?? ''),
        queryFn: () => assessmentService.fetchAnswers(assessmentId!, userId!),
        enabled: !!assessmentId && !!userId,
        staleTime: 30 * 1000,
        retry: 1,
    });
};

export const useAssessmentRecommendations = (
    assessmentId: string | undefined,
    userId: string | undefined,
) => {
    return useQuery({
        queryKey: assessmentKeys.recommendations(assessmentId ?? '', userId ?? ''),
        queryFn: () => assessmentService.getRecommendations(assessmentId!, userId!),
        enabled: !!assessmentId && !!userId,
        staleTime: 60 * 1000,
        retry: 1,
        select: (body) => ({
            raw: body,
            hasCdp: hasCdpPayload(body),
        }),
    });
};

export const useAssignAssessmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            userIds,
            assessmentIds,
            dueDate,
        }: {
            userIds: string[];
            assessmentIds: string[];
            dueDate?: string;
        }) => {
            const isoDue = dueDate
                ? new Date(`${dueDate}T23:59:59`).toISOString()
                : undefined;
            for (const assessmentId of assessmentIds) {
                await assessmentService.assignAssessment({
                    userIds,
                    assessmentIds: [assessmentId],
                    dueDate: isoDue,
                });
            }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: assessmentKeys.all });
            queryClient.invalidateQueries({ queryKey: ['progress'] });
            queryClient.invalidateQueries({ queryKey: ['mentees'] });
            variables.userIds.forEach((uid) => {
                queryClient.invalidateQueries({ queryKey: assessmentKeys.assigned(uid) });
            });
        },
    });
};

export const useUpdateAssessmentMutation = (assessmentId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (updates: { name?: string; description?: string; instructions?: string[] }) =>
            assessmentService.updateAssessmentDetails(assessmentId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(assessmentId) });
            queryClient.invalidateQueries({ queryKey: assessmentKeys.list() });
        },
    });
};

export const useUpdateSectionsMutation = (assessmentId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sections: ApiAssessmentSection[]) =>
            assessmentService.updateSections(assessmentId, sections),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(assessmentId) });
        },
    });
};

export const useUploadBannerImageMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, imageUri }: { id: string; imageUri: string }) =>
            assessmentService.uploadBannerImage(id, imageUri),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(variables.id) });
        },
    });
};


export const useDeleteAssessmentMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (assessmentId: string) =>
            assessmentService.deleteAssessment(assessmentId),

        onSuccess: (_, assessmentId) => {
            // Refresh assessment lists
            queryClient.invalidateQueries({
                queryKey: assessmentKeys.all,
            });

            // Remove deleted assessment detail cache
            queryClient.removeQueries({
                queryKey: assessmentKeys.detail(assessmentId),
            });

            // Optional refreshes
            queryClient.invalidateQueries({
                queryKey: ['progress'],
            });

            queryClient.invalidateQueries({
                queryKey: ['mentees'],
            });
        },
    });
};