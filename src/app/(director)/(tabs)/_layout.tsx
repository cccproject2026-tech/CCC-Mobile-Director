// app/(director)/(tabs)/_layout.tsx
import { icons } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { useMemo } from "react";
import { Image } from "react-native";
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
            /^\/new-interests\/.+/,
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
        "notifications",
        "assignments",
        "course-completed",
        "discover",
        "invite-field-mentor",
        "videos",
        "contact-details",
        "reports",
    ];

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#fff",
                tabBarInactiveTintColor: "#BFC6DF",
                tabBarStyle: isTabBarVisible
                    ? {
                          backgroundColor: "#221C70",
                          borderTopWidth: 0,
                          height: 60 + bottom,
                          paddingBottom: bottom,
                          paddingTop: 8,
                      }
                    : {
                          display: "none",
                      },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                    marginBottom: 4,
                },
            }}
        >
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
