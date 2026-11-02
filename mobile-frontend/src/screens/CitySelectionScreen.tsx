import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  TextStyle,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import { Button } from '@/components/common/Button';
import LoadingScreen from '@/components/common/LoadingScreen';
import CityCard from '@/components/CityCard';
import SearchAnimation from '@/components/SearchAnimation';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { RootStackParamList } from '@/types/navigation';
import { getCities } from '@/services/apiService';
import { Tables } from '@/types/supabase';
import { useTranslation } from 'react-i18next';

type CitySelectionNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CitySelection'
>;

type CityListItem = Pick<
  Tables<'cities'>,
  'id' | 'name_az' | 'name_en' | 'thumbnail_url'
>;

const CitySelectionScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<CitySelectionNavigationProp>();
  const [cities, setCities] = useState<CityListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCities = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const data = await getCities();
      setCities((data ?? []) as CityListItem[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('citySelection.error'),
      );
    } finally {
      if (isPullToRefresh) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) {
      return cities;
    }

    const normalizedQuery = searchQuery.toLowerCase();
    const currentLang = i18n.language;
    return cities.filter((city) => {
      const cityName = currentLang === 'en' 
        ? (city.name_en ?? city.name_az ?? '')
        : (city.name_az ?? city.name_en ?? '');
      return cityName.toLowerCase().includes(normalizedQuery);
    });
  }, [cities, searchQuery, i18n.language]);

  const handleNavigate = useCallback(
    (cityId: string | null | undefined) => {
      if (!cityId) {
        return;
      }

      navigation.navigate('DateSelection', { cityId });
    },
    [navigation],
  );

  const renderCity = useCallback(
    ({ item }: { item: CityListItem }) => (
      <CityCard 
        city={item} 
        onPress={() => handleNavigate(item.id)} 
        style={styles.cityCardItem}
      />
    ),
    [handleNavigate],
  );

  const renderInitialState = () => (
    <SafeAreaView style={styles.initialContainer} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('citySelection.title')}</Text>
          <Text style={styles.subtitle}>{t('citySelection.subtitle')}</Text>
        </View>
        <View style={styles.searchInputContainer}>
          <MaterialIcons 
            name="search" 
            size={24} 
            color={COLORS.secondary} 
            style={styles.searchIcon}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('citySelection.searchPlaceholder')}
            placeholderTextColor={COLORS.secondary}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.animationContainer}>
        <SearchAnimation />
      </View>
    </SafeAreaView>
  );

  if (isLoading) {
    return <LoadingScreen text={t('citySelection.loading')} />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error}
        </Text>
        <Button title={t('citySelection.retry')} onPress={() => fetchCities()} />
      </SafeAreaView>
    );
  }

  // Axtarış sahəsi komponenti
  const renderSearchHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t('citySelection.title')}</Text>
        <Text style={styles.subtitle}>{t('citySelection.subtitle')}</Text>
      </View>
      <View style={styles.searchInputContainer}>
        <MaterialIcons 
          name="search" 
          size={24} 
          color={COLORS.secondary} 
          style={styles.searchIcon}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('citySelection.searchPlaceholder')}
          placeholderTextColor={COLORS.secondary}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            activeOpacity={0.7}
            style={styles.clearButton}
          >
            <MaterialIcons 
              name="clear" 
              size={20} 
              color={COLORS.secondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      {searchQuery.trim().length > 0 && filteredCities.length > 0 && (
        <Text style={styles.resultCount}>
          {filteredCities.length} {t('citySelection.citiesFound')}
        </Text>
      )}
    </View>
  );

  if (!searchQuery.trim()) {
    // If search bar is empty, show the animation screen
    return renderInitialState();
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {renderSearchHeader()}
      <FlatList
        data={filteredCities}
        keyExtractor={(item) => item.id}
        renderItem={renderCity}
        numColumns={1}
        contentContainerStyle={
          filteredCities.length === 0
            ? styles.listEmptyContainer
            : styles.listContent
        }
        onRefresh={() => fetchCities(true)}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons 
              name="search-off" 
              size={48} 
              color={COLORS.secondary} 
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>{t('citySelection.noResultsTitle')}</Text>
            <Text style={styles.emptyText}>
              {t('citySelection.noResultsText')}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: SIZES.padding,
  },
  header: {
    paddingTop: SIZES.padding * 1.5,
    paddingBottom: SIZES.padding * 1.25,
    gap: SIZES.padding * 1.25,
  },
  titleContainer: {
    gap: SIZES.padding * 0.5,
  },
  title: {
    fontSize: FONTS.h1.fontSize,
    fontWeight: FONTS.h1.fontWeight as TextStyle['fontWeight'],
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: SIZES.body * 0.9,
    color: COLORS.secondary,
    fontWeight: '400',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: Platform.OS === 'ios' ? SIZES.padding * 0.75 : SIZES.padding * 0.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  searchIcon: {
    marginRight: SIZES.padding * 0.5,
  },
  clearButton: {
    marginLeft: SIZES.padding * 0.5,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.black,
    paddingVertical: 0,
    ...Platform.select({
      ios: {
        paddingVertical: SIZES.padding * 0.25,
      },
    }),
  },
  listContent: {
    paddingTop: SIZES.padding * 0.5,
    paddingBottom: SIZES.padding * 3,
  },
  listEmptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: SIZES.padding * 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding * 3,
  },
  emptyIcon: {
    marginBottom: SIZES.padding,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: FONTS.h2?.fontSize || SIZES.h2,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: COLORS.black,
    marginBottom: SIZES.padding * 0.5,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: SIZES.body,
    color: COLORS.secondary,
    lineHeight: SIZES.body * 1.5,
    paddingHorizontal: SIZES.padding,
  },
  cityCardItem: {
    marginBottom: SIZES.padding * 1.25,
  },
  resultCount: {
    fontSize: SIZES.body * 0.9,
    color: COLORS.secondary,
    fontWeight: '500' as TextStyle['fontWeight'],
    marginTop: SIZES.padding * 0.5,
  },
  initialContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: SIZES.padding,
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SIZES.padding * 4,
  },
  animationVideo: {
    width: 250,
    height: 250,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
});

export default CitySelectionScreen;
