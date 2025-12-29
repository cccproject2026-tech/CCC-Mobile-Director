import { Mentee } from "./user.types";

export interface MenteeResponse {
    success: boolean;
    message: string;
    data: {
        users: Mentee[];
        total: number;
        page: number;
        totalPages: number;
    };
}