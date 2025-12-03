import { useCreateDirector, useDirectorById, useUpdateDirector } from "@/hooks/useDirectors";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type CreateEditDirectorSheetProps = {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    directorId?: string | null;
};

export default function CreateEditDirectorSheet({ sheetRef, directorId }: CreateEditDirectorSheetProps) {
    const { mutate: createDirector } = useCreateDirector();
    const { mutate: updateDirector } = useUpdateDirector();

    const snapPoints = ["50%"] // OPEN AT 50%

    const { data: director } = useDirectorById(directorId ?? undefined);

    const [firstName, setFirst] = useState("");
    const [lastName, setLast] = useState("");
    const [email, setEmail] = useState("");

    const handleClose = () => {
        setFirst("");
        setLast("");
        setEmail("");
    }
    useEffect(() => {
        if (directorId && director) {
            setFirst(director.firstName);
            setLast(director.lastName);
            setEmail(director.email);
        } else {
            setFirst("");
            setLast("");
            setEmail("");
        }
    }, [directorId, director]);

    const isEdit = !!directorId;

    const handleSave = () => {
        if (isEdit) {
            updateDirector(
                { id: directorId!, payload: { firstName, lastName } },
                { onSuccess: () => sheetRef.current?.close() }
            );
        } else {
            createDirector(
                { firstName, lastName, email, password: "DirectorPass123!" },
                { onSuccess: () => sheetRef.current?.close() }
            );
        }
    };

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
                pressBehavior={'close'}
            />
        ),
        []
    );
    return (
        <BottomSheetModal
            ref={sheetRef}
            snapPoints={snapPoints}
            index={0}
            detached={true}    // <<< IMPORTANT
            style={{ marginHorizontal: 0 }}
            containerStyle={{ flex: 1 }}  // <<< ALSO IMPORTANT
            backgroundComponent={() => null}
            handleIndicatorStyle={{ display: "none" }}
            backdropComponent={renderBackdrop}
            enablePanDownToClose
            enableDynamicSizing={false}
            onDismiss={handleClose}
        >

            <LinearGradient
                colors={['#264387', '#1D548D', '#176192']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20 }}
            >
                <BottomSheetView style={styles.innerContent}>
                    <Text style={styles.sheetTitle}>
                        {isEdit ? "Edit Director" : "Create Director"}
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        placeholderTextColor="#ccc"
                        value={firstName}
                        onChangeText={setFirst}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        placeholderTextColor="#ccc"
                        value={lastName}
                        onChangeText={setLast}
                    />

                    {!isEdit && (
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#ccc"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    )}

                    {/* BUTTONS */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => sheetRef.current?.close()}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveText}>{isEdit ? "Save Changes" : "Create"}</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </LinearGradient>
        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    sheetContainer: {
        flex: 1,
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        overflow: "hidden",
        paddingTop: 12,
    },

    innerContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        textAlign: "center",
    },

    sheetTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 20,
        textAlign: "center",
    },

    input: {
        backgroundColor: "rgba(255,255,255,0.1)",
        padding: 14,
        borderRadius: 12,
        color: "#fff",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },

    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        gap: 14,
    },

    cancelButton: {
        flex: 1,
        backgroundColor: "#fff",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },

    cancelText: {
        color: "#1A5B77",
        fontSize: 16,
        fontWeight: "700",
    },

    saveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "white",
        alignItems: "center",
    },

    saveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
