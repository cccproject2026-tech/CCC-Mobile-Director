import {
  HomeCardHeader,
  HomeGridTile,
  resolveSectionIconColor,
  useHomeGridLayout,
} from '@/components/ui/design-system';
import AddUserSection from '@/components/Home/AddUserSection';
import { useAuthStore } from '@/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type TileItem = {
  id: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  route?: string;
  params?: Record<string, string>;
  action?: string;
  accentKey?: string;
};

type Props = {
  title: string;
  desciption: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  data: TileItem[];
  modelOpen?: () => void;
  onCdpPress?: () => void;
};

const NewHomeScreenCard: React.FC<Props> = ({
  title,
  desciption,
  iconName,
  iconColor,
  data,
  modelOpen,
  onCdpPress,
}) => {
  const { user } = useAuthStore();
  const resolvedIconColor = iconColor ?? resolveSectionIconColor(title);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const { gridStyle, onGridLayout, getTileStyle } = useHomeGridLayout(data.length);
  const userId = (user as { id?: string; _id?: string })?.id ?? (user as { _id?: string })?._id;
  const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Personal Notes';
  const isNotesOrUser = title === 'Directors Notes' || title === 'New User';

  const handleTilePress = (item: TileItem) => {
    if (item?.title === 'Create New Roadmap') {
      modelOpen?.();
      return;
    }
    if (item?.action === 'cdp' || String(item?.title ?? '').includes('CDP')) {
      onCdpPress?.();
      return;
    }
    if (!item?.route) {
      return;
    }
    router.push({
      pathname: item.route as any,
      params: item.params as any,
    });
  };

  return (
    <View style={styles.container as ViewStyle}>
      <HomeCardHeader
        title={title}
        subtitle={desciption}
        iconName={iconName}
        iconColor={resolvedIconColor}
      />

      {!isNotesOrUser ? (
        <View style={gridStyle} onLayout={onGridLayout}>
          {data.map((item, index) => (
            <HomeGridTile
              key={item.id}
              iconName={item.iconName}
              label={item.title}
              accentKey={item.accentKey}
              onPress={() => handleTilePress(item)}
              style={getTileStyle(index)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.addUserContainer}>
          {title === 'Directors Notes' ? (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(director)/(tabs)/profile/personal-notes/new-note',
                  params: { userName, userId },
                })
              }
              style={styles.textInputContanier}
            >
              <Text style={styles.addNoteText}>Add a New Note</Text>
              <Ionicons
                name="add-circle-outline"
                size={22}
                color="#0F3B5C"
                style={styles.addIcon}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setShowAddUserForm(!showAddUserForm)}
              style={[
                styles.textInputContanier,
                { marginBottom: showAddUserForm ? 10 : 0 },
              ]}
            >
              <Text style={styles.addNoteText}>
                {showAddUserForm ? 'Close User Form' : 'Add New User'}
              </Text>
              <Ionicons
                name={showAddUserForm ? 'close-outline' : 'add-circle-outline'}
                size={22}
                color="#0F3B5C"
                style={styles.addIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {title === 'New User' && showAddUserForm && (
        <AddUserSection onUserCreated={() => setShowAddUserForm(false)} />
      )}
    </View>
  );
};

export default NewHomeScreenCard;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 10,
  },
  textInputContanier: {
    maxWidth: 280,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E7EE',
    marginTop: 12,
  },
  addNoteText: {
    fontWeight: '500',
    fontSize: 14,
    color: '#0F3B5C',
  },
  addIcon: {
    backgroundColor: '#E0E7EE',
    borderRadius: 20,
  },
  addUserContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
});
