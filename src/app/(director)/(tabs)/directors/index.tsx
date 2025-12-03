import DirectorCard from "@/components/Cards/DirectorCard";
import SearchBar from "@/components/Header/SearchBar";
import TopBar from "@/components/Header/TopBar";
import AppModal from "@/components/Modals/AppModal";
import CreateEditDirectorSheet from "@/components/Sheets/CreateEditDirectorSheet";
import { useDeleteDirector, useDirectors } from "@/hooks/useDirectors";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
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
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
            <View style={styles.container}>
                <TopBar showUserName showNotifications />

                <View style={styles.inner}>

                    {/* HEADER */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                            <Text style={styles.headerTitle}>Directors</Text>
                        </TouchableOpacity>

                        {/* ADD BUTTON */}
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedDirector(null);
                                sheetRef.current?.present();
                            }}
                        >
                            <Ionicons name="add-circle-outline" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>



                    {/* SEARCH */}
                    <View style={styles.searchWrapper}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* LIST */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />
                        }
                    >
                        <View style={styles.list}>
                            {isLoading ? (
                                <Text style={styles.loading}>Loading...</Text>
                            ) : error ? (
                                <Text style={styles.error}>Failed to load directors</Text>
                            ) : filtered.length > 0 ? (
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
                                <Text style={styles.noData}>No directors found.</Text>
                            )}
                        </View>
                    </ScrollView>
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
                    if (selectedDirector) {
                        deleteDirector(selectedDirector);
                    }
                    setShowDeleteModal(false);
                }}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1, paddingTop: 24 },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 20, color: "#fff", fontWeight: "700" },
    searchWrapper: { paddingHorizontal: 16, marginVertical: 16 },
    list: { paddingHorizontal: 16, gap: 12, paddingBottom: 30 },
    noData: { color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 40 },
    loading: { color: "#fff", textAlign: "center", marginTop: 20 },
    error: { color: "#f88", textAlign: "center", marginTop: 20 },
});
