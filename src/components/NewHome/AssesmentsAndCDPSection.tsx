import CdpDevelopmentPlanModal from '@/components/Modals/CdpDevelopmentPlanModal';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import NewHomeScreenCard from '../Cards/HomeRoadMapsCard';
import { CommonCard } from '../ui/design-system';

type Props = {};

const assesmentsItems = [
    {
        id: '1',
        iconName: 'folder-outline',
        title: 'Assessments Library',
        route: '/(director)/(tabs)/assessments',
        accentKey: 'violet',
    },
    {
        id: '3',
        iconName: 'people-outline',
        title: 'Mentees Assesments',
        route: '/(director)/(tabs)/mentees',
        accentKey: 'sky',
    },
    {
        id: '4',
        iconName: 'trending-up-outline',
        title: 'CDP \n (Development Plan)',
        action: 'cdp',
        accentKey: 'gold',
    },
] as const;

const AssesmentsAndCDPSection = (_props: Props) => {
    const [cdpModalVisible, setCdpModalVisible] = useState(false);

    return (
        <CommonCard>
            <NewHomeScreenCard
                iconName="clipboard-outline"
                title="Assesments & CDP"
                desciption="Create assessments and manage CDPs effectively."
                data={assesmentsItems}
                onCdpPress={() => setCdpModalVisible(true)}
            />
            <CdpDevelopmentPlanModal
                visible={cdpModalVisible}
                onClose={() => setCdpModalVisible(false)}
            />
        </CommonCard>
    );
};

export default AssesmentsAndCDPSection;

const styles = StyleSheet.create({


});