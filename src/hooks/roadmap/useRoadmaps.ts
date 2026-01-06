// hooks/roadmap/useRoadmaps.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roadmapService } from '@/services/roadmap.service';
import {
    CreateRoadmapRequest,
    CreateNestedRoadmapRequest,
    UpdateRoadmapRequest,
    UpdateNestedRoadmapRequest,
    Roadmap,
    RoadmapStatus,
} from '@/types/roadmap.types';
import { useMemo } from 'react';
import { useAssignedRoadmapIds, useProgress } from '../useProgress';

// ============================================
// QUERY KEYS
// ============================================
export const roadmapKeys = {
    all: ['roadmaps'] as const,
    lists: () => [...roadmapKeys.all, 'list'] as const,
    details: () => [...roadmapKeys.all, 'detail'] as const,
    detail: (id: string) => [...roadmapKeys.details(), id] as const,
    assigned: (userId?: string) => [...roadmapKeys.all, 'assigned', userId ?? ''] as const,
};

// ============================================
// FETCH ALL ROADMAPS (Director)
// ============================================
export function useAllRoadmaps() {
    return useQuery({
        queryKey: roadmapKeys.lists(),
        queryFn: () => roadmapService.getAllRoadmaps(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
        retry: 1,
    });
}

// ============================================
// FETCH SINGLE ROADMAP BY ID
// ============================================
export function useRoadmap(roadmapId: string | undefined) {
    return useQuery({
        queryKey: roadmapKeys.detail(roadmapId || ''),
        queryFn: () => roadmapService.getRoadmapById(roadmapId!),
        enabled: !!roadmapId,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
}

// ============================================
// CREATE ROADMAP MUTATION
// ============================================
export function useCreateRoadmap() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateRoadmapRequest) =>
            roadmapService.createRoadmap(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roadmapKeys.lists() });
        },
    });
}

// ============================================
// CREATE NESTED ROADMAP MUTATION
// ============================================
export function useCreateNestedRoadmap() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roadmapId, payload }: {
            roadmapId: string;
            payload: CreateNestedRoadmapRequest;
        }) => roadmapService.createNestedRoadmap(roadmapId, payload),
        onSuccess: (_, variables) => {
            // Invalidate the specific roadmap detail
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(variables.roadmapId)
            });
            // Also invalidate lists
            queryClient.invalidateQueries({ queryKey: roadmapKeys.lists() });
        },
    });
}

// ============================================
// UPDATE ROADMAP MUTATION (Parent)
// ============================================
export function useUpdateRoadmap() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roadmapId, payload }: {
            roadmapId: string;
            payload: UpdateRoadmapRequest;
        }) => roadmapService.updateRoadmap(roadmapId, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(variables.roadmapId)
            });
            queryClient.invalidateQueries({ queryKey: roadmapKeys.lists() });
        },
    });
}

// ============================================
// UPDATE NESTED ROADMAP MUTATION
// ============================================
export function useUpdateNestedRoadmap() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roadmapId, nestedRoadmapId, payload }: {
            roadmapId: string;
            nestedRoadmapId: string;
            payload: UpdateNestedRoadmapRequest;
        }) => roadmapService.updateNestedRoadmap(roadmapId, nestedRoadmapId, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(variables.roadmapId)
            });
            queryClient.invalidateQueries({ queryKey: roadmapKeys.lists() });
        },
    });
}

// ============================================
// DELETE ROADMAP MUTATION
// ============================================
export function useDeleteRoadmap() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roadmapId: string) => roadmapService.deleteRoadmap(roadmapId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roadmapKeys.lists() });
        },
    });
}


// ============================================
// FETCH ASSIGNED ROADMAPS WITH PROGRESS (PASTOR/DIRECTOR USE)
// ✅ NEW - For Progress Tracking
// ============================================

const mapProgressStatusToRoadmapStatus = (
    progressStatus: 'not_started' | 'in_progress' | 'completed'
): RoadmapStatus => {
    switch (progressStatus) {
        case 'not_started':
            return 'not started';
        case 'in_progress':
            return 'in progress';
        case 'completed':
            return 'completed';
        default:
            return 'not started';
    }
};

// ============================================
// FETCH ASSIGNED ROADMAPS WITH PROGRESS
// ✅ Fixed status type mapping
// ============================================
export function useAssignedRoadmaps(userId?: string) {
    // ✅ Get assigned roadmap IDs from progress
    const { roadmapIds, isLoading: isIdsLoading, isError: isIdsError } = useAssignedRoadmapIds(userId);

    // ✅ Get full progress data for merging
    const { data: progressData } = useProgress(userId);

    // Fetch all roadmaps and filter to assigned ones
    const roadmapsQuery = useQuery({
        queryKey: roadmapKeys.assigned(userId),
        queryFn: async () => {
            console.log('📤 Fetching assigned roadmaps for user:', userId);
            console.log('📋 Assigned roadmap IDs:', roadmapIds);

            // Fetch all roadmaps
            const allRoadmaps = await roadmapService.getAllRoadmaps();

            // Filter to only assigned roadmaps
            const assignedRoadmaps = allRoadmaps.filter((roadmap) =>
                roadmapIds.includes(roadmap._id)
            );

            console.log(
                '✅ Roadmaps filtered.',
                'Total:', allRoadmaps.length,
                'Assigned:', assignedRoadmaps.length
            );

            return assignedRoadmaps;
        },
        enabled: !isIdsLoading && !isIdsError && roadmapIds.length > 0,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 15,
        retry: 1,
    });

    // Merge roadmaps with progress data
    const roadmapsWithProgress = useMemo(() => {
        if (!roadmapsQuery.data || !progressData?.roadmaps.items) {
            return roadmapsQuery.data || [];
        }

        console.log('🔄 Merging roadmaps with progress data...');

        const merged = roadmapsQuery.data.map((roadmap) => {
            // Find matching progress item
            const progressItem = progressData.roadmaps.items.find(
                (p) => p.roadMapId === roadmap._id
            );

            if (!progressItem) {
                return roadmap;
            }

            // ✅ Merge progress status into roadmap (with proper type conversion)
            const mergedRoadmap: Roadmap = {
                ...roadmap,
                // Map progress status to roadmap status format
                status: mapProgressStatusToRoadmapStatus(progressItem.status),
                // Add progress metadata (extend Roadmap type if needed)
                totalSteps: progressItem.totalSteps || roadmap.totalSteps,

                // Merge nested roadmap progress if exists
                roadmaps: roadmap.roadmaps?.map((nested) => {
                    const nestedProgress = progressItem.nestedRoadmaps?.find(
                        (np) => np.nestedRoadmapId === nested._id
                    );

                    if (!nestedProgress) return nested;

                    return {
                        ...nested,
                        status: mapProgressStatusToRoadmapStatus(nestedProgress.status),
                        totalSteps: nestedProgress.totalSteps || nested.totalSteps,
                    };
                }) || [],
            };

            return mergedRoadmap;
        });

        console.log('✅ Roadmaps merged with progress status');
        return merged;
    }, [roadmapsQuery.data, progressData]);

    return {
        data: roadmapsWithProgress,
        isLoading: isIdsLoading || roadmapsQuery.isLoading,
        isError: isIdsError || roadmapsQuery.isError,
        error: roadmapsQuery.error,
        refetch: roadmapsQuery.refetch,
        isRefetching: roadmapsQuery.isRefetching,
        // Additional state for granular control
        progressData,
        roadmapIds,
        isProgressLoading: isIdsLoading,
        isRoadmapsLoading: roadmapsQuery.isLoading,
    };
}
