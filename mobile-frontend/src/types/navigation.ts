import { StackScreenProps } from '@react-navigation/stack';

export type RootStackParamList = {
  Welcome: undefined;
  CitySelection: undefined;
  DateSelection: { cityId: string };
  CategorySelection: { cityId: string; startDate: string; endDate: string };
  PlaceSwipe: { cityId: string; startDate: string; endDate: string };
  RouteGeneration: {
    cityId: string;
    placeIds: string[];
    dateRange: { startDate: string; endDate: string };
  };
  RouteDisplay: { route: import('./route').RouteResponse };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
