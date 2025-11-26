export type InterestStatus = 'new' | 'pending' | 'accepted' | 'rejected';

export type InterestItem = {
    id: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    churchDetails: ChurchDetails[];
    title?: string;
    conference?: string;
    yearsInMinistry?: string;
    currentCommunityProjects?: string;
    interests: string[];
    comments?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: InterestStatus;
    profilePicture?: string;
};

export type ChurchDetails = {
    churchName?: string;
    churchPhone?: string;
    churchWebsite?: string;
    churchAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
};


export type InterestsApiResponse = {
    success: boolean;
    message: string;
    data: InterestItem[];
};

export type UpdateInterestStatusRequest = {
    status: 'accepted' | 'rejected' | 'pending';
};

export type UpdateInterestStatusResponse = {
    success: boolean;
    message: string;
    data: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
        isEmailVerified: boolean;
    };
};