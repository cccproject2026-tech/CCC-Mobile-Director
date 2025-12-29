import { useState } from 'react';
import apiClient from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { CreateNestedRoadmapRequest } from '@/types/roadmap.types';

export interface CustomField {
    id: string;
    type: FieldType;
    parentSectionId?: string | null;
    label?: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
    [key: string]: any;
}

export interface FormData {
    churchVerbiage: string;
    descriptionVerbiage: string;
    customFields: CustomField[];
}

export interface NestedRoadmapFormData {
    name: string;
    phase?: string;
    phaseNumber?: number;
    duration?: string;
    churchVerbiage: string;
    descriptionVerbiage: string;
    customFields: CustomField[];
}

export type FieldType =
    | 'text'
    | 'textarea'
    | 'checkbox'
    | 'radio'
    | 'select'
    | 'section'
    | 'file'
    | 'date';

export const useRoadmapForm = () => {
    const [formData, setFormData] = useState<FormData>({
        churchVerbiage: '',
        descriptionVerbiage: '',
        customFields: [],
    });

    // ✅ For phase roadmaps - store multiple nested roadmaps
    const [nestedRoadmaps, setNestedRoadmaps] = useState<NestedRoadmapFormData[]>([]);

    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // ✅ Load existing roadmap data
    const loadExistingRoadmap = async (roadmapId: string) => {
        setIsLoading(true);
        try {
            const response = await apiClient.get(
                ENDPOINTS.ROADMAPS.GET_ROADMAP(roadmapId), {
                params: {
                    t: Date.now(), // cache-buster
                }
            }
            );

            const roadmap = response.data?.data;

            console.log('Loaded roadmap for editing:', { roadmap })
            if (roadmap) {
                setFormData({
                    churchVerbiage: roadmap.churchVerbiage || '',
                    descriptionVerbiage: roadmap.descriptionVerbiage || '',
                    customFields: roadmap.customFields || [],
                });

                // ✅ Load nested roadmaps if it's a phase roadmap
                if (roadmap.haveNextedRoadMaps && roadmap.roadmaps) {
                    const nested = roadmap.roadmaps.map((nr: any) => ({
                        name: nr.name || '',
                        phase: nr.phase || '',
                        phaseNumber: nr.phaseNumber || 0,
                        duration: nr.duration || '',
                        churchVerbiage: nr.churchVerbiage || '',
                        descriptionVerbiage: nr.descriptionVerbiage || '',
                        customFields: nr.customFields || [],
                    }));
                    setNestedRoadmaps(nested);
                }
            }
        } catch (error) {
            console.error('Failed to load roadmap:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Reset form data
    const resetForm = () => {
        setFormData({
            churchVerbiage: '',
            descriptionVerbiage: '',
            customFields: [],
        });
        setNestedRoadmaps([]);
        setEditingFieldId(null);
        setCurrentSectionId(null);
    };

    // ✅ Nested roadmap management
    const addNestedRoadmap = (roadmap: NestedRoadmapFormData) => {
        setNestedRoadmaps(prev => [...prev, roadmap]);
    };

    const updateNestedRoadmap = (index: number, updates: Partial<NestedRoadmapFormData>) => {
        setNestedRoadmaps(prev =>
            prev.map((nr, i) => i === index ? { ...nr, ...updates } : nr)
        );
    };

    const deleteNestedRoadmap = (index: number) => {
        setNestedRoadmaps(prev => prev.filter((_, i) => i !== index));
    };

    // Field management (existing code)
    const addField = (field: CustomField) => {
        setFormData(prev => ({
            ...prev,
            customFields: [...prev.customFields, field],
        }));
    };

    const updateField = (fieldId: string, updates: Partial<CustomField>) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields.map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
            ),
        }));
    };

    const deleteField = (fieldId: string) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields.filter(
                field => field.id !== fieldId && field.parentSectionId !== fieldId
            ),
        }));
    };

    const toggleFieldOption = (fieldId: string, option: string) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields.map(field => {
                if (field.id === fieldId && field.options) {
                    const options = field.options.includes(option)
                        ? field.options.filter(opt => opt !== option)
                        : [...field.options, option];
                    return { ...field, options };
                }
                return field;
            }),
        }));
    };

    const updateFormText = (key: keyof Pick<FormData, 'churchVerbiage' | 'descriptionVerbiage'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const isValid = () => {
        return formData.churchVerbiage.trim() !== '' &&
            formData.descriptionVerbiage.trim() !== '';
    };

    return {
        formData,
        nestedRoadmaps,
        editingFieldId,
        setEditingFieldId,
        currentSectionId,
        setCurrentSectionId,
        addField,
        updateField,
        deleteField,
        toggleFieldOption,
        updateFormText,
        isValid,
        loadExistingRoadmap,
        resetForm,
        isLoading,
        // ✅ Nested roadmap methods
        addNestedRoadmap,
        updateNestedRoadmap,
        deleteNestedRoadmap,
    };
};
