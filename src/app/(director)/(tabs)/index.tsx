import WelcomeCard from "@/components/Cards/WelcomeCard";
import HeaderHero from "@/components/Header/HeroHeader";
import OverviewSection from "@/components/Home/OverviewSection";
import { GradientBackground, homeLayout } from "@/components/ui/design-system";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/stores/auth.store";
import { useUserProfile } from "@/hooks/useProfile";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useCallback, useMemo, useState, useRef } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedRef, useScrollOffset } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WelcomeCardd from "@/components/Cards/NewWelcomeCard";
import GlanceSection from "@/components/NewHome/GlanceSection";
import QuickActionSection from "@/components/NewHome/QuickActionsSections";
import RoadMapsSection from "@/components/NewHome/RoadMapsSection";
import AssesmentsAndCDPSection from "@/components/NewHome/AssesmentsAndCDPSection";
import MentorShipAndSupportSection from "@/components/NewHome/MentorShipAndSupportSection";
import { icons } from '@/constants';
import DirectorsNotesSection from "@/components/NewHome/DirectorsNotesSection";
import TrackingAndReportsSection from "@/components/NewHome/TrackingAndReportsSection";
import AiInsightsSection from "@/components/NewHome/AiInsightsSection";
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CreateRoadmapSheet from "@/components/Sheets/CreateRoadmapSheet";

export default function Index() {
  const { bottom } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const { user: authUser } = useAuthStore();
  const { data: profileUser } = useUserProfile(authUser?.id ?? "");

  const profilePicture = profileUser?.profilePicture ?? authUser?.profilePicture;
  const welcomeName = useMemo(() => {
    const firstName = profileUser?.firstName ?? authUser?.firstName ?? "";
    const lastName = profileUser?.lastName ?? authUser?.lastName ?? "";
    return `${firstName} ${lastName}`.trim();
  }, [authUser?.firstName, authUser?.lastName, profileUser?.firstName, profileUser?.lastName]);

  const [greetingPeriod, setGreetingPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const createRoadmapModalRef = useRef<BottomSheetModal>(null);
  const [createSheetKey, setCreateSheetKey] = useState(0);
  const handleGreetingPeriodChange = useCallback((period: 'morning' | 'afternoon' | 'evening') => {
    setGreetingPeriod(period);
  }, []);

  const greeting = useMemo(() => {
    if (greetingPeriod === 'morning') return "Good Morning";
    if (greetingPeriod === 'afternoon') return "Good Afternoon";
    return "Good Evening";
  }, [greetingPeriod]);

  const heroHeight = Math.min(
    220,
    Math.max(186, Math.round(windowHeight * 0.26)),
  );
  const handleOpenCreateRoadmapModal = useCallback(() => {
    requestAnimationFrame(() => {
      createRoadmapModalRef.current?.present();
    });
  }, []);

  const handleCloseCreateRoadmapModal = useCallback(() => {
    createRoadmapModalRef.current?.dismiss();
  }, []);

  const handleCreateSheetDismissed = useCallback(() => {
    setCreateSheetKey((key) => key + 1);
  }, []);


  const handleCreateRoadmapCancel = useCallback(() => {
    handleCloseCreateRoadmapModal();
  }, [handleCloseCreateRoadmapModal]);

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
            avatar={profilePicture || undefined}
            message={`Welcome back, ${welcomeName}`}
            bg="rgba(255,255,255,0.12)"
            borderColor="rgba(255,255,255,0.25)"
          />
          {/* <WelcomeCardd
            onClick={() => { }}
            avatar={user?.profilePicture || undefined}
            message={`Welcome back, ${user?.firstName} ${user?.lastName}`}
            bg="rgba(255,255,255,0.12)"
            borderColor="rgba(255,255,255,0.25)"
            avatarImage={user?.profilePicture || icons.myProfile}

          /> */}

        </HeaderHero>

        <View style={styles.scrollBodyStack}>
          <View style={styles.mainCardsGroup}>
            <GlanceSection />
            <QuickActionSection />
            <RoadMapsSection handleOpenCreateRoadmapModal={handleOpenCreateRoadmapModal} />
            <AssesmentsAndCDPSection />
            <MentorShipAndSupportSection />

            <TrackingAndReportsSection />
            <DirectorsNotesSection />
            <OverviewSection />
            <AiInsightsSection />
          </View>
        </View>
      </Animated.ScrollView>

      <CreateRoadmapSheet
        key={createSheetKey}
        ref={createRoadmapModalRef}
        onClose={handleCloseCreateRoadmapModal}
        onCancel={handleCreateRoadmapCancel}
        onDismissed={handleCreateSheetDismissed}
        mode="create"
      />
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
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
