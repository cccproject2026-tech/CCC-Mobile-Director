import { roadmapTheme } from "@/components/ui/design-system";
import { Skeleton } from "moti/skeleton";
import { StyleSheet, View } from "react-native";

const skeletonColors = ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.06)"];

export const InterestCardSkeleton = () => {
    return (
        <View style={styles.card}>
            <Skeleton
                colorMode="dark"
                radius={999}
                height={48}
                width={48}
                colors={skeletonColors}
            />

            <View style={styles.textBlock}>
                <Skeleton
                    colorMode="dark"
                    height={16}
                    width={'80%'}
                    colors={skeletonColors}
                />
                <Skeleton
                    colorMode="dark"
                    height={14}
                    width={'65%'}
                    colors={skeletonColors}
                />
            </View>

            <Skeleton
                colorMode="dark"
                height={20}
                width={50}
                radius={8}
                colors={skeletonColors}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        width: '100%',
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderRadius: 14,
        padding: 10,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        gap: 12,
    },
    textBlock: {
        flex: 1,
        gap: 6,
        minWidth: 0,
    },
});
