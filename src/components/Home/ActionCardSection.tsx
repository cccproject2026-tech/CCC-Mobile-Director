import { CommonCard, HomeSectionHeader } from "@/components/ui/design-system";
import { StyleSheet, View } from "react-native";
import { ActionCard, Icons } from "../Cards/ActionCard";

const ActionCardSection: React.FC = () => {
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
                    count={5}
                    onPress={() => console.log('Course Completed pressed')}
                />
                <ActionCard
                    icon={Icons.school}
                    title="Invite to be a Field Mentor"
                    onPress={() => console.log('Field Mentor pressed')}
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
