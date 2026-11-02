import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface State {
  cityId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  selectedPlaces: string[];
  selectedCategories: string[];
}

interface Actions {
  setCity: (id: string | null) => void;
  setDates: (start: Date | null, end: Date | null) => void;
  togglePlace: (placeId: string) => void;

  toggleCategory: (categoryId: string) => void;
  resetCategories: () => void;
}

type TripStore = State & Actions;

export const useTripStore = create<TripStore>()(
  devtools(
    (set, get) => ({
      // State
      cityId: null,
      startDate: null,
      endDate: null,
      selectedPlaces: [],
      selectedCategories: [],

      // Actions
      setCity: (id: string | null) => {
        set({ cityId: id });
      },

      setDates: (start: Date | null, end: Date | null) => {
        set({ startDate: start, endDate: end });
      },

      togglePlace: (placeId: string) => {
        const { selectedPlaces } = get();
        if (selectedPlaces.includes(placeId)) {
          // Remove place if already selected
          set({
            selectedPlaces: selectedPlaces.filter(id => id !== placeId)
          });
        } else {
          // Add place if not selected
          set({
            selectedPlaces: [...selectedPlaces, placeId]
          });
        }
      },

      toggleCategory: (categoryId: string) => {
        const { selectedCategories } = get();
        if (selectedCategories.includes(categoryId)) {
          // Remove category if already selected
          set({
            selectedCategories: selectedCategories.filter(id => id !== categoryId)
          });
        } else {
          // Add category if not selected
          set({
            selectedCategories: [...selectedCategories, categoryId]
          });
        }
      },

      resetCategories: () => {
        set({ selectedCategories: [] });
      },
    }),
    {
      name: 'trip-store',
    }
  )
);
