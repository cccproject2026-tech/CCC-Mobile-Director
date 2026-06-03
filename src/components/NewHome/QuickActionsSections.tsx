import { CommonCard, HomeCardHeader, useHomeGridLayout } from '../ui/design-system';
import React from 'react';
import { View } from 'react-native';
import QuickActionCard from '../Cards/QuickActionsCard/QuickActionCard';

const quickActionItems = [
  {
    id: '1',
    itemName: 'Assign Mentors',
    iconName: 'people-outline',
    route: '/(director)/(tabs)/mentees',
    accentKey: 'mint',
  },
  {
    id: '2',
    itemName: 'Assign Mentees',
    iconName: 'people-circle-outline',
    route: '/(director)/(tabs)/mentors',
    accentKey: 'sky',
  },
  {
    id: '3',
    itemName: 'Assign RoadMaps',
    iconName: 'layers-outline',
    route: '/(director)/(tabs)/roadmaps',
    accentKey: 'gold',
  },
  {
    id: '4',
    itemName: 'Assign Assessments',
    iconName: 'clipboard-outline',
    route: '/(director)/(tabs)/assessments',
    accentKey: 'violet',
  },
  {
    id: '5',
    itemName: 'Schedule Meeting',
    iconName: 'calendar-number-outline',
    route: '/(director)/(tabs)/appointments',
    accentKey: 'amber',
  },
] as const;

const QuickActionSection = () => {
  const { gridStyle, onGridLayout, getTileStyle } = useHomeGridLayout(
    quickActionItems.length,
    3,
  );

  return (
    <CommonCard>
      <HomeCardHeader
        title="Quick Actions"
        subtitle="Pick up from the step you left off and keep going."
        iconName="grid-outline"
        iconColor="#6FD4BE"
      />
      <View style={gridStyle} onLayout={onGridLayout}>
        {quickActionItems.map((item, index) => (
          <QuickActionCard
            key={item.id}
            itemName={item.itemName}
            iconName={item.iconName}
            route={item.route}
            accentKey={item.accentKey}
            tileStyle={getTileStyle(index)}
          />
        ))}
      </View>
    </CommonCard>
  );
};

export default QuickActionSection;
