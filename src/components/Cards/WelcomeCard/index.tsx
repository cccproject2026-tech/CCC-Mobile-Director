import { isSmallDevice } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { router } from 'expo-router';
type Props = {
    onClick?: () => void;
    onProgressPress?: () => void;
    avatar: any;
    message: string;
    progress?: number;
    bg?: string;
    borderColor?: string;
    compact?: boolean;
};

const WelcomeCard: React.FC<Props> = ({
    avatar,
    message,
    progress,
    bg = '#14517d',
    borderColor = '#fff',
    onClick,
    onProgressPress,
    compact = false,
}) => {
    const showProgress = progress !== undefined && progress >= 0;
    const progressHandler = onProgressPress ?? onClick;
console.log("progress",progress);
    return (
        <View
            style={[
                styles.container as ViewStyle,
                compact ? styles.containerCompact : null,
                { backgroundColor:bg, borderColor:borderColor },
            ]}
        >
            <View style={[styles.content, compact && styles.contentCompact]}>
                <Pressable
                    onPress={onClick}
                    disabled={!onClick}
                    style={({ pressed }) => [onClick && pressed ? styles.pressedOpacity : null]}
                >
                    {avatar ? (
                        <Image
                            source={typeof avatar === 'string' ? { uri: avatar } : avatar}                            
                            style={[styles.avatar, compact && styles.avatarCompact]}
                        />
                    ) : (
                        <View style={[styles.avatar, compact && styles.avatarCompact, styles.avatarPlaceholder]}>
                            <Ionicons
                                name="person-circle-outline"
                                size={compact ? 36 : 44}
                                color="#fff"
                            />
                        </View>
                    )}
                </Pressable>

                <View style={styles.rightColumn}>
                    <View style={styles.viewProgressContainer}>
                        <View>
                    <Pressable
                        onPress={onClick}
                        disabled={!onClick}
                        style={({ pressed }) => [onClick && pressed ? styles.pressedOpacity : null]}
                    >
                        <Text style={[styles.message, compact && styles.messageCompact]}>{message}</Text>
                    </Pressable>
                      <Text style={styles.roleText}>
                                     Director Dashboard
                                 </Text>
                                 </View>
                    {/* <TouchableOpacity style={styles.viewSubContainer} onPress={() => router.push('/(director)/(tabs)/progress-tracker')}>
                        <Text style={styles.viewPrgressTxt}>View Progress</Text>
                    </TouchableOpacity>  */}
</View>
                    {showProgress && (
                        <Pressable
                            onPress={progressHandler}
                            disabled={!progressHandler}
                            style={({ pressed }) => [
                                styles.progressRow,
                                progressHandler && pressed ? styles.pressedOpacity : null,
                            ]}
                        >
                            <Text style={[styles.progressLabel, compact && styles.progressLabelCompact]}>
                                Progress
                            </Text>
                            <View style={styles.progressVisuals}>
                                <View style={[styles.progressContainer, compact && styles.progressContainerCompact]}>
                                    <View style={[styles.progressBar, { width: `${progress || 72.76}%` }]} />
                                </View>
                                <Text style={[styles.progressText, compact && styles.progressTextCompact]}>
                                    {progress || 72.76} %
                                </Text>
                            </View>
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    );
};

export default WelcomeCard;

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 12,
        padding: isSmallDevice ? 16 : 20,
    },
    containerCompact: {
        padding: isSmallDevice ? 10 : 12,
        borderRadius: 12,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 12 : 16,
    },
    contentCompact: {
        gap: isSmallDevice ? 10 : 12,
    },
    rightColumn: {
        flex: 1,
        flexDirection: 'column',
    },
    pressedOpacity: {
        opacity: 0.85,
    },
    avatar: {
        width: isSmallDevice ? 40 : 48,
        height: isSmallDevice ? 40 : 48,
        borderRadius: isSmallDevice ? 20 : 24,
    },
    avatarCompact: {
        width: isSmallDevice ? 36 : 40,
        height: isSmallDevice ? 36 : 40,
        borderRadius: isSmallDevice ? 18 : 20,
    },
    avatarPlaceholder: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        color: '#fff',
        fontWeight: '600',
        fontSize: isSmallDevice ? 16 : 18,
        marginBottom: 8,
    },
    messageCompact: {
        fontSize: isSmallDevice ? 14 : 15,
        marginBottom: 6,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressLabel: {
        color: '#fff',
        fontSize: isSmallDevice ? 14 : 15,
        fontWeight: '500',
        marginRight: 10,
    },
    progressLabelCompact: {
        fontSize: isSmallDevice ? 12 : 13,
        marginRight: 8,
    },
    progressVisuals: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressContainer: {
        height: 8,
        flex: 1,
        backgroundColor: 'rgba(24, 44, 91, 1)',
        borderRadius: 4,
        overflow: 'hidden',
        elevation: 3,
    },
    progressContainerCompact: {
        height: 6,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    progressText: {
        color: '#fff',
        fontSize: isSmallDevice ? 14 : 15,
        fontWeight: '600',
        minWidth: 40,
        textAlign: 'right',
    },
    progressTextCompact: {
        fontSize: isSmallDevice ? 12 : 13,
        minWidth: 36,
    },
    viewProgressContainer:{
        display: "flex",
        flexDirection: "row",
         alignItems: "center",
         justifyContent: "space-between",
         marginBottom:6
    },
    viewSubContainer:{
        borderWidth:0.5,
        borderColor:"#fff",
        paddingHorizontal:6,
        paddingVertical:6,          
        borderRadius:6,
        backgroundColor:"rgba(255,255,255,0.14)",
    },
    viewPrgressTxt:{
        color:"#fff",
        fontSize:12,
        fontWeight:"700"
    },
        roleText: {
        color: "white",
        fontSize: 12,
        fontWeight:'400',
    }
});
