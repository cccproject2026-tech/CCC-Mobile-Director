import { mentorsService } from '@/services/mentors.service';
import { MentorListItem } from '@/types/mentors.types';
import { useQuery } from '@tanstack/react-query';

// Transformed mentor type that matches component expectations
export interface Mentor {
    id: string;
    name: string;
    role: string;
    phoneNumber?: string;
    description?: string;
    email?: string;
    username?: string;
    menteesCount?: number;
    /** Prefer this for UI components that expect assigned-mentor-shaped objects */
    profilePicture?: string;
    profileImage?: string;
    status: string;
    isEmailVerified: boolean;
    hasCompleted: boolean;
    hasIssuedCertificate: boolean;
    createdAt: string;
    updatedAt: string;
}

// Transform API response to match component expectations
const transformMentor = (mentor: MentorListItem): Mentor => {
    return {
        id: mentor.id,
        name: `${mentor.firstName} ${mentor.lastName || ''}`.trim(),
        role: mentor.role,
        email: mentor.email,
        username: mentor.username,
        // Keep both keys in sync: UI components historically used `profilePicture`,
        // while this hook previously exposed only `profileImage`.
        profilePicture: mentor.profilePicture,
        profileImage: mentor.profilePicture,
        phoneNumber: mentor.phoneNumber,
        status: mentor.status,
        isEmailVerified: mentor.isEmailVerified ?? false,
        hasCompleted: mentor.hasCompleted,
        hasIssuedCertificate: mentor.hasIssuedCertificate,
        createdAt: mentor.createdAt ?? '',
        updatedAt: mentor.updatedAt ?? '',
        description: undefined, // API doesn't provide description
        menteesCount: undefined, // API doesn't provide menteesCount
    };
};

export const useMentors = () => {
    const query = useQuery({
        queryKey: ['mentors'],
        queryFn: () => mentorsService.getMentors(),
        staleTime: 2000, // 2 seconds (was 5 minutes)
        retry: 2,
    });

    // Transform the data
    const transformedData = query.data && query.data.mentors && Array.isArray(query.data.mentors)
        ? {
            mentors: query.data.mentors.map(transformMentor),
            total: query.data.total ?? 0,
        }
        : undefined;

    return {
        ...query,
        data: transformedData,
        mentors: transformedData?.mentors ?? [],
        total: transformedData?.total ?? 0,
    };
};
