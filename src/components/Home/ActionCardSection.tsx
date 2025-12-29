import { StyleSheet, View } from "react-native";
import { ActionCard, Icons } from "../Cards/ActionCard";

const ActionCardSection: React.FC = () => {
    return (
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
    );
};

const styles = StyleSheet.create({
    listContainer: {
        gap: 8,
        // paddingHorizontal: 16,
    },
});

export default ActionCardSection;