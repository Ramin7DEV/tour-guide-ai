import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tables } from '@/types/supabase';
import { CategoryWithCount, PlaceCategory } from '@/types/category';

const CACHE_KEYS = {
  CITIES: '@cache:cities',
  PLACES: '@cache:places',
  CATEGORIES: '@cache:categories',
  ALL_CATEGORIES: '@cache:all_categories',
  CACHE_TIMESTAMP: '@cache:timestamp',
} as const;

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CacheData<T> {
  data: T;
  timestamp: number;
}

/**
 * Cache service for offline support
 * Stores API responses in AsyncStorage with timestamps
 */
export const cacheService = {
  /**
   * Save data to cache with timestamp
   */
  async set<T>(key: string, data: T): Promise<void> {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn(`Failed to cache data for key ${key}:`, error);
    }
  },

  /**
   * Get data from cache if it exists and is not expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) {
        return null;
      }

      const cacheData: CacheData<T> = JSON.parse(cached);
      const now = Date.now();
      const age = now - cacheData.timestamp;

      // Check if cache is expired
      if (age > CACHE_DURATION) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.warn(`Failed to retrieve cache for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Clear all cache data
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.CITIES,
        CACHE_KEYS.PLACES,
        CACHE_KEYS.CACHE_TIMESTAMP,
      ]);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },

  /**
   * Cache cities list
   */
  async setCities(cities: Tables<'cities'>[]): Promise<void> {
    return this.set(CACHE_KEYS.CITIES, cities);
  },

  /**
   * Get cached cities list
   */
  async getCities(): Promise<Tables<'cities'>[] | null> {
    return this.get<Tables<'cities'>[]>(CACHE_KEYS.CITIES);
  },

  /**
   * Cache places by city
   */
  async setPlacesByCity(
    cityId: string,
    places: Tables<'places'>[],
  ): Promise<void> {
    const key = `${CACHE_KEYS.PLACES}:${cityId}`;
    return this.set(key, places);
  },

  /**
   * Get cached places by city
   */
  async getPlacesByCity(
    cityId: string,
  ): Promise<Tables<'places'>[] | null> {
    const key = `${CACHE_KEYS.PLACES}:${cityId}`;
    return this.get<Tables<'places'>[]>(key);
  },

  /**
   * Cache categories by city
   */
  async setCategoriesByCity(
    cityId: string,
    categories: CategoryWithCount[],
  ): Promise<void> {
    const key = `${CACHE_KEYS.CATEGORIES}:${cityId}`;
    return this.set(key, categories);
  },

  /**
   * Get cached categories by city
   */
  async getCategoriesByCity(
    cityId: string,
  ): Promise<CategoryWithCount[] | null> {
    const key = `${CACHE_KEYS.CATEGORIES}:${cityId}`;
    return this.get<CategoryWithCount[]>(key);
  },

  /**
   * Cache places by city and category
   */
  async setPlacesByCityAndCategory(
    cityId: string,
    category: string,
    places: Tables<'places'>[],
  ): Promise<void> {
    const key = `${CACHE_KEYS.PLACES}:${cityId}:${category}`;
    return this.set(key, places);
  },

  /**
   * Get cached places by city and category
   */
  async getPlacesByCityAndCategory(
    cityId: string,
    category: string,
  ): Promise<Tables<'places'>[] | null> {
    const key = `${CACHE_KEYS.PLACES}:${cityId}:${category}`;
    return this.get<Tables<'places'>[]>(key);
  },

  /**
   * Cache all categories metadata
   */
  async setAllCategories(categories: PlaceCategory[]): Promise<void> {
    return this.set(CACHE_KEYS.ALL_CATEGORIES, categories);
  },

  /**
   * Get cached all categories metadata
   */
  async getAllCategories(): Promise<PlaceCategory[] | null> {
    return this.get<PlaceCategory[]>(CACHE_KEYS.ALL_CATEGORIES);
  },
};

