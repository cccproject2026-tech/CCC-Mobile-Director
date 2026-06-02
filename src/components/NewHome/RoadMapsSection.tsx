import { CommonCard } from '../ui/design-system';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import NewHomeScreenCard from '../Cards/HomeRoadMapsCard';
type Props = {
    handleOpenCreateRoadmapModal: any
}

const roadmapItems = [
    {
        id: '1',
        iconName: 'map-outline',
        title: 'RoadMaps Library',
        route: '/(director)/(tabs)/roadmaps',
        params: {
            tab: 'roadmap-library'
        }
    },
    {
        id: '2',
        iconName: 'add-circle-outline',
        title: 'Create New Roadmap',
        route: '/(director)/(tabs)/roadmaps'

    },
    {
        id: '3',
        iconName: 'people-outline',
        title: 'Mentees RoadMap',
        route: '/(director)/(tabs)/roadmaps',
        params: {
            tab: 'mentees',
        },
    },
] as const;


const RoadMapsSection = (props: Props) => {

    return (
        <CommonCard style={{ marginBottom: 8 }}>
            <NewHomeScreenCard iconName='layers-outline' title="RoadMaps" desciption="Build, Assign and track roadmap Progress." data={roadmapItems} modelOpen={props.handleOpenCreateRoadmapModal} />
        </CommonCard>
    );
};

export default RoadMapsSection;

const styles = StyleSheet.create({

});