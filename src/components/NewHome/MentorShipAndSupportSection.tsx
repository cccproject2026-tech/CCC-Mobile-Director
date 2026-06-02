import { CommonCard } from '../ui/design-system';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import NewHomeScreenCard from '../Cards/HomeRoadMapsCard';

type Props = {}

const mentorshipItems = [
    {
        id: '1',
        iconName: 'book-outline',
        title: 'Mentorship Sessions Library',
    },
    {
        id: '2',
        iconName: 'people-outline',
        title: 'Mentees Mentorship Sessions',
    },
    {
        id: '3',
        iconName: 'heart-outline',
        title: 'Microgrants',
        route: '/(director)/(tabs)/micro-grant'

    },

] as const;


const MentorShipAndSupportSection = (props: Props) => {

    return (
        <CommonCard style={{ marginBottom: 8 }}>
            <NewHomeScreenCard iconName='people-outline' title="Mentorship & Support" desciption="Manage Sessions and support initiatives." data={mentorshipItems} modelOpen={() => { }} />
        </CommonCard>
    );
};

export default MentorShipAndSupportSection;

const styles = StyleSheet.create({


});