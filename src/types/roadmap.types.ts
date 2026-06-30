// types/roadmap.types.ts

export type RoadmapStatus = 'not started' | 'in progress' | 'completed';
export type RoadmapType = 'single' | 'phase';

export interface RoadmapExtra {
    type: 'TEXT_FIELD' | 'TEXT_AREA' | 'CHECKBOX' | 'DATE_PICKER' | 'UPLOAD' | 'ASSESSMENT' | 'SECTION' | 'TEXT_DISPLAY' | 'BUTTON' | 'SIGNATURE';
    name: string;
    placeHolder?: string;
    buttonName?: string;
    haveButton?: boolean;
    date?: string;
    checkboxes?: RoadmapExtra[];
    sections?: RoadmapExtra[];
    assessmentId?: string;
    required?: boolean;
    showOnCard?: boolean;
    linkUrl?: string
}

export interface NestedRoadmap {
    _id: string;
    name: string;
    roadMapDetails?: string;
    description?: string;
    duration: string;
    imageUrl?: string;
    phase?: string;
    status: RoadmapStatus;
    totalSteps?: number;
    extras?: RoadmapExtra[];
    meetings?: any[];
}

export interface Roadmap {
    _id: string;
    name: string;
    type: RoadmapType;
    roadMapDetails?: string;
    description?: string;
    duration: string;
    imageUrl?: string;
    divisions?: string[];
    phase?: string;
    status: RoadmapStatus;
    completedOn?: string;
    totalSteps?: number;
    haveNextedRoadMaps: boolean;
    roadmaps: NestedRoadmap[];
    extras?: RoadmapExtra[];
    createdAt: string;
    updatedAt: string;
}

// API Response Types
export interface RoadmapApiResponse {
    success: boolean;
    message: string;
    data: Roadmap[];
}

export interface SingleRoadmapApiResponse {
    success: boolean;
    message: string;
    data: Roadmap;
}

// Create Roadmap
export interface CreateRoadmapRequest {
    type: RoadmapType;
    name: string;
    roadMapDetails?: string;
    description?: string;
    duration: string;
    imageUrl?: string;
    divisions: string[];
    phase?: string;
    totalSteps?: number;
}

export interface CreateRoadmapResponse {
    success: boolean;
    message: string;
    data: Roadmap;
}

// Create Nested Roadmap
export interface CreateNestedRoadmapRequest {
    name: string;
    roadMapDetails?: string;
    description?: string;
    duration: string;
    imageUrl?: string;
    phase?: string;
    status?: RoadmapStatus;
    extras?: RoadmapExtra[];
}

export interface CreateNestedRoadmapResponse {
    success: boolean;
    message: string;
    data: NestedRoadmap;
}

// Update Roadmap
export interface UpdateRoadmapRequest {
    name?: string;
    roadMapDetails?: string;
    description?: string;
    duration?: string;
    imageUrl?: string;
    divisions?: string[];
    phase?: string;
    totalSteps?: number;
    roadmaps?: Partial<NestedRoadmap>[];
}

export interface UpdateRoadmapResponse {
    success: boolean;
    message: string;
    data: Roadmap;
}

// Update Nested Roadmap
export interface UpdateNestedRoadmapRequest {
    name?: string;
    roadMapDetails?: string;
    description?: string;
    duration?: string;
    imageUrl?: string;
    phase?: string;
    status?: RoadmapStatus;
    extras?: RoadmapExtra[];
}

export interface UpdateNestedRoadmapResponse {
    success: boolean;
    message: string;
    data: NestedRoadmap;
}




export type RoadmapCardStatus = 'initial' | 'in-progress' | 'completed' | 'due';

export interface RoadmapCardData {
    _id: string;
    image?: string | number;
    title: string;
    description?: string;
    completionTime?: string;
    status?: RoadmapCardStatus;
    completedDate?: string;
    taskProgress?: {
        completed: number;
        total: number;
    };
    showArrow?: boolean;
    showCheckmark?: boolean;
    phaseNumber?: number;
}

export interface DatePickerField {
    id: string;
    type: 'datepicker';
    label: string;
    date?: Date | string; // ✅ Optional, can be Date or ISO string
    buttonName?: string;
    allowPastorSelect?: boolean;
    showOnCard?: boolean;
}

export interface AssessmentField {
    id: string;
    type: 'assessment';
    selectedAssessment?: string;
    assessmentId?: string;
    buttonName?: string;
    scheduleMeeting?: boolean;
}

// ─── Task runtime (comments, queries, extras) ───────────────────────────────

export interface RoadmapComment {
    _id: string;
    text: string;
    addedDate: string;
    nestedRoadMapItemId?: string | null;
    taskId?: string | null;
    mentorId?: {
        _id?: string;
        firstName?: string;
        lastName?: string;
        profilePicture?: string;
        role?: string;
    };
}

export interface RoadmapQuery {
    _id: string;
    actualQueryText: string;
    createdDate?: string;
    status?: 'pending' | 'answered';
    repliedAnswer?: string;
    repliedDate?: string;
    nestedRoadMapItemId?: string;
    repliedMentorId?: {
        _id?: string;
        firstName?: string;
        lastName?: string;
        profilePicture?: string;
        role?: string;
    };
}

export interface RoadmapExtraAnswer {
    type?: string;
    name?: string;
    key?: string;
    value?: unknown;
    signatureData?: string;
}

export interface RoadmapExtrasDocumentFile {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
}

export interface RoadmapExtrasDocument {
    uploadBatchId: string;
    uploadedAt: string;
    name?: string;
    files: RoadmapExtrasDocumentFile[];
}

export interface AddRoadmapCommentPayload {
    text: string;
    userId: string;
    mentorId: string;
    nestedRoadMapItemId?: string;
    taskId?: string;
}

export interface CreateRoadmapQueryPayload {
    actualQueryText: string;
    userId: string;
    nestedRoadMapItemId?: string;
}

export interface ReplyRoadmapQueryPayload {
    repliedAnswer: string;
    repliedMentorId: string;
}