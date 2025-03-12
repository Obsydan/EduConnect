// src/navigation/ResourcesStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ResourcesListScreen from '../screens/main/resources/ResourcesListScreen';
import ResourceDetailScreen from '../screens/main/resources/ResourceDetailScreen';
import ResourceFormScreen from '../screens/main/resources/ResourceFormScreen';

const Stack = createNativeStackNavigator();

export const ResourcesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ResourcesList" component={ResourcesListScreen} />
      <Stack.Screen name="ResourceDetails" component={ResourceDetailScreen} />
      <Stack.Screen name="AddResource" component={ResourceFormScreen} />
      <Stack.Screen name="EditResource" component={ResourceFormScreen} />
    </Stack.Navigator>
  );
};

export default ResourcesStack;
