import AppointmentCard from "@/components/Cards/AppointmentCard";
import WelcomeCard from "@/components/Cards/WelcomeCard";
import HeaderHero from "@/components/Header/HeroHeader";
import { icons } from "@/constants";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/stores/auth.store";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedRef, useScrollOffset } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";



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


export default function Index() {
  const { bottom } = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [greetingPeriod, setGreetingPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');


  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  const handleGreetingPeriodChange = useCallback((period: 'morning' | 'afternoon' | 'evening') => {
    setGreetingPeriod(period);
  }, []);

  const greeting = useMemo(() => {
    if (greetingPeriod === 'morning') return "Good Morning";
    if (greetingPeriod === 'afternoon') return "Good Afternoon";
    return "Good Evening";
  }, [greetingPeriod]);

  return (
    <LinearGradient colors={[Colors.lightBlue, '#1D548D', '#264387']} style={{ flex: 1 }}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 16 + bottom,
        }}
      >
        <HeaderHero
          height={280}
          image={require('@/assets/images/app/homeScreenBG.png')}
          bottomBlendColor={Colors.lightBlue}
          scrollOffset={scrollOffset}
          onGreetingPeriodChange={handleGreetingPeriodChange}
        />
        <LinearGradient colors={[Colors.lightBlue, 'transparent']} style={{ minHeight: '100%' }}>
          <View style={{ paddingHorizontal: 16, marginTop: 12, gap: 8 }}>
            <Text style={{ fontSize: 16, color: '#e7f6fc', fontWeight: '700' }}>{greeting}</Text>
            <WelcomeCard
              onClick={() => { }}
              avatar={user?.profilePicture || undefined}
              message={`${user?.firstName} ${user?.lastName}, Welcome!`}
            />
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={[styles.sectionTitle, { fontSize: 15 }]}>
                Today&apos;s Appointments
              </Text>
              <Pressable>
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
            <View
              style={{
                marginTop: 10,
                gap: 12,
                borderBottomColor: "#ffffff22",
                borderBottomWidth: 1,
                paddingBottom: 18,
              }}
            >
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
                  onPressChevron={() => { }}
                  onCall={() => { }}
                  onChat={() => { }}
                  onMail={() => { }}
                />
              ))}
            </View>

          </View>
        </LinearGradient>
      </Animated.ScrollView>
    </LinearGradient >
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: "#e7f6fc",
    fontWeight: "700",
  },
})