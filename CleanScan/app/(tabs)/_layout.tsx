import React from 'react';
import { Tabs } from 'expo-router';
import { Icon, IconName } from '@/components/common/Icon';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

/** Bottom tab bar (PRD §8.1): Home, Library, Tools, Settings. */
function tabIcon(name: IconName) {
  return ({ color }: { color: string }) => <Icon name={name} size={22} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: typography.caption },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="library" options={{ title: 'Library', tabBarIcon: tabIcon('library') }} />
      <Tabs.Screen name="tools" options={{ title: 'Tools', tabBarIcon: tabIcon('tools') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings') }} />
    </Tabs>
  );
}
