export type Director = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "director";
    roleId: string;
    status: string;
    isEmailVerified: boolean;
    hasCompleted: boolean;
    hasIssuedCertificate: boolean;
    assignedId: string[];
    createdAt: string;
    updatedAt: string;
    profileInfo?: any;
};

export type GetDirectorsResponse = {
    success: boolean;
    message: string;
    data: {
        users: Director[];
        total: number;
        page: number;
        totalPages: number;
    };
};

export type CreateDirectorRequest = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export type UpdateDirectorRequest = {
    firstName?: string;
    lastName?: string;
};

export type DirectorResponse = {
    success: boolean;
    message: string;
    data: Director;
};
