import { grantService } from '@/services/microgrant.service';
import { ApplicationWithProfile, MicrograntApplication, MicrograntApplicationDetail } from '@/types/microgrant.types';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUserProfile } from './useProfile';
import { profileService } from '@/services/profile.service';

export const micrograntApplicationsKeys = {
    all: ['microgrant-applications'] as const,
    byStatus: (status?: string) => ['microgrant-applications', status] as const,
    byId: (applicationId: string) => ['microgrant-applications', 'detail', applicationId] as const,
};

/**
 * Hook to fetch microgrant applications with optional status filter
 */
export function useMicrograntApplications(status?: string) {
    return useQuery<MicrograntApplication[], Error>({
        queryKey: micrograntApplicationsKeys.byStatus(status),
        queryFn: () => grantService.getApplications(status),
    });
}

/**
 * Hook to fetch a single microgrant application by ID
 */
export function useMicrograntApplication(applicationId: string) {
    return useQuery<MicrograntApplicationDetail, Error>({
        queryKey: micrograntApplicationsKeys.byId(applicationId),
        queryFn: () => grantService.getApplication(applicationId),
        enabled: !!applicationId,
    });
}




export const useMicroGrantApplicationWithProfiles = (status: 'new' | 'pending' | 'accepted') => {
    const { data: applicationsData, isLoading: isLoadingApplications } = useMicrograntApplications(status);

    // Extract unique user IDs
    const userIds = applicationsData
        ?.filter((app: MicrograntApplication) => app.userId?._id)
        .map((app: MicrograntApplication) => app.userId!._id)
        .filter((id, index, self) => self.indexOf(id) === index) || [];

    // Fetch user profiles using useQueries
    const userProfileQueries = useQueries({
        queries: userIds.map((userId: string) => ({
            queryKey: ['user', userId],
            queryFn: () => profileService.getUserById(userId),
            enabled: !!userId,
            staleTime: 5 * 60 * 1000,
        })),
    });

    // Check loading state
    const isLoadingProfiles = userProfileQueries.some(query => query.isLoading);
    const isLoading = isLoadingApplications || isLoadingProfiles;

    // Create profile map
    const userProfileMap = new Map();
    userProfileQueries.forEach((query, index) => {
        if (query.data) {
            userProfileMap.set(userIds[index], query.data);
        }
    });

    // Combine applications with profiles
    const applicationsWithProfiles: ApplicationWithProfile[] = applicationsData?.map((app: MicrograntApplication) => {
        if (!app.userId?._id) {
            return {
                ...app,
                userProfile: {
                    firstName: 'Unknown',
                    lastName: 'User',
                    role: 'N/A',
                },
            };
        }

        const profileData = userProfileMap.get(app.userId._id);

        return {
            ...app,
            userProfile: profileData ? {
                firstName: profileData.firstName || 'Unknown',
                lastName: profileData.lastName || 'User',
                profilePicture: profileData.profilePicture,
                role: profileData.role || 'Pastor',
            } : {
                firstName: 'Loading',
                lastName: '...',
                role: 'Pastor',
            },
        };
    }) || [];

    return {
        applications: applicationsWithProfiles,
        isLoading,
        totalCount: applicationsData?.length || 0,
    };
};

export const useMicroGrantApplicationDetails = (applicationId: string) => {
    // Fetch application directly from API
    const { data: application, isLoading: isLoadingApplication, error } = useQuery({
        queryKey: ['microgrant-application', applicationId],
        queryFn: () => grantService.getApplication(applicationId),
        enabled: !!applicationId,
    });

    console.log('Fetched application:', application);
    // Get userId from application
    const userId = application?.userId?._id;

    // Fetch user profile
    const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => profileService.getUserById(userId!),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });

    const isLoading = isLoadingApplication || (!!userId && isLoadingProfile);

    return {
        application,
        userProfile,
        isLoading,
        error,
    };
};

// Update status mutation
export const useUpdateApplicationStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, status }: { userId: string; status: string }) =>
            grantService.updateApplicationStatus(userId, status),
        onSuccess: () => {
            // Invalidate all application queries
            queryClient.invalidateQueries({ queryKey: ['microgrant-applications'] });
            queryClient.invalidateQueries({ queryKey: ['microgrant-application'] });
        },
    });
};