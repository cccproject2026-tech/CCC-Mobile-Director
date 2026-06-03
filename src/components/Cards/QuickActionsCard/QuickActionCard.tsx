import { HomeGridTile } from '@/components/ui/design-system';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

type Props = {
  itemName: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
  accentKey?: string;
  tileStyle?: StyleProp<ViewStyle>;
};

const QuickActionCard: React.FC<Props> = ({
  itemName,
  iconName,
  route,
  accentKey,
  tileStyle,
}) => {
  return (
    <HomeGridTile
      iconName={iconName}
      label={itemName}
      accentKey={accentKey}
      onPress={() =>
        router.push({
          pathname: route as any,
          params: { type: 'home' },
        })
      }
      style={tileStyle}
    />
  );
};

export default QuickActionCard;
