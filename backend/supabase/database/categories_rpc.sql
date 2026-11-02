-- RPC Function: Get categories with place counts for a specific city
-- This function returns only categories that have places in the specified city

CREATE OR REPLACE FUNCTION get_categories_with_counts(p_city_id UUID)
RETURNS TABLE (
    category_id TEXT,
    name_az TEXT,
    name_en TEXT,
    description_az TEXT,
    description_en TEXT,
    icon_name TEXT,
    cover_image_url TEXT,
    place_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.id as category_id,
        pc.name_az,
        pc.name_en,
        pc.description_az,
        pc.description_en,
        pc.icon_name,
        pc.cover_image_url,
        COUNT(p.id) as place_count
    FROM place_categories pc
    LEFT JOIN places p ON p.category = pc.id AND p.city_id = p_city_id
    GROUP BY pc.id, pc.name_az, pc.name_en, pc.description_az, pc.description_en, pc.icon_name, pc.cover_image_url, pc.display_order
    HAVING COUNT(p.id) > 0  -- Only return categories that have places
    ORDER BY pc.display_order;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_categories_with_counts(UUID) TO anon, authenticated;

