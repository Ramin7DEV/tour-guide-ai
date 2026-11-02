import { supabase } from './supabaseClient'; // Import our configured client
import { cacheService } from './cacheService';
import NetInfo from '@react-native-community/netinfo';
import { Tables } from '@/types/supabase';
import { CategoryWithCount, PlaceCategory } from '@/types/category';

/**
 * Fetches a list of all cities.
 * Uses cache when offline, updates cache when online.
 */
export const getCities = async (): Promise<Tables<'cities'>[]> => {
  const networkState = await NetInfo.fetch();
  const isOnline = networkState.isConnected && networkState.isInternetReachable;

  // Try to get from cache first if offline
  if (!isOnline) {
    const cached = await cacheService.getCities();
    if (cached) {

      return cached;
    }
    throw new Error('No internet connection and no cached data available');
  }

  try {
    const { data, error: queryError } = await supabase
      .from('cities')
      .select('*'); // Select all columns to match Tables<'cities'>

    if (queryError) {
      console.error('Error fetching cities:', queryError.message);
      console.error('Full error details:', JSON.stringify(queryError, null, 2));
      // Try cache as fallback
      const cached = await cacheService.getCities();
      if (cached) {

        return cached;
      }
      throw new Error(queryError.message);
    }

    // Update cache with fresh data
    if (data) {
      await cacheService.setCities(data);
    }

    return data || [];
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    // Try cache as last resort
    const cached = await cacheService.getCities();
    if (cached) {

      return cached;
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Fetches all places for a specific city.
 * Uses cache when offline, updates cache when online.
 *
 * @param cityId The UUID of the city.
 */
export const getPlacesByCity = async (cityId: string): Promise<Tables<'places'>[]> => {
  if (!cityId) {
    throw new Error('City ID is required to fetch places.');
  }

  const networkState = await NetInfo.fetch();
  const isOnline = networkState.isConnected && networkState.isInternetReachable;

  // Try to get from cache first if offline
  if (!isOnline) {
    const cached = await cacheService.getPlacesByCity(cityId);
    if (cached) {

      return cached;
    }
    throw new Error('No internet connection and no cached data available');
  }

  try {
    const { data, error: queryError } = await supabase
      .from('places')
      .select('*') // Get all details for places
      .eq('city_id', cityId);

    if (queryError) {
      console.error(`Error fetching places for city ${cityId}:`, queryError.message);
      // Try cache as fallback
      const cached = await cacheService.getPlacesByCity(cityId);
      if (cached) {

        return cached;
      }
      throw new Error(queryError.message);
    }

    // Update cache with fresh data
    if (data) {
      await cacheService.setPlacesByCity(cityId, data);
    }

    return data || [];
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    // Try cache as last resort
    const cached = await cacheService.getPlacesByCity(cityId);
    if (cached) {

      return cached;
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Fetches all categories with place counts for a specific city.
 * Only returns categories that have at least one place in the city.
 * Uses cache when offline, updates cache when online.
 *
 * @param cityId The UUID of the city.
 */
export const getCategoriesByCity = async (cityId: string): Promise<CategoryWithCount[]> => {
  if (!cityId) {
    throw new Error('City ID is required to fetch categories.');
  }

  const networkState = await NetInfo.fetch();
  const isOnline = networkState.isConnected && networkState.isInternetReachable;

  // Try to get from cache first if offline
  if (!isOnline) {
    const cached = await cacheService.getCategoriesByCity(cityId);
    if (cached) {

      return cached;
    }
    throw new Error('No internet connection and no cached data available');
  }

  try {
    const { data, error: queryError } = await supabase
      .rpc('get_categories_with_counts', {
        p_city_id: cityId
      });

    if (queryError) {
      console.error(`Error fetching categories for city ${cityId}:`, queryError.message);
      // Try cache as fallback
      const cached = await cacheService.getCategoriesByCity(cityId);
      if (cached) {

        return cached;
      }
      throw new Error(queryError.message);
    }

    // Map category_id to id for consistency
    const mappedData = data?.map((cat: any) => ({
      ...cat,
      id: cat.category_id || cat.id,
    })) || [];

    // Update cache with fresh data
    if (mappedData) {
      await cacheService.setCategoriesByCity(cityId, mappedData);
    }

    return mappedData;
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    // Try cache as last resort
    const cached = await cacheService.getCategoriesByCity(cityId);
    if (cached) {

      return cached;
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Fetches places by city and category.
 * Uses cache when offline, updates cache when online.
 *
 * @param cityId The UUID of the city.
 * @param category The category identifier (e.g., 'historical', 'religious').
 */
export const getPlacesByCityAndCategory = async (
  cityId: string,
  category: string
): Promise<Tables<'places'>[]> => {
  if (!cityId) {
    throw new Error('City ID is required to fetch places.');
  }
  if (!category) {
    throw new Error('Category is required to fetch places.');
  }

  const networkState = await NetInfo.fetch();
  const isOnline = networkState.isConnected && networkState.isInternetReachable;

  const cacheKey = `${cityId}_${category}`;

  // Try to get from cache first if offline
  if (!isOnline) {
    const cached = await cacheService.getPlacesByCityAndCategory(cityId, category);
    if (cached) {

      return cached;
    }
    throw new Error('No internet connection and no cached data available');
  }

  try {
    const { data, error: queryError } = await supabase
      .from('places')
      .select('*')
      .eq('city_id', cityId)
      .eq('category', category)
      .order('rating', { ascending: false });

    if (queryError) {
      console.error(`Error fetching places for city ${cityId} and category ${category}:`, queryError.message);
      // Try cache as fallback
      const cached = await cacheService.getPlacesByCityAndCategory(cityId, category);
      if (cached) {

        return cached;
      }
      throw new Error(queryError.message);
    }

    // Update cache with fresh data
    if (data) {
      await cacheService.setPlacesByCityAndCategory(cityId, category, data);
    }

    return data || [];
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    // Try cache as last resort
    const cached = await cacheService.getPlacesByCityAndCategory(cityId, category);
    if (cached) {

      return cached;
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Fetches all category metadata.
 * Uses cache when offline, updates cache when online.
 */
export const getAllCategories = async (): Promise<PlaceCategory[]> => {
  const networkState = await NetInfo.fetch();
  const isOnline = networkState.isConnected && networkState.isInternetReachable;

  // Try to get from cache first if offline
  if (!isOnline) {
    const cached = await cacheService.getAllCategories();
    if (cached) {

      return cached;
    }
    throw new Error('No internet connection and no cached data available');
  }

  try {
    const { data, error: queryError } = await supabase
      .from('place_categories')
      .select('*')
      .order('display_order');

    if (queryError) {
      console.error('Error fetching all categories:', queryError.message);
      // Try cache as fallback
      const cached = await cacheService.getAllCategories();
      if (cached) {

        return cached;
      }
      throw new Error(queryError.message);
    }

    // Update cache with fresh data
    if (data) {
      await cacheService.setAllCategories(data);
    }

    return data || [];
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    // Try cache as last resort
    const cached = await cacheService.getAllCategories();
    if (cached) {

      return cached;
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
};
