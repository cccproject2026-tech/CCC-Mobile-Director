// app/(director)/(tabs)/roadmaps/select-roadmaps.tsx
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import TopBar from '@/components/Header/TopBar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '@/components/Header/SearchBar';
import { useAllRoadmaps } from '@/hooks/roadmap/useRoadmaps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RoadmapCard from '@/components/Cards/RoadmapCard';
import { RoadmapCardData } from '@/types/roadmap.types';
import { getRoadmapCard } from '@/utils/roadmapMapper';

const SelectRoadmaps = () => {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();

    const [search, setSearch] = useState('');
    const [selectedRoadmaps, setSelectedRoadmaps] = useState<Set<string>>(new Set());

    // ✅ Fetch roadmaps using the same hook pattern
    const {
        data: roadmaps = [],
        isLoading,
        error,
    } = useAllRoadmaps();

    // ✅ Transform roadmaps to RoadmapCardData (same as library)
    const roadmapCardsData: RoadmapCardData[] = useMemo(() => {
        return roadmaps
            .filter(roadmap => roadmap != null)
            .map(roadmap => {
                try {
                    return getRoadmapCard(roadmap);
                } catch (error) {
                    console.error('❌ Error transforming roadmap:', roadmap?._id, error);
                    return null;
                }
            })
            .filter(card => card != null) as RoadmapCardData[];
    }, [roadmaps]);

    // Filter roadmaps based on search
    const filteredRoadmaps = useMemo(() => {
        if (!search.trim()) return roadmapCardsData;

        const searchLower = search.toLowerCase().trim();
        return roadmapCardsData.filter((roadmap) =>
            roadmap.title?.toLowerCase().includes(searchLower) ||
            roadmap.description?.toLowerCase().includes(searchLower) ||
            roadmap.phaseNumber?.toString().includes(searchLower)
        );
    }, [roadmapCardsData, search]);

    const handleToggleSelection = (roadmapId: string) => {
        setSelectedRoadmaps((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(roadmapId)) {
                newSet.delete(roadmapId);
            } else {
                newSet.add(roadmapId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedRoadmaps.size === filteredRoadmaps.length && filteredRoadmaps.length > 0) {
            setSelectedRoadmaps(new Set());
        } else {
            const allIds = new Set(
                filteredRoadmaps
                    .map((r) => r._id)
                    .filter((id): id is string => id != null)
            );
            setSelectedRoadmaps(allIds);
        }
    };

    const handleConfirm = () => {
        if (selectedRoadmaps.size === 0) {
            Alert.alert('No Selection', 'Please select at least one roadmap to assign.');
            return;
        }

        const selected = Array.from(selectedRoadmaps);

        router.push({
            pathname: '/(director)/(tabs)/roadmaps/assign-roadmaps',
            params: {
                roadmapIds: JSON.stringify(selected)
            }
        });
    };

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
            <TopBar showUserName={true} showNotifications={true} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={32} color="#fff" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Select Roadmaps</Text>
                    <Text style={styles.headerSubtitle}>
                        {selectedRoadmaps.size} selected
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleConfirm}
                    style={styles.confirmButton}
                    disabled={selectedRoadmaps.size === 0}
                >
                    <Ionicons
                        name="arrow-redo-outline"
                        size={32}
                        color={selectedRoadmaps.size === 0 ? 'rgba(255,255,255,0.3)' : '#fff'}
                    />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <SearchBar value={search} onChangeValue={setSearch} placeholder="Search roadmaps" />
            </View>

            {/* Select All */}
            <View style={styles.selectAllContainer}>
                <TouchableOpacity onPress={handleSelectAll}>
                    <Text style={styles.selectAllText}>
                        {selectedRoadmaps.size === filteredRoadmaps.length && filteredRoadmaps.length > 0
                            ? 'Deselect All'
                            : 'Select All'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Roadmaps List */}
            <View style={styles.content}>
                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.centerText}>Loading roadmaps...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                        <Text style={[styles.centerText, { color: '#ff6b6b' }]}>Failed to load roadmaps</Text>
                    </View>
                ) : filteredRoadmaps.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="map-outline" size={64} color="#fff" style={{ opacity: 0.5 }} />
                        <Text style={styles.centerText}>
                            {search.trim() ? 'No roadmaps found' : 'No roadmaps available'}
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 20 }]}
                        showsVerticalScrollIndicator={false}
                    >
                        {filteredRoadmaps.map((roadmap) => (
                            <RoadmapCard
                                key={roadmap._id}
                                data={roadmap}
                                selectionMode={true}
                                isSelected={selectedRoadmaps.has(roadmap._id!)}
                                onToggleSelection={() => handleToggleSelection(roadmap._id!)}
                            />
                        ))}
                    </ScrollView>
                )}
            </View>
        </LinearGradient>
    );
};

export default SelectRoadmaps;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },
    confirmButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    selectAllContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'flex-end',
    },
    selectAllText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    centerText: {
        color: '#fff',
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    },
});
