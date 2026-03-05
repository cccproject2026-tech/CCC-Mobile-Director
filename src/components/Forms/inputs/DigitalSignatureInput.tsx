import React, { useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';

export interface DigitalSignatureInputProps {
    fieldName: string;
    placeholderText?: string;
    required?: boolean;
    clearButtonLabel?: string;
    value?: string | null;
    onChange: (value: string | null) => void;
    error?: string;
}

export default function DigitalSignatureInput({
    fieldName,
    placeholderText = 'Sign here using your finger',
    required = false,
    clearButtonLabel = 'Clear',
    value,
    onChange,
    error,
}: DigitalSignatureInputProps) {
    const sigRef = useRef<any>(null);

    const handleOK = (signature: string) => {
        const dataUrl = signature.startsWith('data:') ? signature : `data:image/png;base64,${signature}`;
        onChange(dataUrl);
    };

    const handleClear = () => {
        sigRef.current?.clearSignature();
        onChange(null);
    };

    const webStyle = `
        .m-signature-pad--footer { display: none; }
        .m-signature-pad--body {
            border: 1px solid rgba(255,255,255,0.4);
            border-radius: 12px;
            background: rgba(255,255,255,0.05);
        }
        body,html { background: transparent; }
    `;

    return (
        <View style={styles.container}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{fieldName}</Text>
                {required && <Text style={styles.requiredMark}>*</Text>}
            </View>

            <View style={styles.canvasContainer}>
                <SignatureCanvas
                    ref={sigRef}
                    onOK={handleOK}
                    onEmpty={() => {}}
                    descriptionText={placeholderText}
                    clearText=""
                    confirmText=""
                    webStyle={webStyle}
                    autoClear={false}
                    dataURL={value || undefined}
                    imageType="image/png"
                    backgroundColor="transparent"
                    penColor="#ffffff"
                    style={styles.signature}
                />
            </View>

            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.7}>
                    <Text style={styles.clearButtonText}>{clearButtonLabel}</Text>
                </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    requiredMark: {
        marginLeft: 4,
        color: '#ff6b6b',
        fontSize: 15,
    },
    canvasContainer: {
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    signature: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    actionsRow: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    clearButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    clearButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    errorText: {
        marginTop: 4,
        fontSize: 12,
        color: '#ff6b6b',
    },
});
