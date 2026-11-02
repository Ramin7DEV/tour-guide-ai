import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { RootStackParamList } from '@/types/navigation';
import { COLORS } from '@/constants/theme';
import WelcomeScreen from '@/screens/WelcomeScreen';
import CitySelectionScreen from '@/screens/CitySelectionScreen';
import DateSelectionScreen from '@/screens/DateSelectionScreen';
import CategorySelectionScreen from '@/screens/CategorySelectionScreen';
import PlaceSwipeScreen from '@/screens/PlaceSwipeScreen';
import RouteGenerationScreen from '@/screens/RouteGenerationScreen';
import RouteDisplayScreen from '@/screens/RouteDisplayScreen';

const Stack = createStackNavigator<RootStackParamList>();

type AppNavigatorProps = {
  initialRouteName?: keyof RootStackParamList;
  initialParams?: any;
};

const AppNavigator: React.FC<AppNavigatorProps> = ({
  initialRouteName = 'Welcome',
  initialParams,
}) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CitySelection" component={CitySelectionScreen} />
      <Stack.Screen
        name="DateSelection"
        component={DateSelectionScreen}
        options={{
          headerShown: true,
          headerTitle: 'Səyahət tarixini seçin', // Will be overridden by screen
          headerBackTitleVisible: false,
          headerBackTitle: '', // No text, only arrow
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerTintColor: '#D4AF37', // App primary color (gold)
        }}
      />
      <Stack.Screen
        name="CategorySelection"
        component={CategorySelectionScreen}
        options={{
          headerShown: true,
          headerTitle: 'Kateqoriya seçin',
          headerBackTitleVisible: false,
          headerBackTitle: '',
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerTintColor: '#D4AF37',
        }}
      />
      <Stack.Screen
        name="PlaceSwipe"
        component={PlaceSwipeScreen}
        options={{
          headerShown: true,
          headerTitle: 'Kateqoriya seçin',
          headerBackTitleVisible: false,
          headerBackTitle: '',
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerTintColor: '#D4AF37',
        }}
      />
      <Stack.Screen name="RouteGeneration" component={RouteGenerationScreen} />
      <Stack.Screen
        name="RouteDisplay"
        component={RouteDisplayScreen}
        initialParams={initialRouteName === 'RouteDisplay' ? initialParams : undefined}
        options={{
          gestureEnabled: false, // Disable swipe-back gesture
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
