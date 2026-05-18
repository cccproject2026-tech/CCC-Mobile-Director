import { icons } from '@/constants';
import { CommonCard, HomeSectionHeader, homeLayout } from '@/components/ui/design-system';
import { Route } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ExploreCard from '../Cards/ExploreCard';

type Props = {}

export const exploreItems = [
    { id: '1', icon: icons.progress, title: 'Track\nProgress', route: '/(director)/(tabs)/progress-tracker' },
    { id: '2', icon: icons.schedule, title: 'Schedule', route: '/(director)/(tabs)/appointments' },
    { id: '3', icon: icons.microGrant, title: 'Microgrant', route: '/(director)/(tabs)/micro-grant' },
    { id: '4', icon: icons.Revitalization, title: 'Revitalization\nRoadmap', route: '/(director)/(tabs)/roadmaps' },
    { id: '5', icon: icons.Assessments, title: 'Assessment', route: '/(director)/(tabs)/assessments' },
    { id: '6', icon: icons.assignmentIcon, title: 'Assignment', route: '/(director)/(tabs)/assignments' },
];

const ExploreCCCSection = (props: Props) => {
    const rowOne = exploreItems.slice(0, 3);
    const rowTwo = exploreItems.slice(3, 6);

    return (
        <CommonCard>
            <HomeSectionHeader
                icon="map-outline"
                title="Explore CCC"
                subtitle="Progress, scheduling, roadmaps, and more."
            />
            <View style={styles.exploreRow}>
                {rowOne.map((item) => (
                    <ExploreCard
                        key={item.id}
                        icon={item.icon}
                        title={item.title}
                        route={item.route as Route}
                        appearance="frosted"
                        compact
                    />
                ))}
            </View>
            <View style={styles.exploreRow}>
                {rowTwo.map((item) => (
                    <ExploreCard
                        key={item.id}
                        icon={item.icon}
                        title={item.title}
                        route={item.route as Route}
                        appearance="frosted"
                        compact
                    />
                ))}
            </View>
        </CommonCard>
    );
};

export default ExploreCCCSection;

const styles = StyleSheet.create({
    exploreRow: {
        width: '100%',
        flexDirection: 'row',
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        gap: homeLayout.exploreRowGap,
        marginTop: 2,
        paddingBottom: 2,
    },
});
