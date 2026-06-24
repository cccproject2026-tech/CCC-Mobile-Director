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
  routeParams?: Record<string, string>;
  onBeforeNavigate?: () => void;
};

const QuickActionCard: React.FC<Props> = ({
  itemName,
  iconName,
  route,
  accentKey,
  tileStyle,
  routeParams,
  onBeforeNavigate,
}) => {
  return (
    <HomeGridTile
      iconName={iconName}
      label={itemName}
      accentKey={accentKey}
      onPress={() => {
        onBeforeNavigate?.();
        router.push({
          pathname: route as any,
          ...(routeParams ? { params: routeParams } : {}),
        });
      }}
      style={tileStyle}
    />
  );
};

export default QuickActionCard;
