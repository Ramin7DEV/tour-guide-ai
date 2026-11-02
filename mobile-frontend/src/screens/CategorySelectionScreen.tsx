import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { CategoryWithCount } from '@/types/category';
import { getCategoriesByCity } from '@/services/apiService';
import { COLORS, SIZES } from '@/constants/theme';
import type { RootStackParamList } from '@/types/navigation';

type CategorySelectionRouteProp = RouteProp<RootStackParamList, 'CategorySelection'>;
type CategorySelectionNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CategorySelection'
>;

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 180;

const CategorySelectionScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const route = useRoute<CategorySelectionRouteProp>();
  const navigation = useNavigation<CategorySelectionNavigationProp>();
  const { cityId, startDate, endDate } = route.params;

  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set header title with translation
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('categorySelection.instruction'),
    });
  }, [navigation, t]);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCategoriesByCity(cityId);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('categorySelection.error'));
    } finally {
      setIsLoading(false);
    }
  }, [cityId, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('PlaceSwipe', {
      cityId,
      startDate,
      endDate,
    });
  };

  const renderCategory = ({ item }: { item: CategoryWithCount }) => {
    const categoryName = i18n.language === 'en' ? item.name_en : item.name_az;
    const categoryDesc = i18n.language === 'en' ? item.description_en : item.description_az;

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(item.id || item.category_id || '')}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={{ uri: item.cover_image_url || 'https://placehold.co/800x600' }}
          style={styles.categoryBackground}
          imageStyle={styles.categoryImage}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.gradient}
          >
            <View style={styles.categoryContent}>
              <Text style={styles.categoryName}>{categoryName}</Text>
              <Text style={styles.categoryPlaceCount}>
                {item.place_count} {t('common.places')}
              </Text>
              {categoryDesc && (
                <Text style={styles.categoryDescription} numberOfLines={2}>
                  {categoryDesc}
                </Text>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('categorySelection.noCategories')}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id || item.category_id || ''}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  categoryCard: {
    height: CARD_HEIGHT,
    marginBottom: SIZES.padding,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoryBackground: {
    flex: 1,
  },
  categoryImage: {
    borderRadius: 16,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryContent: {
    padding: SIZES.padding,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  categoryPlaceCount: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error || '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default CategorySelectionScreen;

