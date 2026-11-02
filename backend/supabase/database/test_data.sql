-- Test Data for Azerbaijan Tourism App
-- This script adds sample cities and places for testing the MVP flow.

-- 1. CITIES
-- We will define two cities: Baku and Gabala

-- Baku
INSERT INTO public.cities (id, name_az, name_en, description_az, description_en, thumbnail_url, popular_months)
VALUES (
  'a1b2c3d4-0001-0001-0001-000000000001', -- Hardcoded UUID for Baku
  'Bakı',
  'Baku',
  'Küləklər şəhəri, Azərbaycanın paytaxtı.',
  'The city of winds, capital of Azerbaijan.',
  'https://placehold.co/600x400/1a365d/FFFFFF/png?text=Bakı',
  ARRAY[4, 5, 6, 9, 10]
);

-- Gabala
INSERT INTO public.cities (id, name_az, name_en, description_az, description_en, thumbnail_url, popular_months)
VALUES (
  'a1b2c3d4-0002-0002-0002-000000000002', -- Hardcoded UUID for Gabala
  'Qəbələ',
  'Gabala',
  'Azərbaycanın dağlıq turizm bölgəsi.',
  'A mountainous tourism region of Azerbaijan.',
  'https://placehold.co/600x400/D4AF37/000000/png?text=Qəbələ',
  ARRAY[6, 7, 8]
);

-- 2. PLACES
-- We add 4 sample places for Baku (city_id: 'a1b2c3d4-0001-0001-0001-000000000001')
-- This is required to test the PlaceSwipeScreen (min 3 places)
INSERT INTO public.places (city_id, name_az, name_en, category, description_az, image_url, latitude, longitude, average_visit_duration, price_range, rating)
VALUES (
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Qız Qalası',
  'Maiden Tower',
  'historical',
  'Bakının ən qədim simvollarından biri.',
  'https://placehold.co/600x800/D4AF37/000000/png?text=Qız+Qalası',
  40.3662,
  49.8370,
  60,
  'moderate',
  4.8
);

INSERT INTO public.places (city_id, name_az, name_en, category, description_az, image_url, latitude, longitude, average_visit_duration, price_range, rating)
VALUES (
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Heydər Əliyev Mərkəzi',
  'Heydar Aliyev Center',
  'historical',
  'Müasir Bakının memarlıq incisi.',
  'https://placehold.co/600x800/1a365d/FFFFFF/png?text=Heydər+Əliyev+Mərkəzi',
  40.3892,
  49.8687,
  120,
  'moderate',
  4.9
);

INSERT INTO public.places (city_id, name_az, name_en, category, description_az, image_url, latitude, longitude, average_visit_duration, price_range, rating)
VALUES (
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Nizami Küçəsi (Torqovı)',
  'Nizami Street',
  'shopping',
  'Alış-veriş və əyləncə mərkəzi.',
  'https://placehold.co/600x800/333333/FFFFFF/png?text=Nizami+Küçəsi',
  40.3739,
  49.8446,
  90,
  'free',
  4.7
);

INSERT INTO public.places (city_id, name_az, name_en, category, description_az, image_url, latitude, longitude, average_visit_duration, price_range, rating)
VALUES (
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Fəvvarələr Meydanı',
  'Fountains Square',
  'entertainment',
  'Şəhərin mərkəzi görüş yeri.',
  'https://placehold.co/600x800/999999/FFFFFF/png?text=Fəvvarələr+Meydanı',
  40.3725,
  49.8400,
  45,
  'free',
  4.6
);
