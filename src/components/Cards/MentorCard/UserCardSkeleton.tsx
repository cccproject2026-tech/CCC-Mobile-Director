import { roadmapTheme } from '@/components/ui/design-system';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from 'moti/skeleton';

type Layout = 'card' | 'list';

interface UserCardSkeletonProps {
    layout?: Layout;
}

const skeletonColors = ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)'];

export const UserCardSkeleton: React.FC<UserCardSkeletonProps> = ({
    layout = 'card',
}) => {
    if (layout === 'list') {
        return (
            <View style={styles.listContainer}>
                <Skeleton
                    colorMode="dark"
                    radius={10}
                    height={46}
                    width={46}
                    colors={skeletonColors}
                />
                <View style={styles.listInfo}>
                    <Skeleton colorMode="dark" height={16} width="70%" colors={skeletonColors} />
                    <Skeleton colorMode="dark" height={12} width={80} colors={skeletonColors} />
                </View>
                <View style={styles.listIcons}>
                    <Skeleton colorMode="dark" radius={999} height={24} width={24} colors={skeletonColors} />
                    <Skeleton colorMode="dark" radius={999} height={24} width={24} colors={skeletonColors} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.cardRow}>
                <Skeleton
                    colorMode="dark"
                    radius={12}
                    height={64}
                    width={64}
                    colors={skeletonColors}
                />
                <View style={styles.cardInfo}>
                    <Skeleton colorMode="dark" height={16} width="55%" colors={skeletonColors} />
                    <Skeleton colorMode="dark" height={12} width={90} colors={skeletonColors} />
                    <Skeleton colorMode="dark" height={12} width={70} colors={skeletonColors} />
                    <View style={styles.contactPlaceholder}>
                        <Skeleton colorMode="dark" radius={999} height={22} width={22} colors={skeletonColors} />
                        <Skeleton colorMode="dark" radius={999} height={22} width={22} colors={skeletonColors} />
                        <Skeleton colorMode="dark" radius={999} height={22} width={22} colors={skeletonColors} />
                        <Skeleton colorMode="dark" radius={999} height={22} width={22} colors={skeletonColors} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        padding: 12,
        marginBottom: 12,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardInfo: {
        flex: 1,
        gap: 6,
        minWidth: 0,
    },
    contactPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    listContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        padding: 12,
        marginBottom: 10,
    },
    listInfo: {
        flex: 1,
        marginLeft: 12,
        gap: 6,
    },
    listIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});
