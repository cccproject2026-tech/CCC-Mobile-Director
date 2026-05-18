import { icons } from '@/constants';
import { CommonCard, HomeSectionHeader } from '@/components/ui/design-system';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppointmentCard from '../Cards/AppointmentCard';

export const appointments = [
    {
        id: '1',
        date: '04 Aug 24',
        time: '11:30',
        tz: 'EST',
        person: 'Pr. John Ross',
        role: 'Mentor',
        mode: 'Duo',
        icon: icons.duoMeet,
    },
    {
        id: '2',
        date: '11 Aug 24',
        time: '11:30',
        tz: 'EST',
        person: 'Pr. John Ross',
        role: 'Field Mentor',
        mode: 'Google Meet',
        icon: icons.googleMeet,
    },
];

type Props = {}

const AppointmentsSection = (props: Props) => {
    const router = useRouter();
    return (
        <CommonCard>
            <HomeSectionHeader
                icon="calendar-outline"
                title="Today's Appointments"
                onSeeAll={() => router.push('/(director)/(tabs)/appointments' as any)}
            />
            <View style={styles.list}>
                {appointments.map((a) => (
                    <AppointmentCard
                        key={a.id}
                        date={a.date}
                        time={a.time}
                        tz={a.tz}
                        person={a.person}
                        mode={a.mode}
                        platformIcon={a.icon}
                        avatar={icons.myProfile}
                        onPressChevron={() => router.push('/(director)/(tabs)/appointments' as any)}
                        onCall={() => { }}
                        onChat={() => { }}
                        onMail={() => { }}
                    />
                ))}
            </View>
        </CommonCard>
    );
};

export default AppointmentsSection;

const styles = StyleSheet.create({
    list: {
        gap: 12,
    },
});
