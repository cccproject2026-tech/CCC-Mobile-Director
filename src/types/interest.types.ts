export type InterestStatus = 'new' | 'pending' | 'accepted' | 'rejected';

export type ChurchDetails = {
    _id?: string;
    churchName?: string;
    churchPhone?: string;
    churchWebsite?: string;
    churchAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
};

export type InterestUser = {
    _id: string;
    role: string;
    isEmailVerified: boolean;
    roleId?: string;
};

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

    user?: InterestUser;

    profilePicture?: string;
};
