// src/navigation/ProjectsStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProjectsScreen from '../screens/main/projects/ProjectListSceen';
import ProjectDetailScreen from '../screens/main/projects/ProjectDetailScreen';
import ProjectFormScreen from '../screens/main/projects/ProjectFormScreen';

const Stack = createNativeStackNavigator();

export const ProjectsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectsList" component={ProjectsScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="AddProject" component={ProjectFormScreen} />
      <Stack.Screen name="EditProject" component={ProjectFormScreen} />
    </Stack.Navigator>
  );
};

export default ProjectsStack;
