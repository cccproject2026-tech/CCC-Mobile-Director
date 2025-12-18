import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/stores/auth.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CombinedProfile, UpdateProfileData } from "@/types/user.types";

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
};

// --------------------------------------------
// Individual profile queries
// --------------------------------------------
export const useUserProfile = () => {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: profileKeys.user(user?.id || ""),
        queryFn: async () => {
            if (!user?.id) throw new Error("User ID is missing");
            return profileService.getMyProfile(user.id); // UserWithInterest
        },
        enabled: !!user?.id,
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
    });
};

export const useInterests = () => {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: profileKeys.interest(user?.email || ""),
        queryFn: async () => {
            if (!user?.email) throw new Error("User email is missing");
            return profileService.getInterestDetails(user.email);
        },
        enabled: !!user?.email,
        staleTime: 5 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
        retry: 1,
    });
};

// --------------------------------------------
// Combined profile hook
// --------------------------------------------
export const useProfile = () => {
    const { user } = useAuthStore();
    const userQuery = useUserProfile();

    const isLoading = userQuery.isLoading;
    const isError = userQuery.isError;
    const error = userQuery.error;

    const data: CombinedProfile | undefined = user?.id
        ? {
            user: userQuery.data || null,
            interest: userQuery.data?.interest || null,
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
// Profile update mutation
// --------------------------------------------
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async (updates: UpdateProfileData) => {
            if (!user?.id || !user?.email) {
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
                    ? profileService.updateUserProfile(user.id, userUpdates)
                    : Promise.resolve(null),
                Object.keys(interestUpdates).length > 0
                    ? profileService.updateInterestDetails(user.email, interestUpdates)
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

export const useUploadDocument = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async (file: any) => {
            if (!user?.id) {
                throw new Error("User ID is required");
            }
            return profileService.uploadDocument(user.id, file);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["documents", user?.id || ""],
            });
        },
    });
};

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async (documentUrl: string) => {
            if (!user?.id) {
                throw new Error("User ID is required");
            }
            return profileService.deleteDocument(user.id, documentUrl);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["documents", user?.id || ""],
            });
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