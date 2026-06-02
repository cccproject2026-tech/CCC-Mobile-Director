import { isSmallDevice } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable,TouchableOpacity, StyleSheet, Text, View, ViewStyle, ImageSourcePropType } from 'react-native';

type Props = {
    itemName: any;
    iconName: React.ComponentProps<typeof Ionicons>['name'];
    route:string
};

const QuickActionCard: React.FC<Props> = ({

    itemName,
    iconName,
    route
}) => {


    return (
       <TouchableOpacity
    onPress={() =>
        router.push({
            pathname: route as any,
            params: {
                type: "home",
            },
        })
    }
    style={[
        styles.container as ViewStyle,
    ]}
>
    <Ionicons
        name={iconName}
        size={24}
        color="white"
    />

    <Text style={styles.assignText}>
        {itemName}
    </Text>
</TouchableOpacity>
    );
};

export default QuickActionCard;

const styles = StyleSheet.create({
    container: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
                   backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.14)",
        padding: isSmallDevice ? 7 : 8,
        minHeight: 90,
        borderWidth: 1,
        borderRadius: 12,
        width: "31%",
        marginRight: "2%",
        marginTop: 8
    },
    assignText: {
        color: "white",
        fontSize: isSmallDevice ? 10 : 11,
             fontWeight: "600",
        textAlign: "center",
        width: "100%",
        marginTop:4

    }

});
