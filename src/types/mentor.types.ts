import { Mentee, Mentor } from "./user.types";

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
