export interface GrantField {
    label: string;
    type: 'text' | 'textarea' | 'file' | 'checkbox' | 'select' | 'radio';
    required: boolean;
    options: string[];
    _id: string;
}

export interface GrantFormData {
    _id: string;
    title: string;
    description: string;
    fields: GrantField[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface GrantFormResponse {
    success: boolean;
    message: string;
    data: GrantFormData;
}

export interface GrantApplicationData {
    [key: string]: string | string[] | null;
}

export interface GrantSubmissionPayload {
    userId: string;
    answers: GrantApplicationData;
    supportingDoc: string;
}

export interface GrantSubmissionResponse {
    success: boolean;
    message: string;
    data?: {
        _id: string;
        userId: string;
        answers: GrantApplicationData;
        supportingDoc: string;
        status: 'pending' | 'approved' | 'rejected' | 'under_review';
        createdAt: string;
        updatedAt: string;
    };
}

export interface UseGrantState {
    form: GrantFormResponse | null;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    success: boolean;
}

export interface MicrograntApplication {
    _id: string;
    userId: {
        _id: string;
        email: string;
    } | null;
    formId: {
        _id: string;
        title: string;
    };
    answers: GrantApplicationData;
    supportingDoc: string;
    status: 'new' | 'pending' | 'approved' | 'rejected' | 'under_review';
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface MicrograntApplicationsApiResponse {
    success: boolean;
    message: string;
    data: MicrograntApplication[];
}

export interface ApplicationWithProfile extends MicrograntApplication {
    userProfile?: {
        firstName: string;
        lastName: string;
        profilePicture?: string;
        role: string;
    };
}
export interface MicrograntApplicationDetail {
    userId: {
        _id: string;
        email: string;
        role: string;
    };
    application: {
        _id: string;
        userId: string;
        formId: {
            _id: string;
            title: string;
            description: string;
        };
        answers: GrantApplicationData;
        supportingDoc: string;
        status: 'new' | 'pending' | 'approved' | 'rejected' | 'under_review';
        createdAt: string;
        updatedAt: string;
        __v: number;
    };
}

export interface MicrograntApplicationDetailApiResponse {
    success: boolean;
    message: string;
    data: MicrograntApplicationDetail;
}

export interface GrantStatusResponse {
    success: boolean;
    message: string;
    data: {
        applicationId: string;
        status: 'new' | 'pending' | 'approved' | 'rejected' | 'under_review';
        submittedAt: string;
        lastUpdated: string;
    };
}

export interface CheckApplicationResponse {
    success: boolean;
    message: string;
    data: {
        applied: boolean;
        status: 'pending' | 'approved' | 'rejected' | 'under_review';
        applicationId: string;
    };
}