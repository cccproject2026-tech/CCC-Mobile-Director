import { CommonCard } from '../ui/design-system';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QuickActionCard from '../Cards/QuickActionsCard/QuickActionCard';
import { roadmapTheme } from '../ui/design-system';

type Props = {}

const quickActionItems = [
    {
        id: '1',
        itemName: 'Assign Mentors',
        iconName: 'people-outline',
        route: '/(director)/(tabs)/mentees'
    },
    {
        id: '2',
        itemName: 'Assign Mentees',
        iconName: 'people-circle-outline',
        route: '/(director)/(tabs)/mentors'
    },
    {
        id: '3',
        itemName: 'Assign \n RoadMaps',
        iconName: 'layers-outline',
        route: '/(director)/(tabs)/roadmaps'
    },
    {
        id: '4',
        itemName: 'Assign \n Assessments',
        iconName: 'clipboard-outline',
        route: '/(director)/(tabs)/assessments'
    },
    {
        id: '5',
        itemName: 'Schedule Meeting',
        iconName: 'calendar-number-outline',
        route: '/(director)/(tabs)/appointments'
    },

] as const;
const QuickActionSection = (props: Props) => {


    return (
        <CommonCard style={{ marginBottom: 8 }}>
            <View style={styles.header}>
                <Text style={styles.quickActionText}>
                    Quick Actions
                </Text>

                <View style={styles.viewAllContainer}>
                    <Text style={styles.viewAllText}>
                        View all
                    </Text>

                    <Ionicons
                        name="chevron-forward"
                        size={14}
                        color="#EAF7FF"
                    />
                </View>
            </View>
            <Text style={styles.aboutDescription}>Pick up from the step you left off and keep going.</Text>

            <View style={styles.quickActionMainContainer}>
                {quickActionItems.map((item) => (
                    <QuickActionCard
                        key={item.id}
                        itemName={item.itemName}
                        iconName={item.iconName}
                        route={item.route}
                    />
                ))}
            </View>
        </CommonCard>
    );
};

export default QuickActionSection;

const styles = StyleSheet.create({
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    quickActionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "rgba(255,255,255,0.95)",
    },

    viewAllText: {
        fontSize: 12,
        fontWeight: "400",
        color: "rgba(255,255,255,0.75)",
    },

    viewAllContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    quickActionMainContainer: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
    },
    aboutDescription: {
        color: roadmapTheme.textMuted,
        fontSize: 12,
        lineHeight: 16,
        marginTop: -4
    }

});