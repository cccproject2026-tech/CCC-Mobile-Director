import type {
    ApiAssessment,
    ApiAssessmentSection,
    Assessment,
    AssessmentSection,
    PreSurveyQuestion,
} from '@/types/assessment.types';

export function mapApiToFrontend(apiAssessment: ApiAssessment): Assessment {
    let assessmentType: 'CMA' | 'PMP' = 'PMP';

    if (apiAssessment.type) {
        assessmentType = apiAssessment.type;
    } else if (apiAssessment.preSurvey && apiAssessment.preSurvey.length > 0) {
        assessmentType = 'CMA';
    }

    return {
        id: apiAssessment._id,
        type: assessmentType,
        title: apiAssessment.name,
        description: apiAssessment.description,
        status: determineStatus(apiAssessment),
        guidelines: apiAssessment.instructions || [],
        preSurvey: apiAssessment.preSurvey?.map(mapPreSurveyQuestion),
        sections: apiAssessment.sections?.map(mapApiSection) || [],
        completedOn: apiAssessment.updatedAt,
    };
}

/**
 * Map API section to frontend section
 * Each layer becomes a question group
 * Each choice becomes a separate checkbox question
 */
function mapApiSection(apiSection: ApiAssessmentSection): AssessmentSection {
    return {
        title: apiSection.title,
        subtitle: apiSection.description,
        questionGroups: apiSection.layers.map(layer => ({
            id: layer._id,
            groupTitle: layer.title, // "Group 1", "Group 2", etc.
            questions: layer.choices.map(choice => ({
                id: choice._id,
                text: choice.text,
                type: 'checkbox' as const,
                required: false,
            })),
        })),
    };
}

function mapPreSurveyQuestion(q: PreSurveyQuestion): PreSurveyQuestion {
    return {
        id: q._id || q.id || '',
        _id: q._id,
        text: q.text,
        type: q.type,
        placeholder: q.placeholder,
        required: q.required,
    };
}

function determineStatus(apiAssessment: ApiAssessment): Assessment['status'] {
    if (!apiAssessment.assignments || apiAssessment.assignments.length === 0) {
        return 'Not Started';
    }

    const latestAssignment = apiAssessment.assignments[0];
    const status = latestAssignment.status.toLowerCase();

    switch (status) {
        case 'completed':
            return 'Completed';
        case 'submitted':
            return 'Submitted';
        case 'due':
            return 'Due';
        default:
            return 'Not Started';
    }
}
