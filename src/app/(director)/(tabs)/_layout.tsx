import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DirectorTabLayout() {
    const pathname = usePathname();
    const [isTabBarVisible, setIsTabBarVisible] = useState(true);
    const { bottom } = useSafeAreaInsets();

    /** HIDE TAB BAR ON SPECIFIC ROUTES */
    useEffect(() => {
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

        setIsTabBarVisible(!hideWhenMatches.some((p) => p.test(pathname)));
    }, [pathname]);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#fff",
                tabBarInactiveTintColor: "#BFC6DF",
                tabBarStyle: {
                    backgroundColor: "#221C70",
                    borderTopWidth: 0,
                    height: 60 + bottom,
                    paddingBottom: bottom,
                    paddingTop: 8,
                    display: isTabBarVisible ? "flex" : "none",
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
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="settings" size={24} color={color} />
                    ),
                }}
            />

            {[
                "notification",
                "documents",
                "mentors",
                "mentees",
                "new-interests",
                "progress-tracker",
                "micro-grant",
                "product-and-services",
                "revitalization-roadmaps",
                "appointments",
            ].map((route) => (
                <Tabs.Screen key={route} name={route} options={{ href: null }} />
            ))}
        </Tabs>
    );
}
