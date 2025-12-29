import WelcomeCard from "@/components/Cards/WelcomeCard";
import HeaderHero from "@/components/Header/HeroHeader";
import ActionCardSection from "@/components/Home/ActionCardSection";
import AddUserSection from "@/components/Home/AddUserSection";
import AppointmentsSection from "@/components/Home/AppointmentsSection";
import ExploreCCCSection from "@/components/Home/ExploreCCCSection";
import InterestsSection from "@/components/Home/InterestsSection";
import MentorMenteeSection from "@/components/Home/MentorMenteeSection";
import OverviewSection from "@/components/Home/OverviewSection";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/stores/auth.store";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedRef, useScrollOffset } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";



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
            {/*
            */}
            <AppointmentsSection />
            <InterestsSection />
            <AddUserSection />
            <MentorMenteeSection />
            <ExploreCCCSection />
            <OverviewSection />
            <ActionCardSection />
          </View>
        </LinearGradient>
      </Animated.ScrollView>
    </LinearGradient >
  );
}
