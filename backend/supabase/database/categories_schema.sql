-- Category System Schema
-- This adds the place_categories table and updates the places table constraints

-- 1. Update places table category constraint to include new categories
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_category_check;
ALTER TABLE places ADD CONSTRAINT places_category_check 
CHECK (category IN (
  'historical',      -- Tarixi məkanlar
  'religious',       -- Dini məkanlar  
  'nature',          -- Təbiət məkanları
  'restaurant',      -- Yeməkxanalar
  'shopping',        -- Alış-veriş mərkəzləri
  'entertainment',   -- Əyləncə yerləri
  'photography',     -- Foto çəkmək üçün məkanlar
  'cultural',        -- Mədəni məkanlar
  'adventure'        -- Macəra/Ekstrem idman
));

-- 2. Create place_categories table
CREATE TABLE IF NOT EXISTS place_categories (
    id TEXT PRIMARY KEY,  -- 'historical', 'religious', etc.
    name_az TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_az TEXT,
    description_en TEXT,
    icon_name TEXT,  -- Icon name (e.g: 'landmark', 'mosque', 'camera')
    cover_image_url TEXT,  -- Cover image for category card
    display_order INTEGER DEFAULT 0,  -- Display order
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insert category data
INSERT INTO place_categories (id, name_az, name_en, description_az, description_en, icon_name, cover_image_url, display_order) VALUES
('historical', 'Tarixi Məkanlar', 'Historical Sites', 'Tarixi abidələr və qədim yerlər', 'Historical monuments and ancient places', 'landmark', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop', 1),
('religious', 'Dini Məkanlar', 'Religious Sites', 'Məscidlər, kilsələr və müqəddəs yerlər', 'Mosques, churches and sacred places', 'mosque', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&h=600&fit=crop', 2),
('nature', 'Təbiət Məkanları', 'Nature & Parks', 'Parklar, dağlar və gözəl təbiət', 'Parks, mountains and beautiful nature', 'tree', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', 3),
('photography', 'Foto Məkanları', 'Photography Spots', 'Ən gözəl foto çəkmək üçün yerlər', 'Best places for photography', 'camera', 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop', 4),
('restaurant', 'Yeməkxanalar', 'Restaurants', 'Milli və beynəlxalq mətbəx', 'Local and international cuisine', 'restaurant', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', 5),
('cultural', 'Mədəni Məkanlar', 'Cultural Sites', 'Muzeylar, teatrlar və incəsənət', 'Museums, theaters and art', 'palette', 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800&h=600&fit=crop', 6),
('shopping', 'Alış-veriş', 'Shopping', 'Bazarlar və ticarət mərkəzləri', 'Markets and shopping centers', 'shopping-bag', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop', 7),
('entertainment', 'Əyləncə', 'Entertainment', 'Əyləncə parkları və gecə həyatı', 'Amusement parks and nightlife', 'music', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop', 8),
('adventure', 'Macəra', 'Adventure', 'Ekstrem idman və macəra', 'Extreme sports and adventure', 'mountain', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop', 9)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS
ALTER TABLE place_categories ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policy for public read access
CREATE POLICY "Public read access for categories" 
ON place_categories FOR SELECT 
USING (true);

-- 6. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_place_categories_display_order ON place_categories(display_order);

