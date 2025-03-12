// src/navigation/EventsStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventListScreen from '../screens/main/events/EventListScreen';
import EventDetailScreen from '../screens/main/events/EventDetailScreen';
import EventFormScreen from '../screens/main/events/EventFormScreen';

const Stack = createNativeStackNavigator();

export const EventsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventList" component={EventListScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailScreen} />
      <Stack.Screen name="AddEvent" component={EventFormScreen} />
      <Stack.Screen name="EditEvent" component={EventFormScreen} />
    </Stack.Navigator>
  );
};

export default EventsStack;
