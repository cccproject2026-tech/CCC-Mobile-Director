import ScholarshipCard from '@/components/Cards/ScholorshipCard';
import SearchBar from '@/components/Header/SearchBar';
import EditAmountBottomSheet from '@/components/Sheets/EditAmountBottomSheet';
import { useScholarships, useUpdateScholarship } from '@/hooks/useScholorships';
import { Scholarship } from '@/types/scholorship.types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    RefreshControl,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const PIE_RADIUS = width * 0.2;

export default function ProductAndServices() {
    const router = useRouter();
    const { bottom, top } = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'info'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingScholarship, setEditingScholarship] =
        useState<Scholarship | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [selectedYear, setSelectedYear] = useState('2023');

    const {
        data: scholarships = [],
        isFetching,
        refetch,
    } = useScholarships();
    const updateScholarship = useUpdateScholarship();

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handleEditPress = useCallback((scholarship: Scholarship) => {
        setEditingScholarship(scholarship);
        setEditAmount(scholarship.amount.toString());
        bottomSheetModalRef.current?.present();
    }, []);

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setEditingScholarship(null);
        setEditAmount('');
    }, []);

    const handleSaveChanges = useCallback(() => {
        if (editingScholarship && editAmount) {
            const newAmount = parseFloat(editAmount);
            if (!isNaN(newAmount)) {
                updateScholarship.mutate(
                    {
                        scholarshipId: editingScholarship.id,
                        payload: { amount: newAmount },
                    },
                    {
                        onSuccess: () => {
                            // ensure latest data
                            refetch();
                        },
                    }
                );
            }
        }
        handleCloseModal();
    }, [editingScholarship, editAmount, updateScholarship, handleCloseModal, refetch]);

    const handleToggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredScholarships =
        scholarships.filter((item) =>
            item.type.toLowerCase().includes(search.toLowerCase())
        ) || [];

    const totalMoneyAwarded = useMemo(
        () => scholarships.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
        [scholarships]
    );

    const totalMenteesAwarded = useMemo(
        () => scholarships.reduce((sum, s) => sum + (s.numberOfAwards || 0), 0),
        [scholarships]
    );

    const pieData = useMemo(() => {
        if (!scholarships.length) return [];
        const colors = ['#5B4B8A', '#E879F9', '#22D3EE', '#C4B5FD', '#D946EF'];
        return scholarships.map((scholarship, index) => ({
            value: scholarship.totalAmount || 0,
            color: colors[index % colors.length],
            text: `$${scholarship.totalAmount || 0}`,
        }));
    }, [scholarships]);

    return (
        <>
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
                style={{ flex: 1, paddingBottom: bottom, paddingTop: top }}
            >
                <View style={{ flex: 1 }}>
                    {/* Header */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingVertical: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(255, 255, 255, 0.3)',
                        }}
                    >
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text
                            style={{
                                marginLeft: 12,
                                fontSize: 18,
                                fontWeight: '600',
                                color: '#fff',
                            }}
                        >
                            Settings - Product and Services
                        </Text>
                    </View>

                    {/* Search Bar */}
                    <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs */}
                    <View
                        style={{
                            flexDirection: 'row',
                            paddingHorizontal: 16,
                            marginBottom: 20,
                            gap: 12,
                        }}
                    >
                        <Pressable
                            onPress={() => setActiveTab('all')}
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                backgroundColor:
                                    activeTab === 'all'
                                        ? '#fff'
                                        : 'rgba(255, 255, 255, 0.15)',
                                borderRadius: 12,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor:
                                    activeTab === 'all'
                                        ? '#fff'
                                        : 'rgba(255, 255, 255, 0.3)',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: activeTab === 'all' ? '#1A4882' : '#fff',
                                }}
                            >
                                All Scholarships
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setActiveTab('info')}
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                backgroundColor:
                                    activeTab === 'info'
                                        ? '#fff'
                                        : 'rgba(255, 255, 255, 0.15)',
                                borderRadius: 12,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor:
                                    activeTab === 'info'
                                        ? '#fff'
                                        : 'rgba(255, 255, 255, 0.3)',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: activeTab === 'info' ? '#1A4882' : '#fff',
                                }}
                            >
                                Info
                            </Text>
                        </Pressable>
                    </View>

                    {/* Content */}
                    <ScrollView
                        style={{ flex: 1, paddingHorizontal: 16 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isFetching}
                                onRefresh={refetch}
                                tintColor="#fff"
                                colors={['#fff']}
                            />
                        }
                    >
                        {activeTab === 'all' ? (
                            <>
                                {filteredScholarships.map((scholarship, index) => (
                                    <ScholarshipCard
                                        key={scholarship.id}
                                        scholarship={scholarship}
                                        isExpanded={expandedId === scholarship.id}
                                        onToggleExpand={() => handleToggleExpand(scholarship.id)}
                                        onEditPress={() => handleEditPress(scholarship)}
                                        isFirst={index === 0}
                                    />
                                ))}
                            </>
                        ) : (
                            <InfoSection
                                totalMoneyAwarded={totalMoneyAwarded}
                                totalMenteesAwarded={totalMenteesAwarded}
                                pieData={pieData}
                                scholarships={scholarships}
                                selectedYear={selectedYear}
                                setSelectedYear={setSelectedYear}
                            />
                        )}
                        <View style={{ height: 20 }} />
                    </ScrollView>
                </View>

                {/* Bottom Sheet Modal */}
                <EditAmountBottomSheet
                    ref={bottomSheetModalRef}
                    title={editingScholarship?.type}
                    amount={editAmount}
                    onChangeAmount={setEditAmount}
                    onCancel={handleCloseModal}
                    onSave={handleSaveChanges}
                />
            </LinearGradient>
        </>
    );
}

