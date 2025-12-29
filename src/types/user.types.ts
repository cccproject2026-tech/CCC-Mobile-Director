import { ProgressData } from "./progress.types";

// Reuse earlier types
export type UserRole =
    | "director"
    | "super admin"
    | "mentor"
    | "Pastor"
    | "Seminarian"
    | "lay leader"
    | "field_mentor";

export type UserStatus = "new" | "pending" | "accepted" | "rejected";


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

export interface Mentor extends User {
    phoneNumber?: string | null;
    assignedId?: string[];
    profileInfo?: string | null;
}


export interface Mentee extends User {
    phoneNumber?: string | null;
    hasCompleted?: boolean;
    hasIssuedCertificate?: boolean;
    scholarshipAmount?: number | null;
    dateOfApproval?: string | null;
    completedOn?: string | null;
    totalMentors?: number | null;
    lastContacted?: string | null;
    progress?: number; // 0-100
    phase?: string | null;
    phaseNumber?: number | null;
    isFieldMentor?: boolean;
    profileInfo?: string | null;
}
export interface ChurchInfo {
    id?: string;
    churchName: string;
    churchPhone?: string;
    churchAddress?: string;
    city?: string;
    state?: string;
    country?: string;
    churchWebsite?: string;
    zipCode?: string;
}

// Interest embedded on user
export interface InterestItem {
    _id: string;
    profileInfo?: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    churchDetails: ChurchInfo[];
    title: string;
    conference: string;
    yearsInMinistry: string;
    currentCommunityProjects: string;
    interests: string[];
    comments: string;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

// User returned by getMyProfile


export interface UserWithInterest extends User {
    interestId?: string;
    status: UserStatus;
    hasCompleted: boolean;
    hasIssuedCertificate: boolean;
    assignedId: string[];
    interest: InterestItem | null; // embedded interest object
}

export interface GetMyProfileResponse {
    success: boolean;
    message?: string;
    data: UserWithInterest;
}

// Combined profile for the app
export interface CombinedProfile {
    user: UserWithInterest | null;
    interest: InterestItem | null;
    progress: ProgressData | null;
}

export interface DirectorProfile {
    user: User | null;
}
// Same UpdateProfileData as before
export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    churches?: ChurchInfo[];
    title?: string;
    yearsInMinistry?: string;
    conference?: string;
    currentCommunityServiceProjects?: string;
    interests?: string[];
    comments?: string;
    bio?: string;
    avatar?: string;
}



export interface ProfileResponse {
    profile: InterestItem | null;
    message?: string;
}

export interface ChurchFormData extends Omit<ChurchInfo, 'id'> {
    id?: string;
}


export interface Document {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
}

export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    title: UserRole;
    createdBy?: string;
}


export interface CreateUserResponse {
    success: boolean;
    message: string;
    data: User;
}





// Add these new types to your existing user.types.ts

export interface DynamicFieldDefinition {
    fieldId: string;
    label: string;
    type: 'text_field' | 'phone' | 'email' | 'select' | 'checkbox' | 'text_area';
    placeholder?: string;
    required: boolean;
    options: string[];
    order: number;
    section: string;
}

export interface StaticFieldDefinition {
    fieldId: string;
    label: string;
    type: 'text_field' | 'phone' | 'email' | 'select' | 'checkbox' | 'text_area';
    required: boolean;
    section: string;
    options?: string[];
}

export interface FormFieldsData {
    staticFields: StaticFieldDefinition[];
    dynamicFields: DynamicFieldDefinition[];
}

export interface FormFieldsResponse {
    success: boolean;
    message: string;
    data: FormFieldsData;
}

// Update InterestItem to include dynamic fields
export interface InterestItem {
    _id: string;
    profileInfo?: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    churchDetails: ChurchInfo[];
    title: string;
    conference: string;
    yearsInMinistry: string;
    currentCommunityProjects: string;
    interests: string[];
    comments: string;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
    userId: string;
    dynamicFields?: Record<string, any>; // NEW: Store dynamic field values
}

// Update UpdateProfileData to handle dynamic fields
export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    churches?: ChurchInfo[];
    title?: string;
    yearsInMinistry?: string;
    conference?: string;
    currentCommunityServiceProjects?: string;
    interests?: string[];
    comments?: string;
    bio?: string;
    avatar?: string;
    dynamicFields?: Record<string, any>; // NEW: Dynamic field updates
}
