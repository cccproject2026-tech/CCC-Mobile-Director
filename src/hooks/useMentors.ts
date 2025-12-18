import { useQuery } from "@tanstack/react-query";
import { Mentor } from "@/types/user.types";
import { mentorsService } from "@/services/mentors.service";

export const useMentors = () => {
    const query = useQuery({
        queryKey: ["mentors"],
        queryFn: async () => {
            const res = await mentorsService.getMentors();
            return res.data.users as Mentor[];
        }
    });

    return {
        mentors: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch
    };
};
