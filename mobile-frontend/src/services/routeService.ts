import { supabase } from './supabaseClient';
import { RouteResponse } from '@/types/route';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface GenerateRouteParams {
  cityId: string;
  selectedPlaceIds: string[];
  dateRange: DateRange;
  language?: 'az' | 'en';
}

// Define a custom Error class for function-specific issues
export class RouteGenerationError extends Error {
  constructor(message: string, public status: number = 500) {
    super(message);
    this.name = 'RouteGenerationError';
  }
}

/**
 * Calls the 'generate-route' Supabase Edge Function to create a new trip itinerary.
 */
export const generateRoute = async ({
  cityId,
  selectedPlaceIds,
  dateRange,
  language = 'az', // Default to Azerbaijani
}: GenerateRouteParams): Promise<RouteResponse> => {


  try {
    // Use the supabase client to invoke the edge function
    const { data, error } = await supabase.functions.invoke('generate-route', {
      body: {
        cityId: cityId,
        placeIds: selectedPlaceIds,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        language: language,
      },
    });

    if (error) {
      throw new RouteGenerationError(
        `Function invoke error: ${error.message}`,
        500,
      );
    }

    // Check if the function *itself* returned an error property
    if ((data as { error?: string })?.error) {
      throw new RouteGenerationError(
        `Edge Function Error: ${(data as { error: string }).error}`,
        500,
      );
    }

    // Cast the successful data to our RouteResponse type
    return data as RouteResponse;
  } catch (error) {
    console.error('An unexpected error occurred in routeService:', error);
    if (error instanceof RouteGenerationError) {
      throw error;
    }

    throw new RouteGenerationError(
      error instanceof Error ? error.message : 'An unknown error occurred.',
      500,
    );
  }
};