interface InfoSectionProps {
    totalMoneyAwarded: number;
    totalMenteesAwarded: number;
    pieData: any[];
    scholarships: Scholarship[];
    selectedYear: string;
    setSelectedYear: (year: string) => void;
}

function InfoSection({
    totalMoneyAwarded,
    totalMenteesAwarded,
    pieData,
    scholarships,
    selectedYear,
    setSelectedYear,
}: InfoSectionProps) {
    return (
        <View>
            {/* Summary Card */}
            <View
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
            >
                <Text
                    style={{
                        fontSize: 16,
                        color: '#fff',
                        marginBottom: 12,
                    }}
                >
                    <Text style={{ fontWeight: '400' }}>
                        Total Money Awarded so far :{' '}
                    </Text>
                    <Text style={{ fontWeight: '700', color: '#FFC107' }}>
                        ${totalMoneyAwarded}
                    </Text>
                </Text>

                <Text
                    style={{
                        fontSize: 16,
                        color: '#fff',
                    }}
                >
                    <Text style={{ fontWeight: '400' }}>
                        Total Number of Mentees Awarded :{' '}
                    </Text>
                    <Text style={{ fontWeight: '700', color: '#FFC107' }}>
                        {totalMenteesAwarded}
                    </Text>
                </Text>
            </View>

            {/* Divider */}
            <View
                style={{
                    height: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    marginBottom: 24,
                }}
            />

            {/* Chart Section */}
            <View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 20,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '600',
                            color: '#fff',
                        }}
                    >
                        Total Amount of Scholarships Awarded so far
                    </Text>
                </View>

                {/* Chart Card */}
                <View
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                >
                    {/* Year Selector */}
                    <View
                        style={{
                            alignSelf: 'flex-end',
                            marginBottom: 20,
                        }}
                    >
                        <Pressable
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                gap: 8,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: '#fff',
                                    fontWeight: '600',
                                }}
                            >
                                {selectedYear}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#fff" />
                        </Pressable>
                    </View>

                    {/* Pie Chart with Legend */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        {/* Pie Chart */}
                        <View style={{ alignItems: 'center' }}>
                            <PieChart
                                data={pieData}
                                radius={PIE_RADIUS}
                                innerRadius={PIE_RADIUS * 0.5}
                                donut
                                showText
                                textColor="#fff"
                                textSize={12}
                                fontWeight="600"
                                innerCircleColor="transparent"
                                centerLabelComponent={() => null}
                            />
                        </View>

                        {/* Legend */}
                        <View style={{ flex: 1, paddingLeft: 20 }}>
                            {scholarships.map((scholarship, index) => {
                                const colors = [
                                    '#5B4B8A',
                                    '#E879F9',
                                    '#22D3EE',
                                    '#C4B5FD',
                                    '#D946EF',
                                ];
                                const color = colors[index % colors.length];

                                return (
                                    <View
                                        key={scholarship.id}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginBottom: 12,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 16,
                                                height: 16,
                                                borderRadius: 4,
                                                backgroundColor: color,
                                                marginRight: 10,
                                            }}
                                        />
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                color: '#fff',
                                                fontWeight: '500',
                                                flex: 1,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {scholarship.type}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
