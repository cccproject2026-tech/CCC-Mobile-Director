import { CommonCard } from '../ui/design-system';
import React from 'react';
import { StyleSheet } from 'react-native';
import AiInsightCard from '../Cards/AiInsightsCard';
type Props = {}

const assesmentsItems = [
    {
        id: '1',
        iconName: 'folder-outline',
        title: 'Assessments Library',
    },
    {
        id: '3',
        iconName: 'people-outline',
        title: 'Mentees Assesments',
    },
    {
        id: '4',
        iconName: 'trending-up-outline',
        title: 'CDP \n (Development Plan)',
    },
] as const;



const AiInsightsSection = (props: Props) => {

    return (
        <CommonCard>
            <AiInsightCard iconName='sparkles-outline' title="AI Insights" desciption="AI-generated insights to help you improve the system and drive impact" data={assesmentsItems} />
        </CommonCard>
    );
};

export default AiInsightsSection;

const styles = StyleSheet.create({

});