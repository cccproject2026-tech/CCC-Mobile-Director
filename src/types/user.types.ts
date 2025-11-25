export type UserRole = 'pastor' | 'mentor' | 'director' | 'pending';
export type UserStatus = 'new' | 'pending' | 'accepted' | 'rejected';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    role: UserRole;
    username?: string;
    interestId?: string;
    status: UserStatus;
    isEmailVerified?: boolean;
    profilePicture?: string;
    createdAt?: string;
    updatedAt?: string;
}

