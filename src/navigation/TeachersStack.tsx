// src/navigation/TeachersStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeacherListScreen from '../screens/main/teachers/TeacherListScreen';
import TeacherDetailScreen from '../screens/main/teachers/TeacherDetailScreen';
import TeacherFormScreen from '../screens/main/teachers/TeacherFormScreen';

const Stack = createNativeStackNavigator();

export const TeachersStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherList" component={TeacherListScreen} />
      <Stack.Screen name="TeacherDetails" component={TeacherDetailScreen} />
      <Stack.Screen name="AddTeacher" component={TeacherFormScreen} />
      <Stack.Screen name="EditTeacher" component={TeacherFormScreen} />
    </Stack.Navigator>
  );
};

export default TeachersStack;
