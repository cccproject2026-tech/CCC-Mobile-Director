// app/(director)/(tabs)/_layout.tsx
import { icons } from "@/constants";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { useMemo } from "react";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Hide route from tab bar (Expo Router — use href only, not tabBarButton). */
const hiddenTab = {
    href: null,
} as const;

export default function DirectorTabLayout() {
    const pathname = usePathname();
    const { bottom } = useSafeAreaInsets();

    const isTabBarVisible = useMemo(() => {
        const hideWhenMatches = [
            /revitalization-roadmaps\/\([^\/]+\)/,
            /revitalization-roadmaps\/[^\/]+$/,
            /assign-mentor$/,
            /assign-mentee$/,
            /remove-mentor$/,
            /remove-mentee$/,
            /select-roadmap$/,
            /\/new-interests/,
            /modal/,
            /overlay/,
            /assessments\/assign-assessments$/,
            /assessments\/create-assessment$/,
            /assessments\/result$/,
            /assessments\/mentor-pastors$/,
            /roadmaps\/task$/,
            /roadmaps\/mentor-pastors$/,
        ];

        return !hideWhenMatches.some((p) => p.test(pathname));
    }, [pathname]);

    const hiddenRoutes = [
        // Array group `(index,mentors,mentees,progress-tracker)` registers as 4 tab slots
        "(index)",
        "(mentors)",
        "(mentees)",
        "(progress-tracker)",
        "directors",
        "new-interests",
        "micro-grant",
        "product-and-services",
        "roadmaps",
        "appointments",
        "ccc",
        "assessments",
        "assignments",
        "course-completed",
        "discover",
        "invite-field-mentor",
        "videos",
        "contact-details",
        "reports",
        "ai-insights",
    ];

    const tabBarHeight = 60 + bottom;

    return (
        <Tabs
        initialRouteName="index" 
        backBehavior="none" 
        
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
                sceneStyle: {
                    backgroundColor: Colors.appBgGradient[0],
                },
                tabBarActiveTintColor: "#fff",
                tabBarInactiveTintColor: "#BFC6DF",
                tabBarBackground: () => (
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: isTabBarVisible ? "#0D3656" : Colors.appBgGradient[0],
                        }}
                    />
                ),
                tabBarStyle: isTabBarVisible
                    ? {
                          backgroundColor: "#0D3656",
                          borderTopWidth: 0,
                          height: tabBarHeight,
                          paddingBottom: bottom,
                          paddingTop: 8,
                      }
                    : {
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: 0,
                          height: 0,
                          opacity: 0,
                          overflow: "hidden",
                          pointerEvents: "none",
                          backgroundColor: "transparent",
                          borderTopWidth: 0,
                          elevation: 0,
                      },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                    marginBottom: 4,
                },
            }}
        >
            <Tabs.Screen
                name="notifications"
                options={{
                    title: "Alerts",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="notifications-outline" size={24} color={color} />
                    ),
                }}
            />
            {/* Visible tabs — footer shows only Dashboard and Profile */}
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="home" size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => (
                        <Image
                            source={icons.profileTabIcon}
                            style={{ width: 28, height: 28, tintColor: color }}
                        />
                    ),
                }}
            />

            {/* Hidden routes — not shown in footer */}
            {hiddenRoutes.map((route) => (
                <Tabs.Screen
                    key={route}
                    name={route}
                    options={hiddenTab}
                />
            ))}
        </Tabs>
    );
}
