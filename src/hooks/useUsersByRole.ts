import { useInfiniteQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { UserRole } from "@/types/user.types";

export const useUsersByRole = (role: UserRole, limit: number = 10) => {
    return useInfiniteQuery({
        queryKey: ["users", role],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await usersService.getUsersByRole(role, pageParam, limit);
            return {
                users: res.users,
                page: res.page,
                totalPages: res.totalPages,
                total: res.total
            };
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
};
