// services/roadmap.service.ts

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import {
    CreateRoadmapRequest,
    CreateRoadmapResponse,
    CreateNestedRoadmapRequest,
    CreateNestedRoadmapResponse,
    UpdateRoadmapRequest,
    UpdateRoadmapResponse,
    UpdateNestedRoadmapRequest,
    UpdateNestedRoadmapResponse,
    RoadmapApiResponse,
    SingleRoadmapApiResponse,
    Roadmap,
} from '@/types/roadmap.types';

// Helper to build FormData
const buildFormData = (formData: FormData, data: any, parentKey?: string) => {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File) && !(data instanceof Blob)) {
        Object.keys(data).forEach(key => {
            const value = data[key];
            if (value === undefined || value === null) return;

            const formKey = parentKey ? `${parentKey}[${key}]` : key;

            if (__DEV__) {
                console.log(`[buildFormData] Appending key: ${formKey}, type: ${typeof value}`);
            }

            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    const arrayKey = `${formKey}[${index}]`;
                    if (typeof item === 'object') {
                        buildFormData(formData, item, arrayKey);
                    } else {
                        formData.append(arrayKey, String(item));
                    }
                });
            } else if (typeof value === 'object') {
                buildFormData(formData, value, formKey);
            } else {
                formData.append(formKey, String(value));
            }
        });
    } else if (data !== undefined && data !== null) {
        formData.append(parentKey || '', String(data));
    }
};

export const roadmapService = {
    // ============================================
    // GET ALL ROADMAPS (Director use)
    // ============================================
    async getAllRoadmaps(): Promise<Roadmap[]> {
        const response = await apiClient.get<RoadmapApiResponse>(ENDPOINTS.ROADMAPS.GET_ALL, {
            params: { t: Date.now() },
        });
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch roadmaps');
        }
        return response.data.data;
    },

    // ============================================
    // GET ROADMAP BY ID
    // ============================================
    async getRoadmapById(roadmapId: string): Promise<Roadmap> {
        const response = await apiClient.get<SingleRoadmapApiResponse>(
            ENDPOINTS.ROADMAPS.GET_ROADMAP(roadmapId),
            { params: { t: Date.now() } }
        );
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch roadmap');
        }
        return response.data.data;
    },

    // ============================================
    // CREATE ROADMAP (Initial parent creation)
    // ============================================
    async createRoadmap(payload: CreateRoadmapRequest): Promise<CreateRoadmapResponse> {
        const formData = new FormData();

        // Handle banner image upload
        if (payload.imageUrl && !payload.imageUrl.startsWith('http')) {
            const uri = payload.imageUrl;
            const filename = uri.split('/').pop() || 'banner.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri,
                name: filename,
                type,
            } as any);
        }

        // Remove imageUrl and append rest
        const { imageUrl, ...restPayload } = payload;
        buildFormData(formData, restPayload);

        // If imageUrl is a remote URL, include it
        if (payload.imageUrl && payload.imageUrl.startsWith('http')) {
            formData.append('imageUrl', payload.imageUrl);
        }

        const response = await apiClient.post<CreateRoadmapResponse>(
            ENDPOINTS.ROADMAPS.CREATE,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to create roadmap');
        }

        return response.data;
    },

    // ============================================
    // CREATE NESTED ROADMAP (Updated to handle images)
    // ============================================
    async createNestedRoadmap(
        roadmapId: string,
        payload: CreateNestedRoadmapRequest
    ): Promise<CreateNestedRoadmapResponse> {
        const formData = new FormData();

        // 1. Handle image if present
        if (payload.imageUrl && !payload.imageUrl.startsWith('http')) {
            const uri = payload.imageUrl;
            const filename = uri.split('/').pop() || 'banner.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri,
                name: filename,
                type,
            } as any);
        }

        // 2. Build the rest of the form data
        const { imageUrl, ...restPayload } = payload;
        buildFormData(formData, restPayload);

        // 3. Keep existing URL if it's already remote
        if (payload.imageUrl && payload.imageUrl.startsWith('http')) {
            formData.append('imageUrl', payload.imageUrl);
        }

        const response = await apiClient.post<CreateNestedRoadmapResponse>(
            ENDPOINTS.ROADMAPS.CREATE_NESTED(roadmapId),
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to create nested roadmap');
        }

        return response.data;
    },

    // ============================================
    // UPDATE ROADMAP (Updated to handle nested images)
    // ============================================
    async updateRoadmap(
        roadmapId: string,
        payload: UpdateRoadmapRequest
    ): Promise<UpdateRoadmapResponse> {
        const formData = new FormData();

        /**
         * NOTE: If your backend logic for 'updateRoadmap' handles nested 
         * roadmap arrays, it must be able to parse multipart files 
         * for those nested indices. 
         */

        // If the top-level payload has an image
        if (payload.imageUrl && !payload.imageUrl.startsWith('http')) {
            const uri = payload.imageUrl;
            const filename = uri.split('/').pop() || 'banner.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri,
                name: filename,
                type,
            } as any);
        }

        buildFormData(formData, payload);
        
        const response = await apiClient.patch<UpdateRoadmapResponse>(
            ENDPOINTS.ROADMAPS.UPDATE(roadmapId),
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update roadmap');
        }

        return response.data;
    },

    // ============================================
    // UPDATE NESTED ROADMAP (Updated to handle images)
    // ============================================
    async updateNestedRoadmap(
        roadmapId: string,
        nestedRoadmapId: string,
        payload: UpdateNestedRoadmapRequest
    ): Promise<UpdateNestedRoadmapResponse> {
        const formData = new FormData();

        // 1. Handle image upload if a local URI is provided
        if (payload.imageUrl && !payload.imageUrl.startsWith('http')) {
            const uri = payload.imageUrl;
            const filename = uri.split('/').pop() || 'nested_banner.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri,
                name: filename,
                type,
            } as any);
        }

        // 2. Separate imageUrl and build the rest of the payload
        const { imageUrl, ...restPayload } = payload;
        buildFormData(formData, restPayload);

        // 3. If it's already a remote URL, append it as a string
        if (payload.imageUrl && payload.imageUrl.startsWith('http')) {
            formData.append('imageUrl', payload.imageUrl);
        }

        const response = await apiClient.patch<UpdateNestedRoadmapResponse>(
            ENDPOINTS.ROADMAPS.UPDATE_NESTED(roadmapId, nestedRoadmapId),
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update nested roadmap');
        }

        return response.data;
    },

    // ============================================
    // DELETE ROADMAP
    // ============================================
    async deleteRoadmap(roadmapId: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.delete<{ success: boolean; message: string }>(
            ENDPOINTS.ROADMAPS.DELETE_ROADMAP(roadmapId)
        );

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to delete roadmap');
        }

        return response.data;
    },
};
