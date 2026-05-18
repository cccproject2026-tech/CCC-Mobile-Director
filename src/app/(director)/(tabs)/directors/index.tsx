import DirectorCard from "@/components/Cards/DirectorCard";
import SearchBar from "@/components/Header/SearchBar";
import TopBar from "@/components/Header/TopBar";
import AppModal from "@/components/Modals/AppModal";
import CreateEditDirectorSheet from "@/components/Sheets/CreateEditDirectorSheet";
import { GradientBackground } from "@/components/ui/design-system";
import { useDeleteDirector, useDirectors } from "@/hooks/useDirectors";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DirectorsScreen() {
    const router = useRouter();
    const sheetRef = useRef<BottomSheetModal>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { data: directors, isLoading, error, refetch, isRefetching } = useDirectors();
    const { mutate: deleteDirector } = useDeleteDirector();

    const [search, setSearch] = useState("");
    const [selectedDirector, setSelectedDirector] = useState<string | null>(null);

    const filtered = useMemo(() => {
        if (!directors) return [];
        const q = search.toLowerCase();
        return directors.filter(d => {
            const name = `${d.firstName} ${d.lastName}`.toLowerCase();
            return name.includes(q) || d.email.toLowerCase().includes(q);
        });
    }, [directors, search]);

    return (
        <GradientBackground>
            <View style={styles.container}>
                <TopBar showUserName showNotifications />

                <View style={styles.inner}>
                    {/* HEADER */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <View style={styles.backIconWrap}>
                                <Ionicons name="chevron-back" size={20} color="#fff" />
                            </View>
                            <Text style={styles.headerTitle}>Directors</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                                setSelectedDirector(null);
                                sheetRef.current?.present();
                            }}
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* SEARCH */}
                    <View style={styles.searchWrapper}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* LIST */}
                    {isLoading ? (
                        <View style={styles.centerState}>
                            <ActivityIndicator color="#fff" />
                            <Text style={styles.stateText}>Loading directors...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.centerState}>
                            <Ionicons name="alert-circle-outline" size={40} color="rgba(255,255,255,0.4)" />
                            <Text style={styles.errorText}>Failed to load directors</Text>
                        </View>
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />
                            }
                        >
                            <View style={styles.list}>
                                {filtered.length > 0 ? (
                                    filtered.map(dir => (
                                        <DirectorCard
                                            key={dir.id}
                                            data={dir}
                                            onEdit={() => {
                                                setSelectedDirector(dir.id);
                                                sheetRef.current?.present();
                                            }}
                                            onDelete={() => {
                                                setSelectedDirector(dir.id);
                                                setShowDeleteModal(true);
                                            }}
                                        />
                                    ))
                                ) : (
                                    <View style={styles.centerState}>
                                        <Ionicons name="people-outline" size={40} color="rgba(255,255,255,0.3)" />
                                        <Text style={styles.stateText}>No directors found</Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    )}
                </View>
            </View>

            {/* CREATE / EDIT SHEET */}
            <CreateEditDirectorSheet sheetRef={sheetRef} directorId={selectedDirector} />

            {/* DELETE CONFIRM */}
            <AppModal
                visible={showDeleteModal}
                type="confirm"
                title="Are you sure you want to delete this director?"
                confirmText="Delete"
                cancelText="Cancel"
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    if (selectedDirector) deleteDirector(selectedDirector);
                    setShowDeleteModal(false);
                }}
            />
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1, paddingTop: 24 },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.12)",
        paddingHorizontal: 16,
        paddingBottom: 14,
        marginBottom: 0,
    },
    backButton: { flexDirection: "row", alignItems: "center", gap: 10 },
    backIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff", letterSpacing: -0.2 },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 9,
        backgroundColor: "rgba(255,255,255,0.10)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
        alignItems: "center",
        justifyContent: "center",
    },
    searchWrapper: { paddingHorizontal: 16, marginVertical: 16 },
    list: { paddingHorizontal: 16, gap: 10, paddingBottom: 30 },
    centerState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 48,
        gap: 12,
    },
    stateText: { color: "rgba(255,255,255,0.5)", fontSize: 15, fontWeight: "500" },
    errorText: { color: "rgba(255,255,255,0.7)", fontSize: 15, textAlign: "center" },
});
