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
        route: '/(director)/(tabs)/progress-tracker'
    },
    {
        id: '2',
        iconName: 'school-outline',
        title: 'Cource Completed',
        route: '/(director)/(tabs)/course-completed'
    },
    {
        id: '3',
        iconName: 'ribbon-outline',
        title: 'Certificates Issued',
    },
    {
        id: '4',
        iconName: 'mail-outline',
        title: 'Field Mentor Invitations',
        route: '/(director)/(tabs)/mentees',
        params: { type: "Field-Mentor-Home" }
    },
] as const;


const TrackingAndReportsSection = (props: Props) => {

    return (
        <CommonCard style={{ marginBottom: 8 }}>
            <NewHomeScreenCard iconName='pie-chart-outline' title="Tracking Progress" desciption="Monitor Progress and Achievements" data={trackItems} modelOpen={() => { }} />
        </CommonCard>
    );
};

export default TrackingAndReportsSection;

const styles = StyleSheet.create({

});