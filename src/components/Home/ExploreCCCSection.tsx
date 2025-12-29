import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { icons } from '@/constants';
import ExploreCard from '../Cards/ExploreCard';
import { Route } from 'expo-router';

type Props = {}


export const exploreItems = [
    { id: '1', icon: icons.progress, title: 'Track Progress', route: '/(director)/(tabs)/progress-tracker' },
    { id: '2', icon: icons.schedule, title: 'Schedule', route: '/(director)/(tabs)/appointments' },
    { id: '3', icon: icons.microGrant, title: 'Microgrant', route: '/(director)/(tabs)/micro-grant' },
    { id: '4', icon: icons.Revitalization, title: 'Revitalization Roadmap', route: '/(director)/(tabs)/roadmaps' },
    { id: '5', icon: icons.Assessments, title: 'Assessment', },
    { id: '6', icon: icons.assignmentIcon, title: 'Assignment' },
];

const ExploreCCCSection = (props: Props) => {
    return (
        <View
            style={{
                marginBottom: 18,
                gap: 8,
            }}
        >
            <Text style={styles.sectionTitle}>
                Explore CCC
            </Text>

            {/* Grid */}
            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    rowGap: 12,
                }}
            >
                {exploreItems.map((item) => (
                    <ExploreCard
                        key={item.id}
                        icon={item.icon}
                        title={item.title}
                        route={item.route as Route}
                    />
                ))}
            </View>
        </View>
    )
}

export default ExploreCCCSection

const styles = StyleSheet.create({
    sectionTitle: {
        color: "#e7f6fc",
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 16
    },
})