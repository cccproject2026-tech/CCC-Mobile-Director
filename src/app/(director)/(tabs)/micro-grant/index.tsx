// app/(director)/(tabs)/micro-grant/index.tsx
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '@/components/Header/TopBar';
import { GradientBackground } from '@/components/ui/design-system';
import SearchBar from '@/components/Header/SearchBar';
import ApplicationCard from '@/components/Cards/ApplicationCard';
import { useMicroGrantApplicationWithProfiles } from '@/hooks/useMicroGrant';
import { TabSwitcher } from '@/components/Header/TabSwitcher';

const MicroGrant = () => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'new' | 'pending' | 'accepted'>('new');
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');

    const { applications, isLoading, totalCount } = useMicroGrantApplicationWithProfiles(activeTab);

    // Filter applications based on search
    const filteredApplications = applications.filter(app => {
        if (!search) return true;
        const fullName = `${app.userProfile?.firstName || ''} ${app.userProfile?.lastName || ''}`.toLowerCase();
        const email = app.userId?.email?.toLowerCase() || '';
        const searchLower = search.toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
    });

    const tabs = [
        { key: 'new', label: 'New', badge: activeTab === 'new' ? totalCount : undefined },
        { key: 'pending', label: 'Pending', badge: activeTab === 'pending' ? totalCount : undefined },
        { key: 'accepted', label: 'Accepted', badge: activeTab === 'accepted' ? totalCount : undefined },
    ];

    const handleTabChange = (tab: string) => {
        setActiveTab(tab as 'new' | 'pending' | 'accepted');
    };

    const handleCall = (email?: string) => {
        console.log('Call:', email);
    };

    const handleChat = (userId?: string) => {
        console.log('Chat:', userId);
    };

    const handleMail = (email?: string) => {
        console.log('Mail:', email);
    };

    const handleWhatsApp = (email?: string) => {
        console.log('WhatsApp:', email);
    };

    return (
        <GradientBackground>
            <View style={{ flex: 1 }}>
                <TopBar notifications={3} showUserName={true} showNotifications={true} />

                <View style={{ flex: 1, paddingTop: 24 }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <View style={styles.backIconWrap}>
                                <Ionicons name="chevron-back" size={20} color="#fff" />
                            </View>
                            <Text style={styles.headerTitle}>
                                Micro Grant - Application Received
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tab Switcher */}
                    <TabSwitcher variant="frosted" tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

                    {/* Applications List */}
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#fff" />
                            <Text style={styles.loadingText}>Loading applications...</Text>
                        </View>
                    ) : filteredApplications.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={64} color="rgba(255,255,255,0.3)" />
                            <Text style={styles.emptyText}>
                                {search ? 'No applications found' : 'No applications yet'}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredApplications}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <ApplicationCard
                                    userId={item.userId?._id as string}
                                    applicationId={item._id}
                                    firstName={item.userProfile?.firstName}
                                    lastName={item.userProfile?.lastName}
                                    profilePicture={item.userProfile?.profilePicture}
                                    title={item.userProfile?.role}
                                    createdAt={item.createdAt}
                                    onCall={() => handleCall(item.userId?.email)}
                                    onChat={() => handleChat(item.userId?._id)}
                                    onMail={() => handleMail(item.userId?.email)}
                                    onWhatsApp={() => handleWhatsApp(item.userId?.email)}
                                />
                            )}
                        />
                    )}
                </View>
            </View>
        </GradientBackground>
    );
};

export default MicroGrant;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    backIconWrap: {
        width: 34, height: 34, borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: -0.1 },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
});
