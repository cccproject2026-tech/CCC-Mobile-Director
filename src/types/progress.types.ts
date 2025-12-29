import { ImageSourcePropType } from "react-native";

export interface NestedRoadmapProgress {
    nestedRoadmapId: string;
    completedSteps: number;
    totalSteps: number;
    progressPercentage: number;
    status: 'not_started' | 'in_progress' | 'completed';
}

export interface RoadmapProgress {
    roadMapId: string;
    completedSteps: number;
    totalSteps: number;
    progressPercentage: number;
    status: 'not_started' | 'in_progress' | 'completed';
    nestedRoadmaps?: NestedRoadmapProgress[];
}

export interface TaskStatus {
    notStarted: boolean;
    started: boolean;
    inProgress: number;
    toComplete: number;
    completed: boolean;
}


export interface AssessmentProgress {
    title: string;
    description?: string;
    image: ImageSourcePropType;
    progress: string;
    taskStatus: TaskStatus;
    dueDate?: string;
    submittedDate?: string;
    status: 'Due' | 'Completed' | 'due';
    type: 'assessment';
    completed?: string;
}

export interface ProgressData {
    overallProgress: number;
    roadmaps: {
        total: number;
        completed: number;
        percentage: number;
        items: RoadmapProgress[];
    };
    assessments: {
        total: number;
        completed: number;
        percentage: number;
        items: AssessmentProgress[];
    };
    finalComments?: FinalComment[];
}

export interface AssignRoadmapRequest {
    userIds: string[];
    roadMapIds: string[];
}

export interface AssignRoadmapResponse {
    _id: string;
    userId: string;
    roadmaps: RoadmapProgress[];
    totalRoadmaps: number;
    completedRoadmaps: number;
    overallRoadmapProgress: number;
    assessments: AssessmentProgress[];
    totalAssessments: number;
    completedAssessments: number;
    overallAssessmentProgress: number;
}

export interface AssignRoadmapApiResponse {
    success: boolean;
    message: string;
    data: AssignRoadmapResponse[];
}

export interface AssignAssessmentRequest {
    userId: string;
    assessmentId: string;
}

export interface AssignAssessmentResponse {
    _id: string;
    userId: string;
    roadmaps: RoadmapProgress[];
    totalRoadmaps: number;
    completedRoadmaps: number;
    overallRoadmapProgress: number;
    assessments: AssessmentProgress[];
    totalAssessments: number;
    completedAssessments: number;
    overallAssessmentProgress: number;
}

export interface AssignAssessmentApiResponse {
    success: boolean;
    message: string;
    data: AssignAssessmentResponse;
}

export interface FinalComment {
    _id: string;
    commentorId: string;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface AddFinalCommentRequest {
    userId: string;
    commentorId: string;
    comment: string;
}

export interface AddFinalCommentResponse {
    _id: string;
    userId: string;
    roadmaps: RoadmapProgress[];
    totalRoadmaps: number;
    completedRoadmaps: number;
    overallRoadmapProgress: number;
    assessments: AssessmentProgress[];
    totalAssessments: number;
    completedAssessments: number;
    overallAssessmentProgress: number;
    totalItems: number;
    completedItems: number;
    overallProgress: number;
    overallCompleted: boolean;
    finalComments: FinalComment[];
}

export interface AddFinalCommentApiResponse {
    success: boolean;
    message: string;
    data: AddFinalCommentResponse;
}

export interface GetFinalCommentsApiResponse {
    success: boolean;
    message: string;
    data: FinalComment[];
}

export interface UpdateFinalCommentRequest {
    userId: string;
    commentId: string;
    comment: string;
}

export interface UpdateFinalCommentApiResponse {
    success: boolean;
    message: string;
    data: AddFinalCommentResponse;
}

export interface DeleteFinalCommentRequest {
    userId: string;
    commentId: string;
}

export interface DeleteFinalCommentApiResponse {
    success: boolean;
    message: string;
    data: AddFinalCommentResponse;
}



export interface MonthlyDataItem {
    month: number;
    year: number;
    monthName: string;
    mentorsCompleted: number;
    pastorsCompleted: number;
}

export interface DirectorOverviewData {
    totalMentors: number;
    completedMentors: number;
    mentorsOverallProgress: number;
    totalPastors: number;
    completedPastors: number;
    pastorsOverallProgress: number;
    totalUsers: number;
    completedUsers: number;
    overallCombinedProgress: number;
    monthlyData: MonthlyDataItem[];
}

export interface DirectorOverviewResponse {
    success: boolean;
    message: string;
    data: DirectorOverviewData;
}