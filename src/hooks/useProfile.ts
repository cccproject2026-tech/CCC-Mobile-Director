import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/stores/auth.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CombinedProfile, UpdateProfileData } from "@/types/user.types";
import { useProgress } from "./useProgress";

// --------------------------------------------
// Query Keys
// --------------------------------------------
export const profileKeys = {
    all: ["profile"] as const,
    user: (userId: string) => [...profileKeys.all, "user", userId] as const,
    interest: (email: string) =>
        [...profileKeys.all, "interest", email] as const,
    combined: (userId: string) =>
        [...profileKeys.all, "combined", userId] as const,
    formFields: () => [...profileKeys.all, "formFields"] as const,
};

// --------------------------------------------
// Individual profile queries
// --------------------------------------------
export const useUserProfile = (userId: string) => {

    return useQuery({
        queryKey: profileKeys.user(userId),
        queryFn: async () => {
            if (!userId) throw new Error("User ID is missing");
            return profileService.getMyProfile(userId); // UserWithInterest
        },
        enabled: !!userId,
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
    });
};

export const useInterestsByEmail = (email: string) => {

    return useQuery({
        queryKey: profileKeys.interest(email || ""),
        queryFn: async () => {
            if (!email) throw new Error("User email is missing");
            return profileService.getInterestDetails(email);
        },
        enabled: !!email,
        staleTime: 5 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
        retry: 1,
    });
};

// --------------------------------------------
// Director Profile
// --------------------------------------------
export const useProfile = (userId: string) => {
    const userQuery = useUserProfile(userId);

    const isLoading = userQuery.isLoading;
    const isError = userQuery.isError;
    const error = userQuery.error;

    const data = userId
        ? {
            user: userQuery.data || null,
        }
        : undefined;

    const isSuccess = userQuery.isSuccess;

    return {
        data,
        isLoading,
        isError,
        error,
        isSuccess,
        userQuery,
    };
};

// --------------------------------------------
// Mentor/Mentee Profile with interests and progress
// --------------------------------------------
export const useMentorMenteeProfile = (userId: string) => {
    // 1. Fetch the base user profile first
    const userQuery = useUserProfile(userId);

    // 2. Extract email and determine if we are ready to fetch interests
    const userEmail = userQuery.data?.email;

    // 3. Dependent Query: useInterestsByEmail already has internal 'enabled' logic 
    // but we ensure it receives the email only when available
    const interestQuery = useInterestsByEmail(userEmail || "");

    // 4. Progress can be fetched in parallel with the user profile
    const progressQuery = useProgress(userId);

    // Derive combined loading state:
    // We are "loading" if the user profile is pending OR if the user profile 
    // succeeded but the interest fetch is still in progress
    const isLoading = userQuery.isLoading ||
        (!!userEmail && interestQuery.isLoading) ||
        progressQuery.isLoading;

    // Derive combined error state
    const isError = userQuery.isError || interestQuery.isError || progressQuery.isError;
    const error = userQuery.error || interestQuery.error || progressQuery.error;

    // Compute combined profile data
    const data: CombinedProfile | undefined = userId ? {
        user: userQuery.data || null,
        interest: (interestQuery.data as any) || null,
        progress: progressQuery.data || {
            overallProgress: 0,
            roadmaps: { total: 0, completed: 0, percentage: 0, items: [] },
            assessments: { total: 0, completed: 0, percentage: 0, items: [] }
        }
    } : undefined;

    // Check if queries are successful (interest is only required if email exists)
    const isSuccess = userQuery.isSuccess &&
        (!userEmail || interestQuery.isSuccess) &&
        progressQuery.isSuccess;

    return {
        data,
        isLoading,
        isError,
        error,
        isSuccess,
        userQuery,
        interestQuery,
        progressQuery,
    };
}


export const useFormFields = () => {
    return useQuery({
        queryKey: profileKeys.formFields(),
        queryFn: () => profileService.getFormFields(),
        staleTime: 60 * 60 * 1000, // 1 hour - form fields don't change often
        gcTime: 2 * 60 * 60 * 1000, // 2 hours
        retry: 2,
    });
};


