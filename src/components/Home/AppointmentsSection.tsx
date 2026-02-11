import { icons } from '@/constants';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AppointmentCard from '../Cards/AppointmentCard';
import { useRouter } from 'expo-router';





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
        <View
            style={{
                marginTop: 10,
                gap: 12,
                borderBottomColor: "#ffffff22",
                borderBottomWidth: 1,
                paddingBottom: 18,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Text style={[{
                    fontSize: 15, color: "#e7f6fc",
                    fontWeight: "700",
                }]}>
                    Today&apos;s Appointments
                </Text>
                <Pressable onPress={() => router.push('/(director)/(tabs)/appointments' as any)}>
                    <Text
                        style={{
                            color: "#cfe9f3",
                            fontWeight: "600",
                            fontSize: 13,
                        }}
                    >
                        See all
                    </Text>
                </Pressable>
            </View>
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
    )
}

export default AppointmentsSection

const styles = StyleSheet.create({})