// src/navigation/CoursesStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CourseListScreen from '../screens/main/courses/CourseListScreen';
import CourseDetailScreen from '../screens/main/courses/CourseDetailScreen';
import CourseFormScreen from '../screens/main/courses/CourseFormScreen';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Stack = createStackNavigator();

const CoursesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4B6CB7',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity 
            style={{ paddingLeft: 16 }}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen 
        name="CourseList" 
        component={CourseListScreen} 
        options={({ navigation }) => ({
          title: 'Cours',
          headerLeft: () => null, // Pas de bouton retour sur l'écran principal
        })}
      />
      <Stack.Screen 
        name="CourseDetails" 
        component={CourseDetailScreen}
        options={{ title: 'Détails du cours' }}
      />
      <Stack.Screen 
        name="AddCourse" 
        component={CourseFormScreen}
        options={{ title: 'Ajouter un cours' }}
      />
      <Stack.Screen 
        name="EditCourse" 
        component={CourseFormScreen} 
        options={{ title: 'Modifier le cours' }}
        initialParams={{ isEditing: true }}
      />
    </Stack.Navigator>
  );
};

export default CoursesStack;
