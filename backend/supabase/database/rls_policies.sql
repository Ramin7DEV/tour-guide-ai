-- Row Level Security (RLS) Policies for Azerbaijan Tourism App
-- These policies enable public read access for cities and places tables

-- Enable RLS on cities table
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access on cities table
CREATE POLICY "Public Read Access for cities" ON cities
    FOR SELECT USING (true);

-- Enable RLS on places table
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access on places table
CREATE POLICY "Public Read Access for places" ON places
    FOR SELECT USING (true);

-- user_trips is not used by the app yet. RLS with no policy denies all direct access with the public anon key.
ALTER TABLE user_trips ENABLE ROW LEVEL SECURITY;
