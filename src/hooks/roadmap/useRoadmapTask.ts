import { roadmapService } from '@/services/roadmap.service';
import {
    AddRoadmapCommentPayload,
    CreateRoadmapQueryPayload,
    NestedRoadmap,
    ReplyRoadmapQueryPayload,
    RoadmapComment,
    RoadmapExtraAnswer,
    RoadmapExtrasDocument,
    RoadmapQuery,
} from '@/types/roadmap.types';
import {
    dedupeExtrasByLabel,
    unwrapComments,
    unwrapExtrasDocuments,
    unwrapExtrasRows,
    unwrapQueries,
    withNestedTaskScope,
} from '@/utils/roadmapTaskParser';
import { logQueriesGetResponse } from '@/utils/roadmapTaskApiDebug';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roadmapKeys } from './useRoadmaps';

export const roadmapTaskKeys = {
    task: (roadmapId: string, taskId: string) =>
        [...roadmapKeys.all, 'task', roadmapId, taskId] as const,
    extras: (roadmapId: string, userId: string, taskId: string) =>
        [...roadmapKeys.all, 'extras', roadmapId, userId, taskId] as const,
    documents: (roadmapId: string, userId: string, taskId: string) =>
        [...roadmapKeys.all, 'documents', roadmapId, userId, taskId] as const,
    comments: (roadmapId: string, userId: string) =>
        [...roadmapKeys.all, 'comments', roadmapId, userId] as const,
    queries: (
        roadmapId: string,
        userId: string,
        status: string,
        taskId?: string,
    ) => [...roadmapKeys.all, 'queries', roadmapId, userId, status, taskId ?? ''] as const,
};

export function useNestedRoadmapTask(
    roadmapId: string | undefined,
    taskId: string | undefined,
) {
    return useQuery<NestedRoadmap>({
        queryKey: roadmapTaskKeys.task(roadmapId ?? '', taskId ?? ''),
        queryFn: () => roadmapService.getNestedRoadmapItem(roadmapId!, taskId!),
        enabled: !!roadmapId && !!taskId,
        staleTime: 30_000,
        retry: 1,
    });
}

export function useRoadmapTaskExtras(
    roadmapId: string | undefined,
    userId: string | undefined,
    taskId: string | undefined,
) {
    return useQuery<RoadmapExtraAnswer[]>({
        queryKey: roadmapTaskKeys.extras(roadmapId ?? '', userId ?? '', taskId ?? ''),
        queryFn: async () => {
            const raw = await roadmapService.getExtras(roadmapId!, userId!, taskId);
            return dedupeExtrasByLabel(unwrapExtrasRows(raw));
        },
        enabled: !!roadmapId && !!userId && !!taskId,
        staleTime: 30_000,
        retry: 1,
    });
}

export function useRoadmapTaskDocuments(
    roadmapId: string | undefined,
    userId: string | undefined,
    taskId: string | undefined,
) {
    return useQuery<RoadmapExtrasDocument[]>({
        queryKey: roadmapTaskKeys.documents(roadmapId ?? '', userId ?? '', taskId ?? ''),
        queryFn: async () => {
            const raw = await roadmapService.getExtrasDocuments(roadmapId!, userId!, taskId);
            return unwrapExtrasDocuments(raw);
        },
        enabled: !!roadmapId && !!userId && !!taskId,
        staleTime: 30_000,
        retry: 1,
    });
}

export function useRoadmapComments(
    roadmapId: string | undefined,
    userId: string | undefined,
) {
    return useQuery<RoadmapComment[]>({
        queryKey: roadmapTaskKeys.comments(roadmapId ?? '', userId ?? ''),
        queryFn: async () => {
            const raw = await roadmapService.getComments(roadmapId!, userId!);
            return unwrapComments(raw);
        },
        enabled: !!roadmapId && !!userId,
        staleTime: 30_000,
        retry: 1,
    });
}

export function useAddRoadmapComment(roadmapId: string, userId: string, taskId?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AddRoadmapCommentPayload) =>
            roadmapService.addComment(roadmapId, withNestedTaskScope(payload, taskId)),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: roadmapTaskKeys.comments(roadmapId, userId),
            });
        },
    });
}

export function useRoadmapQueries(
    roadmapId: string | undefined,
    userId: string | undefined,
    status: 'pending' | 'answered',
    taskId?: string,
) {
    return useQuery<RoadmapQuery[]>({
        queryKey: roadmapTaskKeys.queries(
            roadmapId ?? '',
            userId ?? '',
            status,
            taskId,
        ),
        queryFn: async () => {
            const raw = await roadmapService.getQueries(
                roadmapId!,
                userId!,
                status,
                taskId,
            );
            const unwrapped = unwrapQueries(raw);
            if (__DEV__) {
                logQueriesGetResponse(
                    roadmapId!,
                    userId!,
                    status,
                    taskId,
                    raw,
                    unwrapped,
                );
            }
            return unwrapped;
        },
        enabled: !!roadmapId && !!userId,
        staleTime: 30_000,
        retry: 1,
    });
}

export function useReplyRoadmapQuery(
    roadmapId: string,
    userId: string,
    taskId?: string,
) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            queryId,
            payload,
        }: {
            queryId: string;
            payload: ReplyRoadmapQueryPayload;
        }) => roadmapService.replyToQuery(roadmapId, queryId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...roadmapKeys.all, 'queries', roadmapId, userId],
            });
            if (taskId) {
                queryClient.invalidateQueries({
                    queryKey: roadmapTaskKeys.queries(roadmapId, userId, 'pending', taskId),
                });
                queryClient.invalidateQueries({
                    queryKey: roadmapTaskKeys.queries(roadmapId, userId, 'answered', taskId),
                });
            }
        },
    });
}

export function useSubmitRoadmapQuery(roadmapId: string, userId: string, taskId?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRoadmapQueryPayload) =>
            roadmapService.submitQuery(roadmapId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...roadmapKeys.all, 'queries', roadmapId, userId],
            });
        },
    });
}

export function useUserAssignedRoadmaps(userId: string | undefined) {
    return useQuery({
        queryKey: [...roadmapKeys.all, 'user', userId ?? ''],
        queryFn: () => roadmapService.getUserRoadmaps(userId!),
        enabled: !!userId,
        staleTime: 30_000,
        retry: 1,
    });
}
