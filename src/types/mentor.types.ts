import { Mentee, Mentor } from "./user.types";

export interface AssignedMentorItem {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    profilePicture?: string;
    profileInfo?: string;
}

export interface GetAssignedMentorsApiResponse {
    success: boolean;
    message: string;
    data: AssignedMentorItem[];
}

export interface MentorsResponse {
    success: boolean;
    message: string;
    data: {
        users: Mentor[];
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface AssignPayload {
    mentorId: string;
    menteeIds: string[];
}

export interface MentorMenteesResult {
    mentor: Mentor | null;
    mentees: Mentee[];
    isLoading: boolean;
    isError: boolean;
    error: unknown;
}
