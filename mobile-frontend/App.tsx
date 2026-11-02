import 'react-native-reanimated';

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoadingScreen from '@/components/common/LoadingScreen';
import AppNavigator from '@/navigation/AppNavigator';
import { COLORS } from '@/constants/theme';
import { RootStackParamList } from '@/types/navigation';
import { initAnalytics } from '@/services/analytics';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import OfflineBanner from '@/components/common/OfflineBanner';
import '@/i18n/config'; // Initialize i18n

// Bütün development xəbərdarlıqlarını söndür
LogBox.ignoreAllLogs(true);

// Initialize analytics
initAnalytics();

export default function App() {
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>('Welcome');
  const [initialParams, setInitialParams] = useState<any>(undefined);
  const networkStatus = useNetworkStatus();

  useEffect(() => {
    const checkInitialRoute = async () => {
      const startTime = Date.now();
      const minLoadingTime = 2000; // Minimum 2 seconds to show loading animation

      try {
        // Check for saved route first
        const savedRoute = await AsyncStorage.getItem('@tour_app:saved_route');
        if (savedRoute) {
          const routeData = JSON.parse(savedRoute);
          setInitialRoute('RouteDisplay');
          setInitialParams({ route: routeData });
        }

        // If no saved route, check onboarding status
        // The app always starts on the Welcome screen. To skip it after the first launch, read an
        // 'onboardingCompleted' flag from AsyncStorage here and start on 'CitySelection' when it is set.
      } catch (error) {
        console.error('Failed to check initial route:', error);
      } finally {
        // Ensure loading screen shows for at least minLoadingTime
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

        setTimeout(() => {
          setIsCheckingOnboarding(false);
        }, remainingTime);
      }
    };

    checkInitialRoute();
  }, []);

  if (isCheckingOnboarding) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <LoadingScreen />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <NavigationContainer
            onStateChange={(state) => {
              // Optional: Analytics tracking
            }}
          >
            <OfflineBanner />
            <AppNavigator
              initialRouteName={initialRoute}
              initialParams={initialParams}
            />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
