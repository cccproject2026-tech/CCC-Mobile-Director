// src/types/scholarship.types.ts
import type { UserStatus, UserRole, User } from "@/types/user.types";

export type ScholarshipStatus = "active" | "inactive";

export interface Scholarship {
    id: string;
    type: string;              // e.g. "Full scholarship"
    amount: number;            // 50000 etc.
    description: string;
    status: ScholarshipStatus;
    awardedList: AwardedUser[] | string[]; // backend may start with just userIds
    numberOfAwards: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}

// Awarded user entry for a scholarship
export interface AwardedUser {
    userId: string;            // MongoId of user
    awardedDate: string;       // ISO
    notes?: string;
    academicYear?: string;
    awardStatus?: "active" | "inactive";
}

// If backend later sends populated user details:
export interface PopulatedAwardedUser extends AwardedUser {
    user?: User;
}
