import WelcomeCard from "@/components/Cards/WelcomeCard";
import HeaderHero from "@/components/Header/HeroHeader";
import ActionCardSection from "@/components/Home/ActionCardSection";
import AddUserSection from "@/components/Home/AddUserSection";
import AppointmentsSection from "@/components/Home/AppointmentsSection";
import ExploreCCCSection from "@/components/Home/ExploreCCCSection";
import InterestsSection from "@/components/Home/InterestsSection";
import MentorMenteeSection from "@/components/Home/MentorMenteeSection";
import OverviewSection from "@/components/Home/OverviewSection";
import { GradientBackground, homeLayout } from "@/components/ui/design-system";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/stores/auth.store";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedRef, useScrollOffset } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const { bottom } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
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

  const heroHeight = Math.min(
    236,
    Math.max(186, Math.round(windowHeight * 0.26)),
  );

  return (
    <GradientBackground>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 18 + Math.min(bottom, 10) },
        ]}
      >
        <HeaderHero
          height={heroHeight}
          image={require('@/assets/images/app/homeScreenBG.png')}
          bottomBlendColor={Colors.appBgGradient[0]}
          scrollOffset={scrollOffset}
          showClockDate={false}
          onGreetingPeriodChange={handleGreetingPeriodChange}
        >
          <Text style={styles.greetingOnHero}>{greeting}</Text>
          <WelcomeCard
            compact
            onClick={() => { }}
            avatar={user?.profilePicture || undefined}
            message={`${user?.firstName} ${user?.lastName}, Welcome!`}
            bg="rgba(255,255,255,0.12)"
            borderColor="rgba(255,255,255,0.25)"
          />
        </HeaderHero>

        <View style={styles.scrollBodyStack}>
          <View style={styles.mainCardsGroup}>
            <AppointmentsSection />
            <InterestsSection />
            <AddUserSection />
            <MentorMenteeSection />
            <ExploreCCCSection />
            <OverviewSection />
            <ActionCardSection />
          </View>
        </View>
      </Animated.ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  scrollBodyStack: {
    paddingHorizontal: homeLayout.screenPaddingH,
    marginTop: homeLayout.scrollBodyMarginTop,
    gap: homeLayout.sectionGap,
    paddingBottom: 4,
  },
  mainCardsGroup: {
    gap: homeLayout.cardsGroupGap,
  },
  greetingOnHero: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
