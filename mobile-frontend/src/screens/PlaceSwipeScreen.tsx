import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  View,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import Swiper from 'react-native-deck-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import LoadingScreen from '@/components/common/LoadingScreen';
import CategoryCard from '@/components/CategoryCard';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { RootStackParamList } from '@/types/navigation';
import { CategoryWithCount } from '@/types/category';
import { getCategoriesByCity } from '@/services/apiService';
import { useTripStore } from '@/store/useTripStore';
import { useTranslation } from 'react-i18next';

type PlaceSwipeRouteProp = RouteProp<RootStackParamList, 'PlaceSwipe'>;
type PlaceSwipeNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PlaceSwipe'
>;

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.7;

const SWIPER_ANIMATION_CONFIG = {
  stackSize: 3,
  stackScale: 8,
  stackSeparation: 14,
  swipeAnimationDuration: 200, // Faster = less flash
  stackAnimationFriction: 12, // Higher = smoother
  stackAnimationTension: 80, // Higher = snappier
  secondCardZoom: 0.95,
  secondCardZoom: 0.95,
} as const;

interface CategorySwiperProps {
  cards: CategoryWithCount[];
  renderCard: (card: any) => JSX.Element | null;
  onSwiped: (index: number) => void;
  onSwipedRight: (index: number) => void;
  onSwipedAll: () => void;
  overlayLabels: any;
  keyExtractor: (card: CategoryWithCount) => string;
}

const CategorySwiper = React.memo(({ cards, renderCard, onSwiped, onSwipedRight, onSwipedAll, overlayLabels, keyExtractor }: CategorySwiperProps) => {
  return (
    <Swiper
      cards={cards}
      keyExtractor={keyExtractor}
      renderCard={renderCard}
      onSwiped={onSwiped}
      onSwipedRight={onSwipedRight}
      onSwipedAll={onSwipedAll}
      backgroundColor="transparent"
      cardStyle={styles.cardStyle}
      infinite={false}
      stackSize={SWIPER_ANIMATION_CONFIG.stackSize}
      stackScale={6}
      stackSeparation={12}
      secondCardZoom={SWIPER_ANIMATION_CONFIG.secondCardZoom}
      swipeAnimationDuration={SWIPER_ANIMATION_CONFIG.swipeAnimationDuration}
      stackAnimationFriction={SWIPER_ANIMATION_CONFIG.stackAnimationFriction}
      stackAnimationTension={SWIPER_ANIMATION_CONFIG.stackAnimationTension}
      cardVerticalMargin={SIZES.padding * 0.5}
      cardHorizontalMargin={0}
      overlayLabels={overlayLabels}
      verticalSwipe={false}
      useViewOverflow={false}
      disableBottomSwipe={true}
      disableTopSwipe={true}
    />
  );
});

const PlaceSwipeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<PlaceSwipeNavigationProp>();
  const {
    params: { cityId, startDate, endDate },
  } = useRoute<PlaceSwipeRouteProp>();

  const setCity = useTripStore((state) => state.setCity);
  const setDates = useTripStore((state) => state.setDates);
  const selectedCategories = useTripStore((state) => state.selectedCategories);
  const toggleCategory = useTripStore((state) => state.toggleCategory);
  const resetCategories = useTripStore((state) => state.resetCategories);

  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showInstructions, setShowInstructions] = useState(false);

  // Use ref for selectedCategories to avoid re-creating callbacks
  const selectedCategoriesRef = useRef(selectedCategories);
  useEffect(() => {
    selectedCategoriesRef.current = selectedCategories;
  }, [selectedCategories]);

  // Set header title with translation
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('placeSwipe.categoryTitle'),
    });
  }, [navigation, t]);

  // Animation values for instruction overlay
  const instructionOpacity = useRef(new Animated.Value(0)).current;
  const cardMoveX = useRef(new Animated.Value(0)).current;
  const cardRotate = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayColor = useRef(new Animated.Value(0)).current; // 0 = neutral, 1 = green, -1 = red

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getCategoriesByCity(cityId);
      setCategories(data ?? []);

      // Preload all category images for better performance
      if (data && data.length > 0) {
        const imageUrls = data
          .map(cat => cat.cover_image_url)
          .filter(url => url != null);

        // Prefetch images
        await Image.prefetch(imageUrls);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('placeSwipe.error'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [cityId, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setCity(cityId);
    resetCategories(); // Reset categories when screen params change
    if (startDate || endDate) {
      setDates(
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null,
      );
    }
  }, [cityId, startDate, endDate, setCity, setDates, resetCategories]);

  const startInstructionAnimation = useCallback(() => {
    // Animate the card itself to show swipe interaction with colored overlays
    Animated.sequence([
      // Fade in overlay
      Animated.timing(instructionOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.delay(500),

      // Move card right (swipe right gesture) - GREEN overlay
      Animated.parallel([
        Animated.timing(cardMoveX, {
          toValue: 100,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(cardRotate, {
          toValue: 8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(overlayColor, {
          toValue: 1, // Green
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.25,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),

      // Return to center
      Animated.parallel([
        Animated.timing(cardMoveX, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(cardRotate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(overlayColor, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),

      Animated.delay(300),

      // Move card left (swipe left gesture) - RED overlay
      Animated.parallel([
        Animated.timing(cardMoveX, {
          toValue: -100,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(cardRotate, {
          toValue: -8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(overlayColor, {
          toValue: -1, // Red
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.25,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),

      // Return to center
      Animated.parallel([
        Animated.timing(cardMoveX, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(cardRotate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(overlayColor, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),

      Animated.delay(500),

      // Fade out
      Animated.timing(instructionOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setShowInstructions(false);
      cardMoveX.setValue(0);
      cardRotate.setValue(0);
      overlayOpacity.setValue(0);
      overlayColor.setValue(0);
    });
  }, [instructionOpacity, cardMoveX, cardRotate, overlayOpacity, overlayColor]);

  // Show instructions on every screen load
  useEffect(() => {
    if (!isLoading && categories.length > 0) {
      setShowInstructions(true);
      startInstructionAnimation();
    }
  }, [isLoading, categories.length, startInstructionAnimation]);

  const handleSwipeRight = useCallback(
    (index: number) => {
      const category = categories[index];
      // Use ref to check current selection without adding dependency
      if (category && !selectedCategoriesRef.current.includes(category.id)) {
        // Defer state update to let animation finish and prevent race condition
        setTimeout(() => {
          toggleCategory(category.id);
        }, 100);
      }
    },
    [categories, toggleCategory],
  );

  const handleSwipedAll = useCallback(() => {
    if (selectedCategoriesRef.current.length === 0) {
      // Əgər heç bir kateqoriya seçilməyibsə, bütün kateqoriyaları seçirik
      categories.forEach(cat => toggleCategory(cat.id));
    }

    navigation.navigate('RouteGeneration', {
      cityId,
      placeIds: [], // Kateqoriya əsaslı rota yaradacağıq
      dateRange: {
        startDate,
        endDate,
      },
    });
  }, [navigation, cityId, categories, toggleCategory, startDate, endDate]);

  const handleSwiped = useCallback((index: number) => {
    // Defer state update to let animation finish
    setTimeout(() => {
      setCurrentIndex(index + 1);
    }, 100);
  }, []);

  const progressText = useMemo(() => {
    const total = categories.length;
    if (total === 0) {
      return '0/0';
    }

    const current = Math.min(currentIndex + 1, total);
    return `${current}/${total}`;
  }, [currentIndex, categories.length]);

  const overlayLabels = useMemo(
    () => ({
      left: {
        element: (
          <View style={styles.overlayLabelContainer}>
            <LinearGradient
              colors={['rgba(239, 83, 80, 0.25)', 'rgba(229, 57, 53, 0.20)']}
              style={styles.overlayGradient}
            />
          </View>
        ),
        style: { wrapper: styles.overlayWrapper },
      },
      right: {
        element: (
          <View style={styles.overlayLabelContainer}>
            <LinearGradient
              colors={['rgba(102, 187, 106, 0.25)', 'rgba(76, 175, 80, 0.20)']}
              style={styles.overlayGradient}
            />
          </View>
        ),
        style: { wrapper: styles.overlayWrapper },
      },
    }),
    [],
  );

  const keyExtractor = useCallback((card: CategoryWithCount) => card.id, []);

  const renderCard = useCallback(
    (category?: CategoryWithCount | null, index?: number) => {
      if (!category) {
        return (
          <View style={styles.cardPlaceholder}>
            <Text style={styles.cardPlaceholderText}>{t('placeSwipe.noCategories')}</Text>
          </View>
        );
      }

      const categoryName = i18n.language === 'en' ? category.name_en : category.name_az;
      const categoryDesc = i18n.language === 'en' ? category.description_en : category.description_az;

      return (
        <View style={{ flex: 1 }} key={category.id}>
          <CategoryCard
            key={category.id}
            coverImageUrl={category.cover_image_url}
            name={categoryName}
            description={categoryDesc}
          />
        </View>
      );
    },
    [i18n.language, t],
  );

  if (isLoading) {
    return <LoadingScreen text={t('placeSwipe.loadingCategories')} />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (categories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>{t('placeSwipe.noCategories')}</Text>
          <Text style={styles.emptyStateSubtitle}>
            {t('placeSwipe.noCategoriesSubtitle')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <View style={styles.infoRow}>
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>{progressText}</Text>
              </View>
              <View style={styles.selectionBadge}>
                <Text style={styles.selectedLabel}>{t('placeSwipe.selected')}:</Text>
                <Text style={styles.selectedCount}>{selectedCategories.length}</Text>
              </View>
            </View>
          </View>

          <Animated.View
            style={[
              styles.swiperContainer,
              showInstructions && {
                transform: [
                  { translateX: cardMoveX },
                  {
                    rotate: cardRotate.interpolate({
                      inputRange: [-10, 10],
                      outputRange: ['-10deg', '10deg'],
                    })
                  }
                ]
              }
            ]}
          >
            <CategorySwiper
              cards={categories}
              renderCard={renderCard}
              onSwiped={handleSwiped}
              onSwipedRight={handleSwipeRight}
              onSwipedAll={handleSwipedAll}
              overlayLabels={overlayLabels}
              keyExtractor={keyExtractor}
            />
          </Animated.View>
        </View>
      </SafeAreaView>

      <Modal
        visible={showInstructions}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
      >
        <Animated.View
          style={[
            styles.simpleOverlay,
            { opacity: instructionOpacity }
          ]}
        >
          <View style={styles.helperTextContainer}>
            <Text style={styles.helperText}>{t('placeSwipe.helperText')}</Text>
            <Text style={styles.helperSubtext}>{t('placeSwipe.helperSubtext')}</Text>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding * 0.75,
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SIZES.padding,
  },
  progressBadge: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    paddingHorizontal: SIZES.padding * 1.25,
    paddingVertical: SIZES.padding * 0.5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  progressText: {
    fontSize: SIZES.body * 0.9,
    color: COLORS.black,
    fontWeight: '700',
  },
  selectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    paddingHorizontal: SIZES.padding * 1.25,
    paddingVertical: SIZES.padding * 0.5,
    gap: SIZES.padding * 0.5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  selectedLabel: {
    fontSize: SIZES.body * 0.9,
    color: COLORS.secondary,
    fontWeight: '400',
  },
  selectedCount: {
    fontSize: SIZES.body * 0.9,
    color: COLORS.primary,
    fontWeight: '700',
  },
  swiperContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingTop: SIZES.padding * 0.5,
    paddingBottom: SIZES.padding,
    minHeight: 0,
  },
  cardStyle: {
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
  },
  cardPlaceholder: {
    flex: 1,
    borderRadius: SIZES.radius * 2,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  cardPlaceholderText: {
    color: COLORS.secondary,
    fontSize: SIZES.body,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
  },
  emptyStateTitle: {
    fontSize: FONTS.h1.fontSize,
    fontWeight: FONTS.h1.fontWeight as TextStyle['fontWeight'],
    color: COLORS.black,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
    gap: SIZES.padding,
  },
  errorText: {
    textAlign: 'center',
    fontSize: SIZES.body,
    color: COLORS.secondary,
  },
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SIZES.radius * 2,
    overflow: 'hidden',
  },
  overlayLabelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SIZES.radius * 2,
  },
  simpleOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9999,
  },
  helperTextContainer: {
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding * 1.5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: SIZES.radius * 2,
    marginHorizontal: SIZES.padding,
  },
  helperText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
    letterSpacing: 0.5,
  },
  helperSubtext: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  cardTutorialOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SIZES.radius * 2,
    zIndex: 1,
  },
});

export default PlaceSwipeScreen;
