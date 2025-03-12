// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import des stacks pour chaque section
import DashboardScreen from '../screens/main/DashboardScreen';
import UsersStack from './UsersStack';
import CoursesStack from './CoursesStack';
import ResourcesStack from './ResourcesStack';
import TeachersStack from './TeachersStack';
import EventsStack from './EventsStack';
import ProjectsStack from './ProjectsStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4B6CB7',
        tabBarInactiveTintColor: '#8C7569',
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 10,
          paddingBottom: insets.bottom + 10,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F0F0F0',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
          tabBarLabel: 'Accueil',
        }}
      />
      
      <Tab.Screen
        name="Courses"
        component={CoursesStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />
          ),
          tabBarLabel: 'Cours',
        }}
      />
      
      <Tab.Screen
        name="Students"
        component={UsersStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
          tabBarLabel: 'Étudiants',
        }}
      />
      
      <Tab.Screen
        name="Teachers"
        component={TeachersStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="school" size={size} color={color} />
          ),
          tabBarLabel: 'Enseignants',
        }}
      />
      
      <Tab.Screen
        name="Resources"
        component={ResourcesStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-multiple" size={size} color={color} />
          ),
          tabBarLabel: 'Ressources',
        }}
      />
      
      <Tab.Screen
        name="Events"
        component={EventsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          ),
          tabBarLabel: 'Événements',
        }}
      />
      
      <Tab.Screen
        name="Projects"
        component={ProjectsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-text" size={size} color={color} />
          ),
          tabBarLabel: 'Projets',
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" size={size} color={color} />
          ),
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
