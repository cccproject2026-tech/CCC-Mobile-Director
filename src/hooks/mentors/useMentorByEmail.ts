import { MentorDetail, mentorsService } from '@/services/mentors.service';
import { useQuery } from '@tanstack/react-query';

export const useMentorByEmail = (email: string | undefined) => {
    return useQuery<MentorDetail>({
        queryKey: ['mentor', 'email', email],
        queryFn: () => mentorsService.getMentorByEmail(email!),
        enabled: !!email,
        staleTime: 2000, // 2 seconds (was 5 minutes)
        retry: 2,
    });
};

