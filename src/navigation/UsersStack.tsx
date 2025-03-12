// src/navigation/UsersStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentListScreen from '../screens/main/students/StudentListScreen';
import StudentDetailScreen from '../screens/main/students/StudentDetailScreen';
import StudentFormScreen from '../screens/main/students/StudentFormScreen';

const Stack = createNativeStackNavigator();

export const UsersStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentList" component={StudentListScreen} />
      <Stack.Screen name="StudentDetails" component={StudentDetailScreen} />
      <Stack.Screen name="AddStudent" component={StudentFormScreen} />
      <Stack.Screen name="EditStudent" component={StudentFormScreen} />
    </Stack.Navigator>
  );
};

export default UsersStack;
