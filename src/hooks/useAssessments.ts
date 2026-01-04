import { assessmentService } from '@/services/assessments.service';
import { ApiAssessment, Assessment, CreateAssessmentRequest } from '@/types/assessment.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAssessmentProgress } from './useProgress';
import { mapApiToFrontend } from '@/utils/assessmentMapper';



export const useAssessments = () => {
    return useQuery<ApiAssessment[]>({
        queryKey: ['assessments'],
        queryFn: () => assessmentService.getAssessments(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
};



/**
 * Hook to get only assessments assigned to the current user with progress status
 */
export const useAssignedAssessments = (userId: string) => {
    // Fetch all assessments
    const { data: allAssessments, isLoading, error, refetch, isRefetching } = useAssessments();

    // Fetch user's progress data
    const { data: assessmentProgress, isLoading: isLoadingProgress } = useAssessmentProgress(userId);

    // Get array of assigned assessment progress items
    const progressMap = useMemo(() => {
        const map = new Map();
        assessmentProgress?.items?.forEach(item => {
            map.set(item.assessmentId, item);
        });
        return map;
    }, [assessmentProgress]);

    // Get array of assigned assessment IDs
    const assignedAssessmentIds = useMemo(() => {
        return Array.from(progressMap.keys());
    }, [progressMap]);

    // Map progress status to frontend status
    const mapProgressToStatus = (progressStatus?: string): Assessment['status'] => {
        switch (progressStatus) {
            case 'completed':
                return 'Completed';
            case 'in_progress':
                return 'Submitted'; // Or 'In Progress' if you want to add that status
            case 'not_started':
            default:
                return 'Not Started';
        }
    };

    // Filter and map assessments with progress data
    const assignedAssessments = useMemo(() => {
        if (!allAssessments) return [];

        // Filter only assigned assessments
        const filtered = allAssessments.filter(assessment =>
            assignedAssessmentIds.includes(assessment._id)
        );

        // Map to frontend format and merge with progress data
        return filtered.map(apiAssessment => {
            const frontendAssessment = mapApiToFrontend(apiAssessment);
            const progress = progressMap.get(apiAssessment._id);

            // Override status with progress data
            if (progress) {
                return {
                    ...frontendAssessment,
                    status: mapProgressToStatus(progress.status),
                    // You can also add progress percentage if needed
                    progressPercentage: progress.progressPercentage,
                    completedSections: progress.completedSections,
                    totalSections: progress.totalSections,
                };
            }

            return frontendAssessment;
        });
    }, [allAssessments, assignedAssessmentIds, progressMap]);

    return {
        data: assignedAssessments,
        isLoading: isLoading || isLoadingProgress,
        error,
        refetch,
        isRefetching,
        assignedCount: assignedAssessmentIds.length,
    };
};

export const useCreateAssessmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newAssessment: CreateAssessmentRequest) =>
            assessmentService.createAssessment(newAssessment),
        onSuccess: () => {
            // Invalidate and refetch assessments query
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
        },
    });
}