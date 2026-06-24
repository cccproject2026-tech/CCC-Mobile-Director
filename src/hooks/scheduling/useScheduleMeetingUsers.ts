import { menteesService } from '@/services/mentee.service';
import { mentorsService } from '@/services/mentors.service';
import { Mentor } from '@/types/user.types';
import { useQuery } from '@tanstack/react-query';

const SCHEDULE_USER_LIMIT = 9999;

export function useSchedulePastors(enabled: boolean) {
    return useQuery({
        queryKey: ['schedule-meeting', 'pastors'],
        queryFn: async () => {
            const res = await menteesService.getMentees(1, SCHEDULE_USER_LIMIT);
            return res.data.users ?? [];
        },
        enabled,
        staleTime: 60_000,
        retry: 1,
    });
}

export function useScheduleMentorsList(enabled: boolean) {
    return useQuery({
        queryKey: ['schedule-meeting', 'mentors-list'],
        queryFn: async () => {
            const res = await mentorsService.getMentors(1, SCHEDULE_USER_LIMIT);
            return (res.data.users ?? []) as Mentor[];
        },
        enabled,
        staleTime: 60_000,
        retry: 1,
    });
}
