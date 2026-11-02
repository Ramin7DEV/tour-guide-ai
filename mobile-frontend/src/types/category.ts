// Category types for the place category system

export interface PlaceCategory {
  id: string;
  name_az: string;
  name_en: string;
  description_az: string | null;
  description_en: string | null;
  icon_name: string | null;
  cover_image_url: string | null;
  display_order: number | null;
  created_at?: string | null;
}

export interface CategoryWithCount extends PlaceCategory {
  place_count: number;
  category_id?: string; // Backend qaytarır
}

// Category IDs as constants for type safety
export const CATEGORY_IDS = {
  HISTORICAL: 'historical',
  RELIGIOUS: 'religious',
  NATURE: 'nature',
  PHOTOGRAPHY: 'photography',
  RESTAURANT: 'restaurant',
  CULTURAL: 'cultural',

  ENTERTAINMENT: 'entertainment',
  ADVENTURE: 'adventure',
} as const;

export type CategoryId = typeof CATEGORY_IDS[keyof typeof CATEGORY_IDS];

