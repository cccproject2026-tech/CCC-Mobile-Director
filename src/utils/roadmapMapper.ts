import { NestedRoadmap, Roadmap, RoadmapCardData, RoadmapCardStatus } from "@/types/roadmap.types";


/**
 * Get status for card display
 * Note: Status is now properly set from progress data via useRoadmaps hook
 */
export function getCardStatus(roadmap: Roadmap | NestedRoadmap | undefined | null): RoadmapCardStatus {
    if (!roadmap) return 'initial';

    const statusMap: Record<string, RoadmapCardStatus> = {
        'not started': 'initial',
        'in-progress': 'in-progress',
        'completed': 'completed',
        'blocked': 'due',
    };

    // Check if roadmap is overdue (only for non-completed items)
    if ('endDate' in roadmap && roadmap.endDate && roadmap.status !== 'completed') {
        const endDate = new Date(roadmap.endDate);
        const now = new Date();

        if (endDate < now) {
            return 'due';
        }
    }

    return statusMap[roadmap.status] || 'initial';
}



/**
 * Get all tasks for a roadmap (nested roadmaps)
 */
export function getTasks(roadmap: Roadmap): NestedRoadmap[] {
    return (roadmap?.roadmaps || []).filter(task => task != null);
}

/**
 * Get tasks grouped by division/phase
 */
export function getTasksByDivision(roadmap: Roadmap): Record<string, NestedRoadmap[]> {
    const grouped: Record<string, NestedRoadmap[]> = {};

    roadmap?.roadmaps?.forEach(task => {
        if (!task) return;
        const division = task.phase || 'Uncategorized';
        if (!grouped[division]) {
            grouped[division] = [];
        }
        grouped[division].push(task);
    });

    return grouped;
}



/**
 * Calculate completion stats
 * Uses the actual status from progress data
 */
export function getCompletionStats(roadmap: Roadmap): { completed: number; total: number } {
    const tasks = getTasks(roadmap);
    const total = tasks.length;
    const completed = tasks.filter(task => task && task.status === 'completed').length;

    return { completed, total };
}

/**
 * Calculate completion percentage
 */
export function getCompletionPercentage(roadmap: Roadmap): number {
    const { completed, total } = getCompletionStats(roadmap);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
}

/**
 * Check if roadmap is single task
 */
export function isSingleTask(roadmap: Roadmap): boolean {
    return !roadmap?.haveNextedRoadMaps || !roadmap?.roadmaps || roadmap.roadmaps.length === 0;
}

/**
 * Get phase number from phase string
 * e.g., "Phase 1" -> 1
 */
export function getPhaseNumber(phaseString: string): number | undefined {
    if (!phaseString) return undefined;

    const match = phaseString.match(/\d+/);
    return match ? parseInt(match[0], 10) : undefined;
}


/**
 * Parse duration to months
 * Handles formats like: "1 month", "2-3 months", "4 weeks"
 */
export function parseDurationMonths(duration: string): { min: number; max: number } {
    if (!duration) return { min: 1, max: 1 };

    const match = duration.match(/(\d+)(?:\s*[-–]\s*(\d+))?\s*(month|week)/i);

    if (match) {
        const min = parseInt(match[1], 10);
        const max = match[2] ? parseInt(match[2], 10) : min;
        const unit = match[3].toLowerCase();

        if (unit === 'week') {
            return { min: Math.ceil(min / 4), max: Math.ceil(max / 4) };
        }

        return { min, max };
    }

    return { min: 1, max: 1 };
}

export function getRoadmapCard(roadmap: Roadmap): RoadmapCardData {
    if (!roadmap) {
        // Return a default card if roadmap is undefined
        return {
            _id: 'unknown',
            image: undefined,
            title: 'Unknown Roadmap',
            description: undefined,
            completionTime: 'Completion Time\nMonths 1 - 1',
            status: 'initial',
            showArrow: true,
        };
    }

    const { completed, total } = getCompletionStats(roadmap);
    const status = getCardStatus(roadmap);
    const { min, max } = parseDurationMonths(roadmap.duration || '1 month');
    const phaseNumber = isSingleTask(roadmap) ? undefined : getPhaseNumber(roadmap.phase || '');

    const allCompleted = completed === total && total > 0;
    const hasProgress = (status === 'in-progress' || status === 'due') && total > 0;

    return {
        _id: roadmap._id,
        image: roadmap.imageUrl,
        title: roadmap.name || 'Untitled Roadmap',
        description: roadmap.roadMapDetails,
        completionTime: `Completion Time\nMonths ${min}${min !== max ? ` – ${max}` : ''}`,
        status,
        completedDate: roadmap.completedOn ? formatDate(roadmap.completedOn) : undefined,
        taskProgress: hasProgress ? { completed, total } : undefined,
        showArrow: true,
        showCheckmark: allCompleted,
        phaseNumber,
    };
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}