import { interestService } from "@/services/interest.service";
import { UpdateInterestStatusResponse } from "@/types/interest.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to fetch all interests.
 */

export const useInterests = () => {
    return useQuery({
        queryKey: ['interests'],
        queryFn: () => interestService.getAll(),
        // staleTime: 5 * 60 * 1000,
        // gcTime: 10 * 60 * 1000,
        // retry: 1,
    })
}

/**
 * Hook to update interest status.
 */

export function useUpdateInterestStatus() {
    const queryClient = useQueryClient();

    return useMutation<UpdateInterestStatusResponse, Error, { interestId: string; status: 'accepted' | 'rejected' | 'pending' }>({
        mutationFn: ({ interestId, status }) =>
            interestService.updateStatus(interestId, status),
        onSuccess: () => {
            // Invalidate interests list to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['interests'] });
        },
    });
}

