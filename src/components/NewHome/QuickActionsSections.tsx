import { CommonCard, HOME_ICON_COLOR, HomeCardHeader, useHomeGridLayout } from '../ui/design-system';
import { useMenteesNavigationStore } from '@/stores/menteesNavigation.store';
import { useMentorsNavigationStore } from '@/stores/mentorsNavigation.store';
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
  const setAssignMentorOnlyMenu = useMenteesNavigationStore((s) => s.setAssignMentorOnlyMenu);
  const setAssignMenteeOnlyMenu = useMentorsNavigationStore((s) => s.setAssignMenteeOnlyMenu);
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
        iconColor={HOME_ICON_COLOR}
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
            routeParams={
              item.id === '1'
                ? { type: 'home', flow: 'assign-mentor' }
                : item.id === '2'
                  ? { type: 'home', flow: 'assign-mentee' }
                  : undefined
            }
            onBeforeNavigate={
              item.id === '1'
                ? () => setAssignMentorOnlyMenu()
                : item.id === '2'
                  ? () => setAssignMenteeOnlyMenu()
                  : undefined
            }
          />
        ))}
      </View>
    </CommonCard>
  );
};

export default QuickActionSection;
