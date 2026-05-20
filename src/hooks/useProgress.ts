import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { progressService } from "@/services/progress.service";
import {
  AddFinalCommentRequest,
  DeleteFinalCommentRequest,
  ProgressData,
  UpdateFinalCommentRequest,
} from "@/types/progress.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================
// PROGRESS QUERY KEYS
// ============================================
export const progressKeys = {
  all: ["progress"] as const,
  user: (userId: string) => [...progressKeys.all, "user", userId] as const,
  roadmaps: (userId: string) =>
    [...progressKeys.all, "roadmaps", userId] as const,
  assessments: (userId: string) =>
    [...progressKeys.all, "assessments", userId] as const,
  finalComments: (userId: string) =>
    [...progressKeys.all, "final-comments", userId] as const,
};

// ============================================
// INTERNAL FETCHER
// ============================================
const fetchProgressForUser = async (userId: string): Promise<ProgressData> => {
  if (!userId) throw new Error("User ID is missing");

  const response = await apiClient.get(ENDPOINTS.USERS.GET_PROGRESS(userId), {
    params: {
      t: Date.now(), // prevent caching
    }
  });

  if (!response.data.success || !response.data.data) {
    return {
      overallProgress: 0,
      roadmaps: {
        total: 0,
        completed: 0,
        percentage: 0,
        items: [],
      },
      assessments: {
        total: 0,
        completed: 0,
        percentage: 0,
        items: [],
      },
      finalComments: [],
    };
  }

  const data = response.data.data;

  const progressData: ProgressData = {
    overallProgress: data.overallProgress ?? data.overallRoadmapProgress ?? 0,
    overallCompleted: data.overallCompleted ?? false,
    roadmaps: {
      total: data.totalRoadmaps ?? 0,
      completed: data.completedRoadmaps ?? 0,
      percentage: data.overallRoadmapProgress ?? 0,
      items: data.roadmaps || [],
    },
    assessments: {
      total: data.totalAssessments ?? 0,
      completed: data.completedAssessments ?? 0,
      percentage: data.overallAssessmentProgress ?? 0,
      items: data.assessments || [],
    },
    finalComments: data.finalComments || [],
  };

  return progressData;
};

// ============================================
// MAIN PROGRESS HOOK (generic: any userId)
// ============================================
export const useProgress = (userId: string | undefined) => {
  const id = userId || "";

  return useQuery({
    queryKey: progressKeys.user(id),
    queryFn: () => fetchProgressForUser(id),
    enabled: !!id,
    // staleTime: 1000 * 60 * 2,
    // gcTime: 1000 * 60 * 10,
    // retry: 1,
    // refetchOnWindowFocus: true,
  });
};

// ============================================
// GRANULAR HOOKS (all take userId)
// ============================================

export const useAssignedRoadmapIds = (userId: string | undefined) => {
  const { data, isLoading, isError, error } = useProgress(userId);

  const roadmapIds = data?.roadmaps.items.map(item => item.roadMapId) || [];

  return { roadmapIds, isLoading, isError, error };
};

export const useRoadmapProgress = (userId: string | undefined) => {
  const { data, isLoading, isError, error } = useProgress(userId);

  return {
    data: data?.roadmaps,
    overallProgress: data?.roadmaps.percentage ?? 0,
    isLoading,
    isError,
    error,
  };
};

export const useAssessmentProgress = (userId: string | undefined) => {
  const { data, isLoading, isError, error } = useProgress(userId);

  return {
    data: data?.assessments,
    overallProgress: data?.assessments.percentage ?? 0,
    isLoading,
    isError,
    error,
  };
};

export const useOverallProgress = (userId: string | undefined) => {
  const { data, isLoading, isError, error } = useProgress(userId);

  return {
    progress: data?.overallProgress ?? 0,
    isLoading,
    isError,
    error,
  };
};

export const useRoadmapProgressById = (
  userId: string | undefined,
  roadmapId: string,
) => {
  const { data, isLoading, isError, error } = useProgress(userId);

  const roadmapProgress =
    data?.roadmaps.items.find(item => item.roadMapId === roadmapId) || null;

  return { data: roadmapProgress, isLoading, isError, error };
};

export const useAssessmentProgressById = (
  userId: string | undefined,
  assessmentId: string,
) => {
  const { data, isLoading, isError, error } = useProgress(userId);

  const assessmentProgress =
    data?.assessments.items.find(item => item.assessmentId === assessmentId) ||
    null;

  return { data: assessmentProgress, isLoading, isError, error };
};

export const useNestedRoadmapProgressById = (
  userId: string | undefined,
  roadmapId: string,
  nestedRoadmapId: string,
) => {
  const { data, isLoading, isError, error } = useProgress(userId);

  const roadmapProgress = data?.roadmaps.items.find(
    item => item.roadMapId === roadmapId,
  );

  const nestedProgress =
    roadmapProgress?.nestedRoadmaps?.find(
      nested => nested.nestedRoadmapId === nestedRoadmapId,
    ) || null;

  return { data: nestedProgress, isLoading, isError, error };
};

// ============================================
// FINAL COMMENTS (per userId)
// ============================================

export const useFinalComments = (userId: string | undefined) => {
  const id = userId || "";
  return useQuery({
    queryKey: progressKeys.finalComments(id),
    queryFn: async () => {
      if (!id) throw new Error("User ID is missing");
      const response = await progressService.getFinalComments(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 0,
    // gcTime: 1000 * 60 * 10,
  });
};

export const useAddFinalComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddFinalCommentRequest) =>
      progressService.addFinalComment(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.user(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: progressKeys.finalComments(variables.userId),
      });
    },
  });
};

export const useUpdateFinalComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateFinalCommentRequest) =>
      progressService.updateFinalComment(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.user(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: progressKeys.finalComments(variables.userId),
      });
    },
  });
};

export const useDeleteFinalComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeleteFinalCommentRequest) =>
      progressService.deleteFinalComment(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.user(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: progressKeys.finalComments(variables.userId),
      });
    },
  });
};


export const useDirectorOverview = (period: string = 'yearly', year?: number) => {
  return useQuery({
    queryKey: ['directorOverview', period, year],
    queryFn: () => progressService.getMergedDirectorOverview(period, year),
  });
};

export const useOverallProgressList = (roles: string[] = ['pastor']) => {
  return useQuery({
    queryKey: ['progress', 'overview', 'all', roles.join(',')],
    queryFn: () => progressService.getOverallProgress(roles),
  });
};
