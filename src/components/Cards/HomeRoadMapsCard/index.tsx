import { homeTileStyles, roadmapTheme, useHomeGridLayout } from '@/components/ui/design-system';
import AddUserSection from '@/components/Home/AddUserSection';
import { useAuthStore } from '@/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

type Props = {
  title: string;
  desciption: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  data: any;
  modelOpen?: () => void;
};

const NewHomeScreenCard: React.FC<Props> = ({
  title,
  desciption,
  iconName,
  data,
  modelOpen,
}) => {
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const compact = width < 375;
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const { gridStyle, onGridLayout, getTileStyle } = useHomeGridLayout(data.length);
  const userId = (user as { id?: string; _id?: string })?.id ?? (user as { _id?: string })?._id;
  const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Personal Notes';
  const isNotesOrUser = title === 'Directors Notes' || title === 'New User';

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.headerContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={18} color={roadmapTheme.textPrimary} />
        </View>
        <Text style={[styles.titleText, compact && styles.titleTextCompact]}>{title}</Text>
      </View>
      <Text style={[styles.descriptionText, compact && styles.descriptionTextCompact]}>
        {desciption}
      </Text>

      {!isNotesOrUser ? (
        <View style={gridStyle} onLayout={onGridLayout}>
          {data.map((item: any, index: number) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                if (item?.title === 'Create New Roadmap') {
                  modelOpen?.();
                  return;
                }
                router.push({
                  pathname: item.route as any,
                  params: item.params,
                });
              }}
              style={[getTileStyle(index), styles.tileContent]}
            >
              <Ionicons name={item.iconName} size={compact ? 16 : 18} color="white" />
              <Text style={[homeTileStyles.label, compact && styles.itemNameCompact]}>
                {item.title}
              </Text>
            </TouchableOpacity>
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
                color="black"
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
                color="black"
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
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    flex: 1,
    color: roadmapTheme.textPrimary,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  titleTextCompact: {
    fontSize: 14,
  },
  descriptionText: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  descriptionTextCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  tileContent: {
    gap: 4,
  },
  itemNameCompact: {
    fontSize: 10,
    marginTop: 4,
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
