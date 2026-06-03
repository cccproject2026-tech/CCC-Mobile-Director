import PlaceholderRouteScreen from "@/components/navigation/PlaceholderRouteScreen";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";

/** Redirects to Course Completed where field mentor invites are managed. */
export default function InviteFieldMentorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace({
      pathname: "/(director)/(tabs)/course-completed",
      params: { initialTab: "invited" },
    } as any);
  }, [router]);

  return (
    <PlaceholderRouteScreen
      title="Invite Field Mentor"
      message="Opening course completed list..."
      icon="school-outline"
    />
  );
}