// --------------------------------------------
// Profile update mutation
// --------------------------------------------
export const useUpdateProfile = (email: string, userId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updates: UpdateProfileData) => {
            if (!userId || !email) {
                throw new Error("User ID and email are required");
            }

            const userUpdates: Partial<any> = {};
            const interestUpdates: Partial<any> = {};

            if (updates.firstName !== undefined)
                userUpdates.firstName = updates.firstName;
            if (updates.lastName !== undefined)
                userUpdates.lastName = updates.lastName;
            if (updates.avatar !== undefined)
                userUpdates.profilePicture = updates.avatar;

            if (updates.phoneNumber !== undefined)
                interestUpdates.phoneNumber = updates.phoneNumber;
            if (updates.churches !== undefined)
                interestUpdates.churchDetails = updates.churches;
            if (updates.title !== undefined) interestUpdates.title = updates.title;
            if (updates.yearsInMinistry !== undefined)
                interestUpdates.yearsInMinistry = updates.yearsInMinistry;
            if (updates.conference !== undefined)
                interestUpdates.conference = updates.conference;
            if (updates.currentCommunityServiceProjects !== undefined) {
                interestUpdates.currentCommunityProjects =
                    updates.currentCommunityServiceProjects;
            }
            if (updates.interests !== undefined)
                interestUpdates.interests = updates.interests;
            if (updates.comments !== undefined)
                interestUpdates.comments = updates.comments;
            if (updates.bio !== undefined)
                interestUpdates.profileInfo = updates.bio;

            const [userRes, interestRes] = await Promise.allSettled([
                Object.keys(userUpdates).length > 0
                    ? profileService.updateUserProfile(userId, userUpdates)
                    : Promise.resolve(null),
                Object.keys(interestUpdates).length > 0
                    ? profileService.updateInterestDetails(email, interestUpdates)
                    : Promise.resolve(null),
            ]);

            if (userRes.status === "rejected") {
                throw userRes.reason;
            }

            if (interestRes.status === "rejected") {
                throw interestRes.reason;
            }

            return {
                user: userRes.status === "fulfilled" ? userRes.value : null,
                interest: interestRes.status === "fulfilled" ? interestRes.value : null,
            };
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: profileKeys.all });
        },
    });
};

// --------------------------------------------
// Users list by role
// --------------------------------------------
export const useGetAllUsers = (role?: string) => {
    return useQuery({
        queryKey: ["users", "all", role || ""],
        queryFn: () => profileService.getAllUsers(role),
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

// --------------------------------------------
// Profile picture upload
// --------------------------------------------
export const useUploadProfilePicture = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async (file: any) => {
            if (!user?.id) {
                throw new Error("User ID is required");
            }
            return profileService.uploadProfilePicture(user.id, file);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: profileKeys.all });
        },
    });
};

// --------------------------------------------
// Documents
// --------------------------------------------
export const useDocuments = () => {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["documents", user?.id || ""],
        queryFn: async () => {
            if (!user?.id) throw new Error("User ID is missing");
            return profileService.getDocuments(user.id);
        },
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
        retry: 1,
    });
};

export const useDocumentsByUserId = (userId: string | undefined) => {
    return useQuery({
        queryKey: ["documents", userId || ""],
        queryFn: async () => {
            if (!userId) throw new Error("User ID is missing");
            return profileService.getDocuments(userId);
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
        retry: 1,
    });
};

export const useUploadDocument = (userId?: string) => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const targetUserId = userId ?? user?.id;

    return useMutation({
        mutationFn: async (file: any) => {
            if (!targetUserId) {
                throw new Error("User ID is required");
            }
            return profileService.uploadDocument(targetUserId, file);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["documents", targetUserId || ""],
            });
        },
    });
};

export const useDeleteDocument = (userId?: string) => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const targetUserId = userId ?? user?.id;

    return useMutation({
        mutationFn: async (documentUrl: string) => {
            if (!targetUserId) {
                throw new Error("User ID is required");
            }
            return profileService.deleteDocument(targetUserId, documentUrl);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["documents", targetUserId || ""],
            });
        },
    });
};

// --------------------------------------------
// Delete User
// --------------------------------------------
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => profileService.deleteUser(userId),
        onSuccess: (_data, userId) => {
            void queryClient.cancelQueries({ queryKey: profileKeys.user(userId) });
            queryClient.removeQueries({ queryKey: profileKeys.user(userId) });
            queryClient.removeQueries({ queryKey: profileKeys.combined(userId) });

            void queryClient.invalidateQueries({ queryKey: ["mentees"] });
            void queryClient.invalidateQueries({ queryKey: ["mentors"] });
        },
    });
};

// --------------------------------------------
// Notifications
// --------------------------------------------
// export const useNotifications = (userId?: string) => {
//     return useQuery({
//         queryKey: ["notifications", userId],
//         queryFn: () => profileService.getNotifications(userId!),
//         enabled: !!userId,
//     });
// };


// get User by ID

export const useGetUserById = (userId: string | undefined) => {
    return useQuery({
        queryKey: ["user", userId || ""],
        queryFn: async () => {
            if (!userId) throw new Error("User ID is missing");
            return profileService.getUserById(userId);
        },
        enabled: !!userId,
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
    });
}