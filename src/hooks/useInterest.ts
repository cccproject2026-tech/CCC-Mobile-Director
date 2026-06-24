import { interestService } from "@/services/interest.service";
import { BackendStaticField, DynamicFieldRequest, FormField, FormSection, UpdateInterestStatusResponse } from "@/types/interest.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to fetch all interests.
 */

export const interestFormKeys = {
    config: ["interestForm", "config"] as const,
};

export const useInterests = () => {
    return useQuery({
        queryKey: ['interests'],
        queryFn: () => interestService.getAll(),
        staleTime: 0,
        refetchOnMount: 'always'
    });
};


/**
 * Hook to update interest status.
 */

export function useUpdateInterestStatus() {
    const queryClient = useQueryClient();

    return useMutation<UpdateInterestStatusResponse, Error, { interestId: string; status: 'accepted' | 'rejected' | 'pending' }>({
        mutationFn: ({ interestId, status }) =>
            interestService.updateStatus(interestId, status),
        onSuccess: () => {
            // Invalidate interests list to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['interests'] });
        },
    });
}

export function useDeleteInterest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (interestId: string) => interestService.deleteById(interestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interests'] });
        },
    });
}

export const useInterestFormConfig = () => {
    return useQuery({
        queryKey: interestFormKeys.config,
        queryFn: async () => {
            console.log("[useInterestFormConfig] fetching config");
            const data = await interestService.getFormConfig();
            console.log("[useInterestFormConfig] received:", data);
            return data; // 🔹 MUST return
        },
    });
};




export const mapBackendToSections = (
    staticFields: BackendStaticField[],
): { sections: FormSection[]; initialValues: Record<string, string | boolean> } => {
    const sectionMap = new Map<string, FormSection>();
    const initialValues: Record<string, string | boolean> = {};

    staticFields.forEach((field) => {
        if (!sectionMap.has(field.section)) {
            sectionMap.set(field.section, {
                id: `section_${field.section.replace(/\s+/g, '_').toLowerCase()}`,
                title: field.section === 'Church Details'
                    ? 'Current Church Information'
                    : field.section === 'Ministry Information'
                        ? 'Other Information'
                        : field.section,
                fields: [],
                showAddMoreButton: field.section === 'Church Details',
            });
        }

        const section = sectionMap.get(field.section)!;

        let type: FormField['type'] = 'text';
        let keyboardType: FormField['keyboardType'] | undefined;
        let width: FormField['width'] = 'full';

        switch (field.type) {
            case 'text_field':
                type = 'text';
                keyboardType = 'default';
                break;
            case 'email':
                type = 'text';
                keyboardType = 'email-address';
                break;
            case 'phone':
                type = 'text';
                keyboardType = 'phone-pad';
                break;
            case 'text_area':
                type = 'textarea';
                break;
            case 'select':
                type = 'dropdown';
                break;
            case 'checkbox':
                type = 'checkbox';
                break;
        }

        // 🔹 Layout tweaks to match the screenshot
        if (
            ['firstName', 'lastName', 'phoneNumber', 'email',
                'churchDetails.churchPhone', 'churchDetails.churchWebsite',
                'yearsInMinistry', 'conference'].includes(field.fieldId)
        ) {
            width = 'half';
        }

        const options = field.type === 'select' ? field.options || [] : undefined;

        const id = field.fieldId;

        const formField: FormField = {
            id,
            type,
            label: field.label,
            placeholder:
                type === 'checkbox' ? '' :
                    type === 'dropdown' ? field.label :
                        field.label,
            defaultValue:
                type === 'checkbox' ? false
                    : type === 'dropdown' && options && options.length > 0
                        ? '' // start empty so it shows label only
                        : '',
            width,
            required: field.required,
            keyboardType,
            options,
            isStatic: true,            // 🔹 mark as static
        };

        section.fields.push(formField);
        initialValues[id] = formField.defaultValue;
    });

    return {
        sections: Array.from(sectionMap.values()),
        initialValues,
    };
};

export const useAddDynamicField = () => {
    return useMutation({
        mutationFn: (payload: DynamicFieldRequest) =>
            interestService.addDynamicField(payload),
    });
};

export const useRemoveDynamicField = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (fieldId: string) =>
            interestService.removeDynamicField(fieldId),
        onSuccess: () => {
            // Invalidate form config to refetch updated data
            queryClient.invalidateQueries({ queryKey: interestFormKeys.config });
        },
    });
}

export const useDeleteDynamicSection = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (fieldIds: string[]) => {
            // Delete all fields in the section
            const deletePromises = fieldIds.map(fieldId =>
                interestService.removeDynamicField(fieldId)
            );
            return Promise.all(deletePromises);
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: interestFormKeys.config });
        },
    });
};