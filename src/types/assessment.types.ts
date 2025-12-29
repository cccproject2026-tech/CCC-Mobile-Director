// ==================== Frontend Types ====================
export interface Assessment {
    id: string;
    type: 'CMA' | 'PMP';
    title: string;
    description: string;
    status: 'Due' | 'Not Started' | 'Submitted' | 'Completed';
    dueDate?: string;
    completionDate?: string;
    meetingDate?: string;
    guidelines: string[];
    preSurvey?: PreSurveyQuestion[];
    sections: AssessmentSection[];
    completedOn?: string;
}

export interface PreSurveyQuestion {
    id: string;
    _id?: string;
    text: string;
    type: 'number' | 'text';
    placeholder?: string;
    required?: boolean;
}

export interface AssessmentSection {
    title: string;
    subtitle?: string;
    questionGroups: QuestionGroup[];
}

export interface QuestionGroup {
    id: string;
    groupTitle?: string;
    questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
    id: string;
    text: string;
    type: 'radio' | 'checkbox' | 'text' | 'number';
    options?: { label: string; value: string }[];
    required?: boolean;
}

// ==================== API Response Types ====================
export interface ApiAssessmentChoice {
    text: string;
    _id: string;
}

export interface ApiAssessmentLayer {
    title: string;
    choices: ApiAssessmentChoice[];
    _id: string;
}

export interface ApiAssessmentSection {
    title: string;
    description: string;
    layers: ApiAssessmentLayer[];
    _id: string;
}

export interface ApiAssessmentAssignment {
    userId: string;
    assignedAt: string;
    status: string;
    _id: string;
}

export interface ApiAssessment {
    _id: string;
    name: string;
    description: string;
    type?: 'CMA' | 'PMP'; // Optional since backend doesn't always return it
    instructions: string[];
    sections: ApiAssessmentSection[];
    preSurvey?: PreSurveyQuestion[];
    assignments: ApiAssessmentAssignment[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

// ==================== API Request Types ====================
export interface CreateAssessmentChoice {
    text: string;
}

export interface CreateAssessmentLayer {
    title: string;
    choices: CreateAssessmentChoice[];
}

export interface CreateAssessmentSection {
    title: string;
    description: string;
    layers: CreateAssessmentLayer[];
}

export interface CreateAssessmentRequest {
    name: string;
    description: string;
    type: 'CMA' | 'PMP';
    instructions: string[];
    sections: CreateAssessmentSection[];
    preSurvey?: PreSurveyQuestion[];
}

// ==================== Assessment Response ====================
export interface AssessmentResponse {
    assessmentId: string;
    assessmentType: 'CMA' | 'PMP';
    assessmentTitle: string;
    preSurveyAnswers?: Record<string, string>;
    sectionAnswers: Record<string, any>;
    completedAt?: string;
    status: 'Due' | 'Not Started' | 'Submitted' | 'Completed';
    currentSectionIndex: number;
    meetingDate?: string;
}

export interface SubmitPreSurveyPayload {
    userId: string;
    preSurveyAnswers: Array<{
        questionText: string;
        answer: string | number;
    }>;
}

export interface SubmitAnswersPayload {
    userId: string;
    answers: Array<{
        sectionId: string;
        layers: Array<{
            layerId: string;
            selectedChoice: string; // This will be the choice ID
        }>;
    }>;
}


// ==================== Assessment Response ====================
export interface AssessmentResponse {
    assessmentId: string;
    assessmentType: 'CMA' | 'PMP';
    assessmentTitle: string;
    preSurveyAnswers?: Record<string, string>;
    sectionAnswers: Record<string, any>;
    completedAt?: string;
    status: 'Due' | 'Not Started' | 'Submitted' | 'Completed';
    currentSectionIndex: number;
    meetingDate?: string;
}

export interface SubmitPreSurveyPayload {
    userId: string;
    preSurveyAnswers: Array<{
        questionText: string;
        answer: string | number;
    }>;
}

export interface SubmitAnswersPayload {
    userId: string;
    answers: Array<{
        sectionId: string;
        layers: Array<{
            layerId: string;
            selectedChoice: string;
        }>;
    }>;
}

// ==================== Submitted Answers Response ====================
export interface SubmittedAnswersResponse {
    _id: string;
    assessmentId: string;
    userId: string;
    preSurveyAnswers?: Array<{
        questionText: string;
        answer: string;
        _id: string;
    }>;
    preSurveySubmittedAt?: string;
    sections: Array<{
        sectionId: string;
        layers: Array<{
            layerId: string;
            selectedChoice: string;
            answeredAt: string;
            _id: string;
        }>;
        _id: string;
    }>;
    createdAt: string;
}
