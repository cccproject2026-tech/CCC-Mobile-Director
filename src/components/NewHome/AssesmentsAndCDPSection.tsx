import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import NewHomeScreenCard from '../Cards/HomeRoadMapsCard';
import { CommonCard } from '../ui/design-system';
type Props = {}

const assesmentsItems = [
    {
        id: '1',
        iconName: 'folder-outline',
        title: 'Assessments Library',
        route: '/(director)/(tabs)/assessments'
    },
    {
        id: '3',
        iconName: 'people-outline',
        title: 'Mentees Assesments',
        route: '/(director)/(tabs)/mentees'
    },
    {
        id: '4',
        iconName: 'trending-up-outline',
        title: 'CDP \n (Development Plan)',
    },
] as const;



const AssesmentsAndCDPSection = (props: Props) => {


    return (
        <CommonCard>
            <NewHomeScreenCard iconName='clipboard-outline' title="Assesments & CDP" desciption="Create assessments and manage CDPs effectively." data={assesmentsItems} />
        </CommonCard>
    );
};

export default AssesmentsAndCDPSection;

const styles = StyleSheet.create({


});