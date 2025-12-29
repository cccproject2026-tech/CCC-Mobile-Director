import { icons } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { useMemo } from "react";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DirectorTabLayout() {
    const pathname = usePathname();
    const { bottom } = useSafeAreaInsets();

    /** HIDE TAB BAR ON SPECIFIC ROUTES - Computed during render to avoid lag */
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
            /assessments\/assign-mentee$/,
            /assessments\/create-assessment$/,
        ];

        return !hideWhenMatches.some((p) => p.test(pathname));
    }, [pathname]);

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
                name="discover"
                options={{
                    title: "Discover",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="analytics" size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile/index"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => <Image source={icons.profileTabIcon} style={{ width: 28, height: 28, tintColor: color }} />,

                }}
            />

            <Tabs.Screen
                name="profile/documents"
                options={{
                    href: null,
                }}
            />

            {[
                "notification",
                "directors",
                "documents",
                "mentors",
                "mentees",
                "new-interests",
                "progress-tracker",
                "micro-grant",
                "product-and-services",
                "roadmaps",
                "appointments",
                "ccc",
                "assessments",
                "notifications"
            ].map((route) => (
                <Tabs.Screen key={route} name={route} options={{ href: null }} />
            ))}
        </Tabs>
    );
}