// backend/supabase/functions/generate-route/index.ts

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Define the expected request and place structures
interface ReqPayload {
  cityId: string;
  placeIds: string[];
  startDate: string;
  endDate: string;
  language: "az" | "en";
}

interface PlaceDetails {
  id: string;
  name_az: string | null;
  name_en: string | null;
  description_az: string | null;
  description_en: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  average_visit_duration: number | null;
  rating: number | null;
}

// All via OpenRouter: Gemma 4 31B primary, Gemma 4 26B fallback, tried alternately.
interface ModelConfig {
  id: string;
  timeoutMs: number;
  extraBody: Record<string, unknown>;
}
// Gemma typically answers in ~30-35s, so it gets a generous timeout
const PRIMARY: ModelConfig = {
  id: "google/gemma-4-31b-it",
  timeoutMs: 55_000,
  extraBody: { reasoning: { enabled: false } }, // thinking adds latency without improving this task
};
// Smaller, faster Gemma 4 (MoE, 4B active) — same family, so tone and language quality stay consistent
const FALLBACK: ModelConfig = {
  id: "google/gemma-4-26b-a4b-it",
  timeoutMs: 40_000,
  extraBody: { reasoning: { enabled: false } },
};
const ATTEMPT_ORDER = [PRIMARY, FALLBACK, PRIMARY, FALLBACK];
// Edge Functions are killed at 150s; stop starting new attempts well before that
const TOTAL_BUDGET_MS = 140_000;
const MIN_ATTEMPT_MS = 10_000;
const MAX_PLACES = 12;
const MAX_DAYS = 5;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Each request can cost up to four model calls, so the number of requests is capped
// Only positive whole numbers are accepted; anything else falls back to the default instead of disabling the cap
const limitFromEnv = (name: string, fallback: number): number => {
  const value = Number(Deno.env.get(name));
  return Number.isInteger(value) && value > 0 ? value : fallback;
};
const LIMIT_PER_HOUR = limitFromEnv("ROUTE_LIMIT_PER_HOUR", 5); // per client
const LIMIT_PER_DAY = limitFromEnv("ROUTE_LIMIT_PER_DAY", 300); // everyone together

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// The caller is identified by a salted hash of the IP, so no raw address is stored
async function clientKeyFrom(req: Request): Promise<string> {
  const ip = req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const salt = Deno.env.get("QUOTA_SALT") ?? "tour-app";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Inclusive list of YYYY-MM-DD dates between start and end
function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const d = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (d <= last && dates.length < MAX_DAYS) {
    dates.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return dates;
}

// Round-robin across categories so the route is diverse, best-rated first
function selectPlaces(places: PlaceDetails[]): PlaceDetails[] {
  if (places.length <= MAX_PLACES) return places;

  const groups = new Map<string, PlaceDetails[]>();
  [...places]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .forEach((p) => {
      const cat = p.category ?? "other";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(p);
    });

  const selected: PlaceDetails[] = [];
  const queues = Array.from(groups.values());
  for (let i = 0; selected.length < MAX_PLACES && queues.some((q) => q.length); i++) {
    const q = queues[i % queues.length];
    if (q.length) selected.push(q.shift()!);
  }
  return selected;
}

// Driving-time estimate from straight-line distance: ×1.3 road winding, city vs highway speed, +5 min parking
function travelMinutes(a: PlaceDetails, b: PlaceDetails): number {
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) return 0;
  const rad = (d: number) => (Number(d) * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  const km = 2 * 6371 * Math.asin(Math.sqrt(h));
  const roadKm = km * 1.3;
  const kmh = roadKm < 10 ? 25 : 55;
  return Math.round((roadKm / kmh) * 60 + 5);
}

// Models sometimes wrap JSON in ```json fences or add text around it
function extractJson(text: string): any {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("AI response contains no JSON object");
  return JSON.parse(text.slice(start, end + 1));
}

async function callChat(model: ModelConfig, prompt: string, timeoutMs: number): Promise<any> {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Azerbaijan Tour Guide",
    },
    body: JSON.stringify({
      model: model.id,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 4096, // a 5-day route is ~2k tokens; also caps cost per request
      response_format: { type: "json_object" },
      ...model.extraBody,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty response");
  const parsed = extractJson(content);
  if (!Array.isArray(parsed?.days) || parsed.days.length === 0) throw new Error("response has no days");
  return parsed;
}

async function generateWithFallback(prompt: string): Promise<{ result: any; model: string; attempt: number }> {
  const deadline = Date.now() + TOTAL_BUDGET_MS;

  for (const [i, model] of ATTEMPT_ORDER.entries()) {
    const remaining = deadline - Date.now();
    if (remaining < MIN_ATTEMPT_MS) break;
    try {
      const result = await callChat(model, prompt, Math.min(model.timeoutMs, remaining));
      return { result, model: model.id, attempt: i + 1 };
    } catch (e) {
      console.error(`Attempt ${i + 1}/${ATTEMPT_ORDER.length} (${model.id}) failed: ${(e as Error).message}`);
    }
  }
  throw new Error("All AI providers failed");
}

function buildPrompt(places: PlaceDetails[], dates: string[], language: "az" | "en"): string {
  const isAz = language === "az";
  const placeData = places.map((p) => {
    const desc = (isAz ? p.description_az : p.description_en) ?? "";
    return {
      id: p.id,
      name: isAz ? p.name_az : p.name_en,
      description: desc.length > 200 ? desc.slice(0, 200) + "..." : desc,
      category: p.category,
      duration: p.average_visit_duration,
      latitude: p.latitude,
      longitude: p.longitude,
    };
  });

  const languageRule = isAz
    ? `Write ALL text (summary, notes, tips) in Azerbaijani (Azərbaycan dili), using correct Azerbaijani Latin letters (ə, ğ, ı, ö, ş, ü, ç). Natural, fluent Azerbaijani — not a word-by-word translation.`
    : `Write ALL text (summary, notes, tips) in English.`;

  return `
You are an expert local tour guide for Azerbaijan with deep knowledge of its history and culture.

TASK: Build a ${dates.length}-day itinerary using the places below.
DAYS AND DATES (use exactly these): ${JSON.stringify(dates)}
LANGUAGE: ${languageRule}

PLACES (use ONLY these; copy "id" exactly into "placeId"):
${JSON.stringify(placeData)}

RULES:
1. Use every place exactly once. Spread them evenly across the days.
2. Within each day, order places by geographic proximity to minimize travel.
3. "travelTimeToNext": realistic travel minutes to the next place that day (0 for the last place of the day).
4. "notes": ONE specific historical or cultural fact about that exact place (8-14 words). No generic advice.
5. "summary": the day's theme (max 10 words).
6. "tips": exactly 3 atmospheric, experiential tips specific to THIS city/region only — views, walks, local culture. No shop/restaurant names, no prices, no generic advice like "bring water".

Respond with ONLY valid JSON in this shape:
{
  "days": [
    { "day": 1, "date": "YYYY-MM-DD", "summary": "...", "places": [ { "placeId": "uuid", "travelTimeToNext": 15, "notes": "..." } ] }
  ],
  "tips": ["...", "...", "..."]
}
`;
}

// Never trust the model: keep only known places (once each), take names/coords/category from the DB,
// and append any place the model dropped to the last day so the user's selection isn't lost.
function sanitizeRoute(ai: any, places: PlaceDetails[], dates: string[], language: "az" | "en") {
  const byId = new Map(places.map((p) => [p.id, p]));
  const used = new Set<string>();

  const displayName = (p: PlaceDetails) =>
    language === "az"
      ? p.name_az ?? p.name_en
      : p.name_en && p.name_az && p.name_en !== p.name_az && !p.name_en.includes("(")
        ? `${p.name_en} (${p.name_az})`
        : p.name_en ?? p.name_az;

  const toRoutePlace = (p: PlaceDetails, travelTimeToNext: unknown, notes: unknown) => ({
    placeId: p.id,
    name: displayName(p),
    latitude: p.latitude == null ? null : Number(p.latitude),
    longitude: p.longitude == null ? null : Number(p.longitude),
    category: p.category,
    travelTimeToNext: Number.isFinite(Number(travelTimeToNext)) ? Math.max(0, Math.round(Number(travelTimeToNext))) : 0,
    notes: typeof notes === "string" ? notes.trim() : "",
  });

  type RoutePlace = ReturnType<typeof toRoutePlace>;
  const aiDays: any[] = Array.isArray(ai?.days) ? ai.days : [];
  const days = dates.map((date, i) => {
    const aiDay = aiDays[i] ?? {};
    const dayPlaces: RoutePlace[] = (Array.isArray(aiDay.places) ? aiDay.places : [])
      .filter((ap: any) => byId.has(ap?.placeId) && !used.has(ap.placeId))
      .map((ap: any) => {
        used.add(ap.placeId);
        return toRoutePlace(byId.get(ap.placeId)!, ap.travelTimeToNext, ap.notes);
      });
    return {
      day: i + 1,
      date,
      summary: typeof aiDay.summary === "string" ? aiDay.summary.trim() : "",
      places: dayPlaces,
    };
  });

  const missing = places.filter((p) => !used.has(p.id));
  if (missing.length) {
    console.warn(`AI dropped ${missing.length} place(s); appending to last day`);
    days[days.length - 1].places.push(...missing.map((p) => toRoutePlace(p, 0, "")));
  }

  // Travel times come from real coordinates, not the model's guess
  for (const day of days) {
    day.places.forEach((rp, i) => {
      const next = day.places[i + 1];
      rp.travelTimeToNext = next ? travelMinutes(byId.get(rp.placeId)!, byId.get(next.placeId)!) : 0;
    });
  }

  const tips = (Array.isArray(ai?.tips) ? ai.tips : [])
    .filter((t: unknown) => typeof t === "string" && t.trim())
    .slice(0, 3);

  return { days: days.filter((d) => d.places.length > 0), tips };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let payload: ReqPayload;
  try {
    payload = await req.json();
  } catch (_error) {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!Array.isArray(payload.placeIds) || payload.placeIds.length === 0) {
    return json({ error: "At least one place must be selected to generate a route." }, 400);
  }
  if (payload.placeIds.length > 300) {
    return json({ error: "Too many places." }, 400);
  }
  if (!payload.placeIds.every((id) => typeof id === "string" && UUID_RE.test(id))) {
    return json({ error: "Invalid place id." }, 400);
  }
  if (typeof payload.startDate !== "string" || typeof payload.endDate !== "string" ||
      !DATE_RE.test(payload.startDate) || !DATE_RE.test(payload.endDate)) {
    return json({ error: "Invalid date range." }, 400);
  }

  const language: "az" | "en" = payload.language === "en" ? "en" : "az";
  const dates = dateRange(payload.startDate, payload.endDate);
  if (dates.length === 0) {
    return json({ error: "Invalid date range." }, 400);
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Spend cap: refuse before any database read or model call. If the quota cannot be checked, fail closed.
    const { data: allowed, error: quotaError } = await supabaseAdmin.rpc("consume_route_quota", {
      p_client_key: await clientKeyFrom(req),
      p_per_hour: LIMIT_PER_HOUR,
      p_per_day: LIMIT_PER_DAY,
    });
    if (quotaError) throw new Error(`Quota check failed: ${quotaError.message}`);
    if (!allowed) {
      return json({ error: "Too many route requests. Please try again later." }, 429);
    }

    const { data: places, error: dbError } = await supabaseAdmin
      .from("places")
      .select(
        "id, name_az, name_en, description_az, description_en, category, latitude, longitude, average_visit_duration, rating",
      )
      .in("id", payload.placeIds);

    if (dbError) throw new Error(`Supabase DB Error: ${dbError.message}`);
    if (!places || places.length === 0) {
      return json({ error: "No places found for the given IDs" }, 404);
    }

    const selectedPlaces = selectPlaces(places as PlaceDetails[]);
    const prompt = buildPrompt(selectedPlaces, dates, language);

    const started = Date.now();
    const { result, model, attempt } = await generateWithFallback(prompt);
    console.log(`Route generated by ${model} (attempt ${attempt}) in ${Date.now() - started}ms (${selectedPlaces.length} places, ${dates.length} days, ${language})`);

    return json(sanitizeRoute(result, selectedPlaces, dates, language));
  } catch (error) {
    // Full details go to the logs only; the client gets a generic message
    console.error("Error in generate-route function:", (error as Error).message);
    return json({ error: "Route generation failed. Please try again." }, 500);
  }
});
