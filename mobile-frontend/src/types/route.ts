export interface RoutePlace {
  placeId: string;
  name: string | null;
  travelTimeToNext: number; // in minutes
  notes: string;
  latitude?: number | null;
  longitude?: number | null;
  category?: string;
}

export interface RouteDay {
  day: number;
  date: string;
  places: RoutePlace[];
  summary: string;
}

export interface EstimatedCost {
  currency: string;
  amount: number;
}

export interface RouteResponse {
  days: RouteDay[];
  tips: string[];
  estimatedCost?: EstimatedCost; // Optional now
}
