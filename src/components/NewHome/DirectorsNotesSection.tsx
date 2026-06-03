import { CommonCard } from '../ui/design-system';
import React from 'react';
import { StyleSheet } from 'react-native';
import NewHomeScreenCard from '../Cards/HomeRoadMapsCard';

type Props = {}

const DirectorsNotesSection = (props: Props) => {

    return (
        <CommonCard>
            <NewHomeScreenCard iconName='chatbox-ellipses-outline' title="Directors Notes" desciption="Keep important notes updates, and observations." data={[]} modelOpen={() => { }} />
        </CommonCard>
    );
};

export default DirectorsNotesSection;

const styles = StyleSheet.create({

});