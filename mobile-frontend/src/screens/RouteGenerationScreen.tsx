import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import LoadingScreen from '@/components/common/LoadingScreen';
import { COLORS, SIZES } from '@/constants/theme';
import { generateRoute } from '@/services/routeService';
import { getPlacesByCityAndCategory } from '@/services/apiService';
import { RootStackParamList } from '@/types/navigation';
import { useTripStore } from '@/store/useTripStore';
import { useTranslation } from 'react-i18next';

type RouteGenerationRouteProp = RouteProp<
  RootStackParamList,
  'RouteGeneration'
>;
type RouteGenerationNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RouteGeneration'
>;

const RouteGenerationScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<RouteGenerationNavigationProp>();
  const {
    params: { cityId, placeIds, dateRange },
  } = useRoute<RouteGenerationRouteProp>();

  const selectedCategories = useTripStore((state) => state.selectedCategories);

  const loadingTexts = useMemo(() => [
    t('routeGeneration.loading1'),
    t('routeGeneration.loading2'),
    t('routeGeneration.loading3'),
  ], [t]);
  const LOADING_TEXTS_LENGTH = loadingTexts.length;

  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    // Cycle through loading messages while the route is being generated
    const intervalId = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % LOADING_TEXTS_LENGTH);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isGenerating]);

  const handleGenerateRoute = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setLoadingTextIndex(0);

    try {
      // Əgər kateqoriya əsaslı seçim varsa, kateqoriyalardan yerləri çəkək
      let finalPlaceIds = placeIds;

      if (selectedCategories.length > 0) {
        console.log('Fetching places for selected categories:', selectedCategories);
        const allPlaces = await Promise.all(
          selectedCategories.map(categoryId =>
            getPlacesByCityAndCategory(cityId, categoryId)
          )
        );

        // Flatten array və unique place ID-lərini alaq
        const placeObjects = allPlaces.flat();
        finalPlaceIds = [...new Set(placeObjects.map(place => place.id))];

        console.log(`Found ${finalPlaceIds.length} places from ${selectedCategories.length} categories`);
      }

      const route = await generateRoute({
        cityId,
        selectedPlaceIds: finalPlaceIds,
        dateRange,
        language: i18n.language?.startsWith('en') ? 'en' : 'az',
      });

      // Coordinates, names and travel times already come from the database (server-side)
      navigation.replace('RouteDisplay', { route });
    } catch (err) {
      console.error('Failed to generate route:', err);
      // Never show technical details to the user
      setError(t('routeGeneration.error'));
      setIsGenerating(false);
    }
  }, [cityId, placeIds, dateRange, selectedCategories, navigation, t]);

  useEffect(() => {
    handleGenerateRoute();
  }, [handleGenerateRoute]);

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{t('routeGeneration.errorTitle')}</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <View style={styles.buttonWrapper}>
            <Button title={t('routeGeneration.retry')} onPress={handleGenerateRoute} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LoadingScreen text={loadingTexts[loadingTextIndex]} />
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  errorTitle: {
    fontSize: SIZES.h1,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SIZES.padding / 2,
  },
  errorMessage: {
    fontSize: SIZES.body,
    textAlign: 'center',
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
  },
});

export default RouteGenerationScreen;
