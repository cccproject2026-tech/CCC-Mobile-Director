import { Mentor } from "./user.types";

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