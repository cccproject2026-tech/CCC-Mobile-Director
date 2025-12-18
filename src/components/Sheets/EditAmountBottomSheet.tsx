import { ForwardedRef, forwardRef } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';

interface EditAmountBottomSheetProps {
    title?: string;
    amount: string;
    onChangeAmount: (value: string) => void;
    onCancel: () => void;
    onSave: () => void;
}

function EditAmountBottomSheetInner(
    { title, amount, onChangeAmount, onCancel, onSave }: EditAmountBottomSheetProps,
    ref: ForwardedRef<BottomSheetModal>
) {
    return (
        <BottomSheetModal
            ref={ref}
            snapPoints={['45%']}
            enableDynamicSizing={false}
            backgroundStyle={{
                backgroundColor: '#1A4882',
            }}
            handleIndicatorStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
            }}
        >
            <LinearGradient
                colors={['#264387', '#1D548D', '#176192']}
                style={{ flex: 1, borderRadius: 16, padding: 20 }}
            >
                <BottomSheetView style={{ flex: 1, padding: 20 }}>
                    {/* Header */}
                    <View
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 30,
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: '600',
                                color: '#fff',
                                textAlign: 'center',
                            }}
                        >
                            {title}
                        </Text>
                    </View>

                    {/* Input Section */}
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '600',
                            color: '#fff',
                            marginBottom: 16,
                        }}
                    >
                        Enter Amount of Scholarship
                    </Text>

                    <View
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            marginBottom: 40,
                        }}
                    >
                        <TextInput
                            style={{
                                fontSize: 24,
                                fontWeight: '600',
                                color: '#FFC107',
                                padding: 20,
                            }}
                            value={`$ ${amount}`}
                            onChangeText={(text) => {
                                const numericValue = text.replace(/[^0-9]/g, '');
                                onChangeAmount(numericValue);
                            }}
                            keyboardType="numeric"
                            placeholder="$ 1500"
                            placeholderTextColor="rgba(255, 193, 7, 0.5)"
                        />
                    </View>

                    {/* Buttons */}
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: 16,
                            marginTop: 'auto',
                        }}
                    >
                        <TouchableOpacity
                            onPress={onCancel}
                            style={{
                                flex: 1,
                                backgroundColor: '#fff',
                                paddingVertical: 16,
                                borderRadius: 12,
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: '600',
                                    color: '#1A4882',
                                }}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onSave}
                            style={{
                                flex: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                paddingVertical: 16,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: '600',
                                    color: '#fff',
                                }}
                            >
                                Save Changes
                            </Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </LinearGradient>
        </BottomSheetModal>
    );
}

const EditAmountBottomSheet = forwardRef<BottomSheetModal, EditAmountBottomSheetProps>(
    EditAmountBottomSheetInner
);

export default EditAmountBottomSheet;
