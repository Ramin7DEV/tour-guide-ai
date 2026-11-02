-- Test Data for Category System
-- This adds sample places for Baku city across different categories

-- First, let's update existing Baku places with proper categories
-- Assuming Baku's city_id is 'a1b2c3d4-0001-0001-0001-000000000001' from test_data.sql

-- HISTORICAL PLACES (Tarixi Məkanlar)
INSERT INTO places (city_id, name_az, name_en, category, description_az, description_en, image_url, latitude, longitude, average_visit_duration, price_range, rating) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'İçərişəhər', 'Old City (Icherisheher)', 'historical', 'UNESCO dünya mədəniyyət irsinin bir hissəsi olan qədim məhəllə', 'Ancient neighborhood, part of UNESCO World Heritage Site', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop', 40.3663, 49.8373, 120, 'free', 4.9),
('a1b2c3d4-0001-0001-0001-000000000001', 'Şirvanşahlar Sarayı', 'Palace of Shirvanshahs', 'historical', 'XV əsrə aid möhtəşəm saray kompleksi', 'Magnificent palace complex from the 15th century', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop', 40.3657, 49.8377, 90, 'budget', 4.8),
('a1b2c3d4-0001-0001-0001-000000000001', 'Atəşgah', 'Ateshgah Fire Temple', 'historical', 'Qədim atəşpərəstlər məbədi', 'Ancient Zoroastrian fire temple', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&h=600&fit=crop', 40.4153, 50.0095, 60, 'budget', 4.6);

-- RELIGIOUS PLACES (Dini Məkanlar)
INSERT INTO places (city_id, name_az, name_en, category, description_az, description_en, image_url, latitude, longitude, average_visit_duration, price_range, rating) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'Təzə Pir Məscidi', 'Taza Pir Mosque', 'religious', 'XIV əsrdən qalma ən qədim məscidlərdən biri', 'One of the oldest mosques dating from the 14th century', 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&h=600&fit=crop', 40.3658, 49.8365, 45, 'free', 4.7),
('a1b2c3d4-0001-0001-0001-000000000001', 'Bibi-Heybət Məscidi', 'Bibi-Heybat Mosque', 'religious', 'Tarixi əhəmiyyətli möhtəşəm məscid', 'Historic magnificent mosque', 'https://images.unsplash.com/photo-1584490439839-fca1e8fb3c5c?w=800&h=600&fit=crop', 40.3323, 49.8093, 50, 'free', 4.8);

-- NATURE & PARKS (Təbiət Məkanları)
INSERT INTO places (city_id, name_az, name_en, category, description_az, description_en, image_url, latitude, longitude, average_visit_duration, price_range, rating) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'Dənizkənarı Milli Park', 'National Seaside Park', 'nature', 'Xəzər dənizi sahilində gözəl bulvar', 'Beautiful boulevard along the Caspian Sea', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', 40.3667, 49.8428, 90, 'free', 4.8),
('a1b2c3d4-0001-0001-0001-000000000001', 'Yanardag', 'Yanar Dag (Burning Mountain)', 'nature', 'Təbii qaz yanğısı ilə məşhur dağ', 'Mountain famous for its natural gas fire', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', 40.5018, 49.8912, 40, 'budget', 4.5);

-- PHOTOGRAPHY SPOTS (Foto Məkanları)
INSERT INTO places (city_id, name_az, name_en, category, description_az, description_en, image_url, latitude, longitude, average_visit_duration, price_range, rating) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'Alov Qüllələri', 'Flame Towers', 'photography', 'Bakının simvolu olan müasir göydələnlər', 'Modern skyscrapers, symbol of Baku', 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop', 40.3596, 49.8355, 30, 'free', 4.9),
('a1b2c3d4-0001-0001-0001-000000000001', 'Heydər Əliyev Mərkəzi', 'Heydar Aliyev Center', 'photography', 'Zaha Hadid tərəfindən layihələndirilmiş memarlıq şah əsəri', 'Architectural masterpiece designed by Zaha Hadid', 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800&h=600&fit=crop', 40.3953, 49.8671, 75, 'budget', 4.9);

-- RESTAURANTS (Yeməkxanalar)
INSERT INTO places (city_id, name_az, name_en, category, description_az, description_en, image_url, latitude, longitude, average_visit_duration, price_range, rating) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'Firuze Restaurant', 'Firuze Restaurant', 'restaurant', 'Milli mətbəx və dəniz məhsulları', 'National cuisine and seafood', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', 40.3625, 49.8425, 90, 'moderate', 4.7),
('a1b2c3d4-0001-0001-0001-000000000001', 'Nərgiz Restaurant', 'Nargiz Restaurant', 'restaurant', 'Şəhər mənzərəli xüsusi restoran', 'Elegant restaurant with city views', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop', 40.3698, 49.8356, 100, 'expensive', 4.8);

-- CULTURAL SITES (Mədəni Məkanlar)
INSERT INTO places (city_id, name_az, name_en, category, description_az, description_en, image_url, latitude, longitude, average_visit_duration, price_range, rating) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'Azərbaycan Xalça Muzeyi', 'Azerbaijan Carpet Museum', 'cultural', 'Dünya səviyyəli xalça kolleksiyası', 'World-class carpet collection', 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=600&fit=crop', 40.3613, 49.8409, 80, 'budget', 4.7),
('a1b2c3d4-0001-0001-0001-000000000001', 'Milli Azərbaycan Tarixi Muzeyi', 'National Museum of History of Azerbaijan', 'cultural', 'Azərbaycanın zəngin tarixini əks etdirən muzey', 'Museum reflecting Azerbaijan''s rich history', 'https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=800&h=600&fit=crop', 40.3667, 49.8356, 90, 'budget', 4.6);

-- SHOPPING (Alış-veriş)
INSERT INTO places (city_id, name_az, name_en, category, description_az, description_en, image_url, latitude, longitude, average_visit_duration, price_range, rating) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'Təzə Bazar', 'Taza Bazaar', 'shopping', 'Yerli məhsullar və əl işləri bazarı', 'Local products and handicrafts market', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop', 40.3777, 49.8394, 60, 'budget', 4.5),
('a1b2c3d4-0001-0001-0001-000000000001', 'Park Bulvar', 'Park Bulvar Shopping Center', 'shopping', 'Müasir alış-veriş mərkəzi', 'Modern shopping mall', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop', 40.3631, 49.8427, 120, 'moderate', 4.6);

-- ENTERTAINMENT (Əyləncə)
INSERT INTO places (city_id, name_az, name_en, category, description_az, description_en, image_url, latitude, longitude, average_visit_duration, price_range, rating) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'Dənizkənarı Əyləncə Parkı', 'Seaside Entertainment Park', 'entertainment', 'Ailə əyləncə mərkəzi və attraksionlar', 'Family entertainment center and attractions', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop', 40.3655, 49.8447, 150, 'moderate', 4.7),
('a1b2c3d4-0001-0001-0001-000000000001', 'Baku Eye', 'Baku Eye Ferris Wheel', 'entertainment', 'Şəhər panoramasını seyr etmək üçün nəhəng dönmə çarx', 'Giant ferris wheel for city panorama views', 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&h=600&fit=crop', 40.3625, 49.8427, 30, 'budget', 4.6);

-- ADVENTURE (Macəra)
INSERT INTO places (city_id, name_az, name_en, category, description_az, description_en, image_url, latitude, longitude, average_visit_duration, price_range, rating) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'Qobustan Qoruğu', 'Gobustan Reserve', 'adventure', 'Qədim qaya rəsmləri və palçıq vulkanları', 'Ancient rock carvings and mud volcanoes', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop', 40.0989, 49.3819, 120, 'budget', 4.8);
