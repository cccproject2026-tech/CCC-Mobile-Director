import { CommonCard } from '../ui/design-system';
import React from 'react';
import { StyleSheet } from 'react-native';
import NewHomeScreenCard from '../Cards/HomeRoadMapsCard';

type Props = {}

const NewUserAddSection = (props: Props) => {

    return (
        <CommonCard style={{ marginBottom: 8 }}>
            <NewHomeScreenCard iconName='person-add-outline' title="New User" desciption="Add New Users." data={[]} />
        </CommonCard>
    );
};

export default NewUserAddSection;

const styles = StyleSheet.create({

});