import { API_CONFIG } from '@/config';
import { ENDPOINTS } from '@/services/api/endpoints';

const LOG_PREFIX = '[RoadmapTaskScreen]';

export type TaskScreenTab = 'response' | 'comments' | 'queries' | 'shared';

export type TaskScreenGetApi = {
    key: string;
    label: string;
    method: 'GET';
    endpoint: string;
    tab: TaskScreenTab;
    response: unknown;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
};

export type TaskScreenWriteApi = {
    key: string;
    label: string;
    method: 'POST' | 'PATCH';
    endpoint: string;
    tab: TaskScreenTab;
    description: string;
};

export function buildTaskScreenGetApis(
    roadmapId: string,
    userId: string,
    taskId: string,
    queryStatus: 'pending' | 'answered',
): Omit<TaskScreenGetApi, 'response' | 'isLoading' | 'isError' | 'error'>[] {
    return [
        {
            key: 'phaseRoadmap',
            label: 'Parent / phase roadmap',
            method: 'GET',
            endpoint: ENDPOINTS.ROADMAPS.GET_ROADMAP(roadmapId),
            tab: 'shared',
        },
        {
            key: 'nestedTask',
            label: 'Nested task template',
            method: 'GET',
            endpoint: ENDPOINTS.ROADMAPS.GET_NESTED(roadmapId, taskId),
            tab: 'shared',
        },
        {
            key: 'pastorProfile',
            label: 'Pastor profile',
            method: 'GET',
            endpoint: ENDPOINTS.USERS.GET_USER(userId),
            tab: 'shared',
        },
        {
            key: 'taskExtras',
            label: 'Task response answers (extras)',
            method: 'GET',
            endpoint: `${ENDPOINTS.ROADMAPS.GET_EXTRAS(roadmapId)}?userId=${userId}&nestedRoadMapItemId=${taskId}`,
            tab: 'response',
        },
        {
            key: 'taskDocuments',
            label: 'Task uploaded documents',
            method: 'GET',
            endpoint: `${ENDPOINTS.ROADMAPS.GET_EXTRAS_DOCUMENTS(roadmapId)}?userId=${userId}&nestedRoadMapItemId=${taskId}`,
            tab: 'response',
        },
        {
            key: 'comments',
            label: 'Roadmap comments',
            method: 'GET',
            endpoint: ENDPOINTS.ROADMAPS.GET_COMMENTS(roadmapId, userId),
            tab: 'comments',
        },
        {
            key: 'queries',
            label: `Task queries (${queryStatus})`,
            method: 'GET',
            endpoint: `${ENDPOINTS.ROADMAPS.GET_QUERIES(roadmapId, userId)}&status=${queryStatus}&nestedRoadMapItemId=${taskId}`,
            tab: 'queries',
        },
    ];
}

export function buildTaskScreenWriteApis(
    roadmapId: string,
    queryId = '{queryId}',
): TaskScreenWriteApi[] {
    return [
        {
            key: 'addComment',
            label: 'Add comment',
            method: 'POST',
            endpoint: ENDPOINTS.ROADMAPS.ADD_COMMENT(roadmapId),
            tab: 'comments',
            description: 'Triggered when sending a comment from Comments tab',
        },
        {
            key: 'replyQuery',
            label: 'Reply to query',
            method: 'PATCH',
            endpoint: ENDPOINTS.ROADMAPS.REPLY_QUERY(roadmapId, queryId),
            tab: 'queries',
            description: 'Triggered when replying to a pending query from Queries tab',
        },
    ];
}

function getLogLabel(key: string): string {
    switch (key) {
        case 'comments':
            return 'comments';
        case 'queries':
            return 'queries';
        case 'taskExtras':
            return 'response extras';
        case 'taskDocuments':
            return 'response documents';
        case 'nestedTask':
            return 'task';
        case 'phaseRoadmap':
            return 'roadmap';
        case 'pastorProfile':
            return 'profile';
        default:
            return key;
    }
}

export function logTaskScreenGetApis(calls: TaskScreenGetApi[]) {
    const completed = calls.filter((call) => !call.isLoading);
    if (completed.length === 0) return;

    console.log(`${LOG_PREFIX} ========== GET APIs (${completed.length}/${calls.length} loaded) ==========`);

    completed.forEach((call) => {
        const label = getLogLabel(call.key);
        console.log(`${LOG_PREFIX} ${label}: endpoint ${call.method} ${call.endpoint}`);
        if (call.isError) {
            console.log(`${LOG_PREFIX} ${label}: error`, call.error);
        } else {
            console.log(`${LOG_PREFIX} ${label}: response`, call.response);
        }
    });

    if (completed.length === calls.length) {
        console.log(`${LOG_PREFIX} Total GET endpoints on this screen: ${calls.length}`);
    }
}

export function logTaskScreenWriteApis(apis: TaskScreenWriteApi[]) {
    console.log(`${LOG_PREFIX} ========== Write APIs available on this screen ==========`);
    console.log(`${LOG_PREFIX} Total POST/PATCH endpoints: ${apis.length}`);
    apis.forEach((api) => {
        const label = getLogLabel(api.key);
        console.log(`${LOG_PREFIX} ${label}: endpoint ${api.method} ${api.endpoint}`);
        console.log(`${LOG_PREFIX} ${label}: note ${api.description}`);
    });
}

export function logTaskScreenWriteRequest(
    api: TaskScreenWriteApi,
    payload: unknown,
    response?: unknown,
) {
    const label = getLogLabel(api.key);
    console.log(`${LOG_PREFIX} ${label}: endpoint ${api.method} ${api.endpoint}`);
    console.log(`${LOG_PREFIX} ${label}: payload`, payload);
    if (response !== undefined) {
        console.log(`${LOG_PREFIX} ${label}: response`, response);
    }
}

export function logQueriesGetResponse(
    roadmapId: string,
    userId: string,
    status: 'pending' | 'answered',
    taskId: string | undefined,
    rawResponse: unknown,
    unwrappedQueries: unknown[],
) {
    const path = `/roadmaps/pastor/${roadmapId}/queries`;
    const queryString = [
        `userId=${userId}`,
        `status=${status}`,
        ...(taskId ? [`nestedRoadMapItemId=${taskId}`] : []),
    ].join('&');
    const fullUrl = `${API_CONFIG.BASE_URL}${path}?${queryString}`;

    console.log(`${LOG_PREFIX} ========== GET queries (debug) ==========`);
    console.log(`${LOG_PREFIX} queries: full URL GET ${fullUrl}`);
    console.log(`${LOG_PREFIX} queries: path ${path}`);
    console.log(`${LOG_PREFIX} queries: base URL ${API_CONFIG.BASE_URL}`);
    console.log(`${LOG_PREFIX} queries: raw API response`, rawResponse);
    console.log(`${LOG_PREFIX} queries: unwrapped count`, unwrappedQueries.length);
    console.log(`${LOG_PREFIX} queries: unwrapped list`, unwrappedQueries);
}
