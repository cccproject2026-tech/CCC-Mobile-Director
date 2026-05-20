import { CommonCard, HomeSectionHeader } from "@/components/ui/design-system";
import { useCompletedPastorsCount } from "@/hooks/useCompletionWorkflow";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { ActionCard, Icons } from "../Cards/ActionCard";
const ActionCardSection: React.FC = () => {
    const router = useRouter();
    const { data: completedCount, isLoading } = useCompletedPastorsCount();

    return (
        <CommonCard>
            <HomeSectionHeader
                icon="notifications-outline"
                title="Recent Activity"
                subtitle="Latest updates across your network."
            />
            <View style={styles.listContainer}>
                <ActionCard
                    icon={Icons.ribbon}
                    title="Course Completed"
                    count={isLoading ? undefined : (completedCount ?? 0)}
                    onPress={() =>
                        router.push("/(director)/(tabs)/course-completed" as any)
                    }
                />
                <ActionCard
                    icon={Icons.school}
                    title="Invite to be a Field Mentor"
                    onPress={() =>
                        router.push("/(director)/(tabs)/course-completed" as any)
                    }
                />
            </View>
        </CommonCard>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        gap: 10,
    },
});

export default ActionCardSection;
