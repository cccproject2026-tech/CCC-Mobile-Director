import { homeTileStyles } from '@/components/ui/design-system';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ViewStyle,
} from 'react-native';

type Props = {
  itemName: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
  tileStyle?: StyleProp<ViewStyle>;
};

const QuickActionCard: React.FC<Props> = ({ itemName, iconName, route, tileStyle }) => {
  const { width } = useWindowDimensions();
  const compact = width < 375;

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: route as any,
          params: { type: 'home' },
        })
      }
      style={[tileStyle, styles.tileInner]}
    >
      <Ionicons name={iconName} size={compact ? 18 : 20} color="white" />
      <Text style={[homeTileStyles.label, compact && styles.labelCompact]}>{itemName}</Text>
    </TouchableOpacity>
  );
};

export default QuickActionCard;

const styles = StyleSheet.create({
  tileInner: {
    gap: 4,
  },
  labelCompact: {
    fontSize: 10,
    marginTop: 4,
  },
});
