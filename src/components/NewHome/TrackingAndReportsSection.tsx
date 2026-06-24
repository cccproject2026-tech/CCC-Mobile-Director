import { CommonCard } from '../ui/design-system';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import NewHomeScreenCard from '../Cards/HomeRoadMapsCard';

type Props = {}

const trackItems = [
    {
        id: '1',
        iconName: 'analytics-outline',
        title: 'Track Progress',
        route: '/(director)/(tabs)/progress-tracker',
        accentKey: 'sky',
    },
    {
        id: '2',
        iconName: 'school-outline',
        title: 'Course Completed',
        route: '/(director)/(tabs)/course-completed',
        accentKey: 'teal',
    },
    {
        id: '3',
        iconName: 'ribbon-outline',
        title: 'Certificates Issued',
        route: '/(director)/(tabs)/course-completed' as const,
        params: { initialTab: 'certificate_issued' as const },
        accentKey: 'amber',
    },
    {
        id: '4',
        iconName: 'mail-outline',
        title: 'Field Mentor Invitations',
        route: '/(director)/(tabs)/mentees',
        params: { type: "Field-Mentor-Home" },
        accentKey: 'mint',
    },
] as const;


const TrackingAndReportsSection = (props: Props) => {

    return (
        <CommonCard>
            <NewHomeScreenCard iconName='pie-chart-outline' title="Tracking Progress" desciption="Monitor Progress and Achievements" data={trackItems} modelOpen={() => { }} />
        </CommonCard>
    );
};

export default TrackingAndReportsSection;

const styles = StyleSheet.create({

});