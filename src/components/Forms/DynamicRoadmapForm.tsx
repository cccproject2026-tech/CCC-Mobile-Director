import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { RoadmapExtra } from '@/types/roadmap.types';
import DigitalSignatureInput from './inputs/DigitalSignatureInput';

export interface DynamicRoadmapFormProps {
    extras: RoadmapExtra[];
    initialValues?: Record<string, any>;
    onSubmit: (values: Record<string, any>) => void;
    submitLabel?: string;
}

/**
 * Renders roadmap extras as a fillable form. Supports SIGNATURE and can be
 * extended for TEXT_FIELD, TEXT_AREA, etc. Form values are keyed by field name.
 * Submission payload includes each field as { type, name, value }.
 */
export default function DynamicRoadmapForm({
    extras,
    initialValues = {},
    onSubmit,
    submitLabel = 'Submit',
}: DynamicRoadmapFormProps) {
    const fieldKeys = useMemo(
        () => extras.map((extra, index) => extra.name ? `${extra.name}_${index}` : `field_${index}`),
        [extras]
    );

    const [values, setValues] = useState<Record<string, any>>(() => {
        const next: Record<string, any> = { ...initialValues };
        fieldKeys.forEach((k, i) => {
            if (next[k] === undefined) next[k] = null;
        });
        return next;
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = useCallback((key: string, value: any) => {
        setValues((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
    }, []);

    const validate = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};
        extras.forEach((extra, index) => {
            const key = fieldKeys[index];
            if (extra.type === 'SIGNATURE' && extra.required) {
                const val = values[key];
                if (!val || (typeof val === 'string' && !val.trim())) {
                    newErrors[key] = 'Signature is required.';
                }
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [extras, fieldKeys, values]);

    const handleSubmit = useCallback(() => {
        if (!validate()) {
            Alert.alert('Validation Error', 'Please complete required fields. Signature is required where indicated.');
            return;
        }
        const payload: Record<string, any> = {};
        extras.forEach((extra, index) => {
            const key = fieldKeys[index];
            payload[key] = {
                type: extra.type,
                name: extra.name,
                value: values[key],
            };
        });
        onSubmit(payload);
    }, [extras, fieldKeys, values, validate, onSubmit]);

    const renderField = useCallback(
        (extra: RoadmapExtra, index: number) => {
            const key = fieldKeys[index];
            const value = values[key];
            const error = errors[key];

            switch (extra.type) {
                case 'SIGNATURE':
                    return (
                        <DigitalSignatureInput
                            key={key}
                            fieldName={extra.name}
                            placeholderText={extra.placeHolder || 'Sign here using your finger'}
                            required={!!extra.required}
                            clearButtonLabel={extra.buttonName || 'Clear'}
                            value={value}
                            onChange={(val) => updateField(key, val)}
                            error={error}
                        />
                    );
                default:
                    return null;
            }
        },
        [fieldKeys, values, errors, updateField]
    );

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {extras.map((extra, index) => renderField(extra, index))}
            </ScrollView>
            {extras.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.submitButtonText}>{submitLabel}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 24,
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 24,
    },
    submitButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
