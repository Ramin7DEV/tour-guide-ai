-- Request log and quota check used by the generate-route Edge Function to cap AI spend.
-- Only the service role can touch the table or call the function.

CREATE TABLE IF NOT EXISTS route_requests (
    id BIGSERIAL PRIMARY KEY,
    client_key TEXT NOT NULL,                       -- salted SHA-256 of the caller's IP, never the IP itself
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_route_requests_key_time ON route_requests (client_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_route_requests_time ON route_requests (created_at DESC);

-- No policies: the anon and authenticated roles get no direct access
ALTER TABLE route_requests ENABLE ROW LEVEL SECURITY;

-- Returns true and records the request when the caller is under both limits, false otherwise.
-- p_per_hour limits one client, p_per_day limits everyone together (the budget cap).
CREATE OR REPLACE FUNCTION consume_route_quota(p_client_key TEXT, p_per_hour INT, p_per_day INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    hourly INT;
    daily INT;
BEGIN
    -- A missing or non-positive limit must refuse the request, never allow it (NULL comparisons are never true)
    IF p_client_key IS NULL OR p_per_hour IS NULL OR p_per_day IS NULL OR p_per_hour < 1 OR p_per_day < 1 THEN
        RETURN FALSE;
    END IF;

    -- Serialize checks so concurrent requests cannot slip past the limits together
    PERFORM pg_advisory_xact_lock(hashtext('consume_route_quota'));

    DELETE FROM route_requests WHERE created_at < now() - interval '2 days';

    SELECT count(*) INTO hourly FROM route_requests
    WHERE client_key = p_client_key AND created_at > now() - interval '1 hour';

    SELECT count(*) INTO daily FROM route_requests
    WHERE created_at > now() - interval '1 day';

    IF hourly >= p_per_hour OR daily >= p_per_day THEN
        RETURN FALSE;
    END IF;

    INSERT INTO route_requests (client_key) VALUES (p_client_key);
    RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION consume_route_quota(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION consume_route_quota(TEXT, INT, INT) TO service_role;
