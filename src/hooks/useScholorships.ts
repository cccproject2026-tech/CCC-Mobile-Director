// hooks/useScholorships.ts
import { scholarshipService } from "@/services/scholorship.service";
import { AwardedUser } from "@/types/scholorship.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const scholarshipKeys = {
    all: ["scholarships"] as const,
    list: () => [...scholarshipKeys.all, "list"] as const,
    stats: ["scholarships", "stats"] as const,
};

export const useScholarships = () => {
    return useQuery({
        queryKey: scholarshipKeys.list(),
        queryFn: () => scholarshipService.getAll(),
        // staleTime: 5 * 60 * 1000,
    });
};

export const useScholarshipStats = () => {
    return useQuery({
        queryKey: scholarshipKeys.stats,
        queryFn: () => scholarshipService.getStats(),
        staleTime: 5 * 60 * 1000,
    });
};

export const useAddAwardedUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ scholarshipId, payload }: { scholarshipId: string; payload: AwardedUser }) =>
            scholarshipService.addAwardedUser(scholarshipId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scholarshipKeys.all });
        },
    });
};

export const useUpdateAwardedUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ scholarshipId, index, payload }: { scholarshipId: string; index: number; payload: Partial<AwardedUser> }) =>
            scholarshipService.updateAwardedUser(scholarshipId, index, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scholarshipKeys.all });
        },
    });
};

export const useUpdateScholarship = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ scholarshipId, payload }: { scholarshipId: string; payload: Partial<{ type: string; amount: number }> }) =>
            scholarshipService.updateScholarship(scholarshipId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scholarshipKeys.all });
        },
    });
};
