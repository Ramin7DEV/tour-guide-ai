-- Base schema: cities, places and user_trips

-- 1. Cities table
CREATE TABLE cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_az TEXT,
    name_en TEXT,
    description_az TEXT,
    description_en TEXT,
    thumbnail_url TEXT,
    images TEXT[],
    popular_months INT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Places table
CREATE TABLE places (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    name_az TEXT,
    name_en TEXT,
    category TEXT CHECK (category IN ('historical', 'nature', 'restaurant', 'shopping', 'entertainment')),
    description_az TEXT,
    description_en TEXT,
    image_url TEXT,
    additional_images TEXT[],
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    average_visit_duration INTEGER, -- in minutes
    opening_hours JSONB,
    price_range TEXT CHECK (price_range IN ('free', 'budget', 'moderate', 'expensive')),
    rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5)
);

-- 3. User trips table (for future use)
CREATE TABLE user_trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Will be linked to auth.users
    city_id UUID REFERENCES cities(id),
    start_date DATE,
    end_date DATE,
    selected_place_ids UUID[],
    generated_route JSONB
);

-- Indexes for performance
CREATE INDEX idx_places_on_city_id ON places(city_id);
CREATE INDEX idx_user_trips_on_user_id ON user_trips(user_id);
CREATE INDEX idx_user_trips_on_city_id ON user_trips(city_id);
