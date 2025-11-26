import { Colors } from "@/constants/Colors";
import { Skeleton } from "moti/skeleton";
import { StyleSheet, View } from "react-native";

export const InterestCardSkeleton = () => {
    return (
        <View style={styles.card}>
            {/* Avatar */}
            <Skeleton
                colorMode="light"
                radius={999}
                height={48}
                width={48}
                colors={["#dbe9f5", "#b9d4e6"]}
            />

            {/* Text Block */}
            <View style={styles.textBlock}>
                <Skeleton
                    colorMode="light"
                    height={16}
                    width={'80%'}
                    colors={["#dbe9f5", "#b9d4e6"]}
                />
                <Skeleton
                    colorMode="light"
                    height={14}
                    width={'65%'}
                    colors={["#dbe9f5", "#b9d4e6"]}
                />
            </View>

            {/* Right placeholder (like the time text) */}
            <Skeleton
                colorMode="light"
                height={20}
                width={50}   // wider than before
                radius={8}
                colors={["#dbe9f5", "#b9d4e6"]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        width: '100%',
        backgroundColor: Colors.lightBlue,
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
        gap: 12,
    },
    textBlock: {
        flex: 1,
        gap: 6,
        minWidth: 0,
    },
});
