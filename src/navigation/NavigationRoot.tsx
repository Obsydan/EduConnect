// src/navigation/NavigationRoot.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Import des écrans
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { MainTabNavigator } from './MainTabNavigator'; // Changé de MainDrawerNavigator à MainTabNavigator
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const NavigationRoot = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: 'transparent',
        },
      }}
    >
      {!user ? (
        // Stack d'authentification
        <Stack.Group>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Group>
      ) : (
        // Stack principal
        <Stack.Screen name="MainTab" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};
