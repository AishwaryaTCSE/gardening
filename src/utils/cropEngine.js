const monthIndex = () => new Date().getMonth() + 1;

// Rate limiting and request queue
const requestQueue = [];
let isProcessing = false;
const MAX_CONCURRENT_REQUESTS = 1; // Process one at a time
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
let lastRequestTime = 0;

// Get API key from environment variables with better error handling
const getApiKey = () => {
  const key =
    import.meta.env.VITE_OPENAI_API_KEY ||
    import.meta.env.REACT_APP_OPENAI_API_KEY ||
    '';

  if (!key) {
    console.warn(
      '⚠️ OpenAI API key missing in frontend env. Use the dev proxy instead (recommended).'
    );
  } else if (!key.startsWith('sk-')) {
    console.warn('⚠️ OpenAI API key format looks incorrect. It should start with "sk-"');
  }

  return key;
};

// Rate limiter with queue
const rateLimitedFetch = async (endpoint, options) => {
  return new Promise((resolve, reject) => {
    const executeRequest = async () => {
      try {
        // Enforce minimum time between requests
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
          await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
        }
        
        lastRequestTime = Date.now();
        const response = await fetch(endpoint, options);
        resolve(response);
      } catch (error) {
        reject(error);
      } finally {
        // Process next request in queue
        requestQueue.shift();
        if (requestQueue.length > 0) {
          requestQueue[0]();
        } else {
          isProcessing = false;
        }
      }
    };

    // Add to queue
    requestQueue.push(executeRequest);
    
    // Start processing if not already
    if (!isProcessing && requestQueue.length <= MAX_CONCURRENT_REQUESTS) {
      isProcessing = true;
      executeRequest();
    }
  });
};

// Proxy endpoint (preferred) for local dev / deployments that provide a backend
const AI_PROXY = (import.meta.env.VITE_AI_PROXY || '').trim();
// Allow direct OpenAI calls only if explicitly opted-in (still subject to CORS)
const USE_DIRECT = import.meta.env.VITE_OPENAI_DIRECT === 'true';
const AI_KEY = USE_DIRECT ? getApiKey() : '';
// Enable AI only when we have a proxy path or an opted-in direct key
export const AI_ENABLED = Boolean(AI_PROXY || (USE_DIRECT && AI_KEY));

const baseCrops = [
  { name: "Coffee", temp: [16, 26], humidity: [60, 90], rain: [3, 10], altitude: [600, 2000], water: "Medium", fertilizer: "NPK 15-5-20", yield: "0.8–2.5 t/ha" },
  { name: "Pepper", temp: [18, 30], humidity: [65, 90], rain: [3, 10], altitude: [400, 1800], water: "Medium", fertilizer: "NPK 12-12-18", yield: "2–4 t/ha" },
  { name: "Cardamom", temp: [15, 25], humidity: [70, 95], rain: [5, 12], altitude: [600, 1500], water: "High", fertilizer: "NPK 16-8-24", yield: "0.3–1.2 t/ha" },
  { name: "Arecanut", temp: [20, 32], humidity: [70, 90], rain: [4, 10], altitude: [0, 1000], water: "High", fertilizer: "NPK 12-12-18", yield: "2–4 t/ha" },
  { name: "Tea", temp: [12, 25], humidity: [60, 90], rain: [4, 10], altitude: [800, 2200], water: "High", fertilizer: "NPK 16-8-24", yield: "1–3 t/ha" },
  { name: "Ginger", temp: [20, 30], humidity: [60, 90], rain: [3, 10], altitude: [0, 1500], water: "Medium", fertilizer: "NPK 75-50-50 kg/ha", yield: "6–25 t/ha" },
  { name: "Avocado", temp: [16, 28], humidity: [50, 80], rain: [3, 9], altitude: [600, 2000], water: "Medium", fertilizer: "NPK 8-3-9", yield: "5–20 t/ha" },
  { name: "Banana", temp: [22, 32], humidity: [70, 95], rain: [4, 10], altitude: [0, 1200], water: "High", fertilizer: "NPK 10-10-10", yield: "20–40 t/ha" },
  { name: "Paddy", temp: [20, 32], humidity: [70, 95], rain: [4, 12], altitude: [0, 1000], water: "Flooded", fertilizer: "NPK 16-16-8", yield: "3–10 t/ha" },
  { name: "Sugarcane", temp: [20, 34], humidity: [60, 90], rain: [4, 10], altitude: [0, 1000], water: "High", fertilizer: "NPK 20-10-10", yield: "60–120 t/ha" },
  { name: "Groundnut", temp: [24, 32], humidity: [40, 70], rain: [1, 6], altitude: [0, 1200], water: "Medium", fertilizer: "NPK 15-15-15", yield: "1–3 t/ha" },
  { name: "Cotton", temp: [21, 32], humidity: [40, 70], rain: [2, 6], altitude: [0, 1200], water: "Medium", fertilizer: "NPK 12-12-18", yield: "1–3 t/ha" },
  { name: "Sunflower", temp: [18, 30], humidity: [40, 65], rain: [1, 5], altitude: [0, 1500], water: "Low", fertilizer: "NPK 10-10-10", yield: "1–3 t/ha" },
  { name: "Sorghum", temp: [20, 32], humidity: [40, 65], rain: [1, 5], altitude: [0, 1500], water: "Low", fertilizer: "NPK 20-20-0", yield: "1–5 t/ha" },
  { name: "Red Gram", temp: [20, 32], humidity: [40, 70], rain: [1, 6], altitude: [0, 1500], water: "Low", fertilizer: "Low N; add P & K", yield: "1–2.5 t/ha" },
  { name: "Ragi", temp: [18, 30], humidity: [40, 70], rain: [2, 7], altitude: [0, 1500], water: "Low", fertilizer: "NPK 20-20-0", yield: "1–3 t/ha" },
  { name: "Potato", temp: [10, 20], humidity: [60, 80], rain: [1, 6], altitude: [600, 2500], water: "Medium", fertilizer: "NPK 12-12-18", yield: "20–40 t/ha" },
  { name: "Beans", temp: [15, 26], humidity: [50, 75], rain: [2, 7], altitude: [0, 2000], water: "Medium", fertilizer: "Low N; add P & K", yield: "1.5–3 t/ha" },
  { name: "Millet", temp: [20, 32], humidity: [40, 65], rain: [1, 5], altitude: [0, 1500], water: "Low", fertilizer: "NPK 20-20-0", yield: "1–3 t/ha" },
  { name: "Maize", temp: [18, 30], humidity: [50, 70], rain: [2, 8], altitude: [0, 1500], water: "Medium", fertilizer: "NPK 15-15-15", yield: "4–10 t/ha" },
  { name: "Wheat", temp: [12, 25], humidity: [40, 65], rain: [0.5, 4], altitude: [0, 1500], water: "Low", fertilizer: "NPK 20-20-0", yield: "3–8 t/ha" },
  { name: "Barley", temp: [8, 22], humidity: [40, 60], rain: [0.5, 4], altitude: [0, 2000], water: "Low", fertilizer: "NPK 20-20-0", yield: "2–7 t/ha" },
];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const regionalHints = (locationText = "") => {
  const text = locationText.toLowerCase();
  if (text.includes("chikmagalur") || text.includes("chikkamagaluru"))
    return ["Coffee", "Pepper", "Cardamom", "Tea", "Arecanut", "Avocado", "Banana", "Ginger"];
  if (text.includes("hassan"))
    return ["Coffee", "Ginger", "Pepper", "Potato", "Beans", "Ragi"];
  if (text.includes("mandya"))
    return ["Sugarcane", "Paddy", "Banana", "Ragi"];
  if (text.includes("ballari") || text.includes("bellary"))
    return ["Groundnut", "Cotton", "Sunflower", "Sorghum", "Red Gram"];
  if (text.includes("coorg") || text.includes("kodagu"))
    return ["Coffee", "Cardamom", "Pepper", "Arecanut", "Banana", "Avocado"];
  return [];
};

export const classifyRegion = (weather, locationText = "") => {
  const month = monthIndex();
  const rainfallZone =
    weather.rainfall >= 8 || (weather.humidity >= 75 && [6, 7, 8, 9].includes(month))
      ? "high"
      : weather.rainfall >= 3 || weather.humidity >= 55
      ? "moderate"
      : "low";
  const terrain = weather.elevation >= 800 ? "hill" : weather.elevation >= 200 ? "upland" : "plain";
  const season = [6, 7, 8, 9, 10].includes(month)
    ? "kharif"
    : [11, 12, 1, 2, 3].includes(month)
    ? "rabi"
    : "zaid";
  const soil = (() => {
    if (terrain === "hill" && rainfallZone !== "low") return "laterite";
    if (rainfallZone === "high" && terrain === "plain") return "alluvial";
    if (rainfallZone === "low" && weather.temp >= 28) return "red/black";
    if (rainfallZone === "moderate" && weather.humidity >= 60) return "clay loam";
    return "loam";
  })();
  const regionType = `${rainfallZone} rainfall, ${terrain} terrain, ${soil} soil`;
  const hints = regionalHints(locationText);
  return { rainfallZone, terrain, season, soil, regionType, hints };
};

const rangeScore = (value, [min, max]) => {
  if (value >= min && value <= max) return 100;
  const dist = value < min ? min - value : value - max;
  const span = Math.max(max - min, 1);
  return clamp(Math.round(100 - (dist / span) * 100), 0, 100);
};

const buildReason = (crop, weather, scores, region) => {
  const parts = [];
  parts.push(`Temp ${Math.round(weather.temp)}°C vs ${crop.temp[0]}–${crop.temp[1]} → ${scores.temp}`);
  parts.push(`Humidity ${Math.round(weather.humidity)}% → ${scores.humidity}`);
  parts.push(`Rain ${weather.rainfall} mm → ${scores.rain}`);
  parts.push(`Wind ${Math.round(weather.wind)} m/s → ${scores.wind}`);
  if (weather.elevation) parts.push(`Elevation ${weather.elevation} m`);
  parts.push(`Season ${region.season} → ${scores.season}`);
  return parts.join("; ");
};

const scoreCrop = (crop, weather, region, month, boost = 0) => {
  const scores = {
    temp: rangeScore(weather.temp, crop.temp),
    humidity: rangeScore(weather.humidity, crop.humidity),
    rain: rangeScore(weather.rainfall, crop.rain),
    wind: weather.wind <= 12 ? 100 : clamp(100 - (weather.wind - 12) * 10, 0, 100),
    altitude:
      weather.elevation === 0
        ? 70
        : weather.elevation >= crop.altitude[0] && weather.elevation <= crop.altitude[1]
        ? 100
        : clamp(100 - Math.abs(weather.elevation - crop.altitude[1]) / 10, 0, 100),
    season: region.season === "kharif" && [6, 7, 8, 9, 10].includes(month)
      ? 100
      : region.season === "rabi" && [11, 12, 1, 2, 3].includes(month)
      ? 100
      : 70,
  };

  const weights = { temp: 0.3, humidity: 0.2, rain: 0.22, wind: 0.08, altitude: 0.08, season: 0.12 };
  const suitability =
    weights.temp * scores.temp +
    weights.humidity * scores.humidity +
    weights.rain * scores.rain +
    weights.wind * scores.wind +
    weights.altitude * scores.altitude +
    weights.season * scores.season +
    boost;

  const risks = [];
  if (weather.wind > 14) risks.push("windy");
  if (weather.humidity < crop.humidity[0]) risks.push("low humidity");
  if (weather.humidity > crop.humidity[1]) risks.push("high humidity");
  if (weather.temp < crop.temp[0]) risks.push("cool");
  if (weather.temp > crop.temp[1]) risks.push("heat");
  if (weather.rainfall < crop.rain[0]) risks.push("dry spell");
  if (weather.rainfall > crop.rain[1]) risks.push("heavy rain");

  return {
    name: crop.name,
    suitability: Math.round(clamp(suitability, 0, 100)),
    reason: buildReason(crop, weather, scores, region),
    water: crop.water,
    fertilizer: crop.fertilizer,
    yield: crop.yield,
    months: month,
    risks,
  };
};

export const buildCropPlan = (weather, locationText = "") => {
  const month = monthIndex();
  const region = classifyRegion(weather, locationText);
  const hinted = regionalHints(locationText);
  const candidates = [
    ...hinted,
    ...baseCrops.map((c) => c.name),
  ];
  const uniqueCandidates = Array.from(new Set(candidates));

  const scored = uniqueCandidates
    .map((name) => {
      const crop = baseCrops.find((c) => c.name === name) || baseCrops[0];
      const boost = hinted.includes(name) ? 8 : 0;
      return scoreCrop(crop, weather, region, month, boost);
    })
    .sort((a, b) => b.suitability - a.suitability);

  const recommendations =
    scored.filter((r) => r.suitability >= 40).slice(0, 6).length > 0
      ? scored.filter((r) => r.suitability >= 40).slice(0, 6)
      : scored.slice(0, 6);

  return { region, recommendations };
};

const aiPrompt = (weather, region, locationText, max = 6) => {
  const lines = [];
  lines.push("You are an advanced agriculture & climate intelligence system.");
  lines.push("Recommend the BEST crops for this location based on real-time weather AND regional agricultural behavior.");
  lines.push("Return concise JSON only: [{name, suitability, reason, water, fertilizer, yield, risks}] with suitability 1-100 and risks as array of short strings.");
  lines.push("Do not include any other text.");
  lines.push("");
  lines.push(`Location: ${locationText || "Unknown"}`);
  lines.push(`Weather: temp ${Math.round(weather.temp)}C, humidity ${Math.round(weather.humidity)}%, rainfall ${weather.rainfall} mm, wind ${Math.round(weather.wind)} m/s, elevation ${weather.elevation} m, description ${weather.description || "unknown"}`);
  lines.push(`Region: ${region.regionType}, soil ${region.soil}, season ${region.season}, rainfall zone ${region.rainfallZone}, terrain ${region.terrain}`);
  lines.push(`Return up to ${max} crops with clear reasons tailored to the above.`);
  return lines.join("\n");
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Enhanced in-memory cache with 30-minute TTL and localStorage fallback
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY_PREFIX = 'crop_rec_';

// Load cache from localStorage on initialization
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const savedCache = localStorage.getItem('cropRecommendationCache');
    if (savedCache) {
      const parsed = JSON.parse(savedCache);
      const now = Date.now();
      Object.entries(parsed).forEach(([key, { timestamp, data }]) => {
        if (now - timestamp < CACHE_TTL) {
          cache.set(key, { timestamp, data });
        }
      });
    }
  } catch (e) {
    console.warn('Failed to load cache from localStorage', e);
  }
}

// Save cache to localStorage
function saveCacheToStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const cacheObj = Object.fromEntries(cache);
      localStorage.setItem('cropRecommendationCache', JSON.stringify(cacheObj));
    } catch (e) {
      console.warn('Failed to save cache to localStorage', e);
    }
  }
}

// Generate a consistent cache key based on the input parameters
function getCacheKey(weather, region, locationText, max) {
  // Create a stable string representation of the weather object
  const weatherKey = weather ? {
    temp: weather.temp,
    humidity: weather.humidity,
    rainfall: weather.rainfall,
    month: weather.month
  } : {};
  
  const key = CACHE_KEY_PREFIX + btoa(encodeURIComponent(
    `${locationText || 'unknown'}-${region || 'unknown'}-${JSON.stringify(weatherKey)}-${max}`
  )).substring(0, 100); // Limit key length
  
  return key;
}

export const aiRecommendCrops = async (weather, region, locationText = "", max = 6) => {
  const cacheKey = getCacheKey(weather, region, locationText, max);
  const now = Date.now();
  
  // Check in-memory cache first
  const cached = cache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }
  
  // Check localStorage for additional caching
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const { timestamp, data } = JSON.parse(stored);
        if (now - timestamp < CACHE_TTL) {
          // Update in-memory cache
          cache.set(cacheKey, { timestamp, data });
          return data;
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage cache', e);
    }
  }

  // Require either a proxy endpoint or an opt-in direct API key
  if (!AI_ENABLED) {
    const errorMsg =
      'AI calls disabled: set VITE_AI_PROXY (recommended) or VITE_OPENAI_API_KEY + VITE_OPENAI_DIRECT=true.';
    console.warn(errorMsg);
    return {
      recs: null,
      rateLimited: false,
      error: errorMsg,
      fallback: buildCropPlan(weather, locationText).recommendations,
    };
  }
  
  // Add request to analytics (if you have analytics)
  try {
    // You can add analytics tracking here
    console.log(`AI recommendation requested for ${locationText || 'unknown location'}`);
  } catch (e) {
    console.warn('Analytics error:', e);
  }

  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a precise agronomist. Output strict JSON array only." },
      { role: "user", content: aiPrompt(weather, region, locationText, max) },
    ],
    temperature: 0.2,
    max_tokens: 400,
    response_format: { type: "json_object" },
  };

  const maxRetries = 3;
  let attemptsMade = 0;
  let lastError = null;
  let waitTime = 1000; // Start with 1 second

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      attemptsMade += 1;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const endpoint = USE_DIRECT ? "https://api.openai.com/v1/chat/completions" : AI_PROXY;
      const headers = {
        "Content-Type": "application/json",
      };

      if (USE_DIRECT && AI_KEY) {
        headers["Authorization"] = `Bearer ${AI_KEY}`;
      }

      const res = await rateLimitedFetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (res.status === 401) {
        const error = await res.json().catch(() => ({}));
        console.error('❌ OpenAI API Authentication Error:', error);
        throw new Error('Invalid OpenAI API key. Please check your VITE_OPENAI_API_KEY in .env file');
      }
      
      if (res.status === 429) {
        // Get retry-after header or use exponential backoff with jitter
        const retryAfter = res.headers.get('retry-after') 
          ? parseInt(res.headers.get('retry-after')) * 1000 
          : Math.min(waitTime * (1 + Math.random() * 0.5), 60000); // Add jitter and cap at 60s
          
        const retryMessage = `⚠️ Rate limited. Waiting ${Math.round(retryAfter/1000)}s before retry (attempt ${attempt + 1}/${maxRetries})`;
        console.warn(retryMessage);
        
        // Show user-friendly message in UI
        if (typeof window !== 'undefined') {
          const message = `AI is busy (${attempt + 1}/${maxRetries}). Please wait...`;
          window.dispatchEvent(new CustomEvent('ai-status', { detail: { message } }));
        }
        
        await sleep(retryAfter);
        waitTime = Math.min(waitTime * 2, 60000); // Double wait time, max 60s
        lastError = "rate_limit";
        continue;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('OpenAI API Error:', errorData);
        throw new Error(`API request failed with status ${res.status}`);
      }

      const data = await res.json();
      const txt = data?.choices?.[0]?.message?.content || "{}";
      
      try {
        const parsed = JSON.parse(txt);
        const arr = Array.isArray(parsed) ? parsed : parsed?.crops || [];
        const result = {
          recs: arr
            .slice(0, max)
            .map((r) => ({
              ...r,
              suitability: Math.min(100, Math.max(0, r.suitability || 0)),
              risks: Array.isArray(r.risks) ? r.risks : [],
            })),
          rateLimited: false,
          error: null,
        };
        
        // Cache the successful response
        const timestamp = Date.now();
        const cacheEntry = { timestamp, data: result };
        
        // Update in-memory cache
        cache.set(cacheKey, cacheEntry);
        
        // Also save to localStorage if available
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
            // Keep localStorage clean by removing old entries occasionally
            if (Math.random() < 0.1) { // 10% chance to clean up
              const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_KEY_PREFIX));
              keys.forEach(k => {
                try {
                  const entry = JSON.parse(localStorage.getItem(k));
                  if (now - entry.timestamp > CACHE_TTL * 2) {
                    localStorage.removeItem(k);
                  }
                } catch (e) {
                  localStorage.removeItem(k);
                }
              });
            }
          } catch (e) {
            console.warn('Failed to save to localStorage', e);
          }
        }
        
        return result;
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error.message;
      
      // Don't retry on certain errors
      if (error.name === 'AbortError' || 
          error.message.includes('API key') || 
          error.message.includes('Invalid response format')) {
        break;
      }
      
      // Wait before next attempt with exponential backoff
      await sleep(waitTime);
      waitTime = Math.min(waitTime * 2, 30000); // Double wait time, max 30s
    }
  }

  // If we get here, all attempts failed
  const errorMessage = `Failed after ${attemptsMade} attempt${attemptsMade === 1 ? '' : 's'}: ${lastError || 'Unknown error'}`;
  console.error(errorMessage);
  
  // Show user-friendly error message
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ai-status', { 
      detail: { 
        message: 'Service temporarily unavailable. Using local recommendations...',
        type: 'error',
        timeout: 5000
      } 
    }));
  }
  
  // Return fallback with error information
  const fallback = buildCropPlan(weather, locationText).recommendations;
  
  // Log the failure for analytics
  try {
    console.log('AI recommendation failed:', {
      error: errorMessage,
      location: locationText,
      weather,
      fallbackUsed: !!fallback?.length
    });
  } catch (e) {
    console.warn('Failed to log analytics:', e);
  }
  
  return {
    recs: null,
    rateLimited: lastError === "rate_limit",
    error: errorMessage,
    fallback,
    timestamp: new Date().toISOString()
  };
};

export const normalizeOpenWeather = (json, elevation = 0) => {
  const rainfall =
    typeof json?.rain?.["1h"] === "number"
      ? Number(json.rain["1h"].toFixed(1))
      : typeof json?.rain?.["3h"] === "number"
      ? Number(json.rain["3h"].toFixed(1))
      : 0;
  return {
    city: json?.name || "",
    country: json?.sys?.country || "",
    temp: json?.main?.temp ?? 0,
    feels_like: json?.main?.feels_like ?? 0,
    humidity: json?.main?.humidity ?? 0,
    pressure: json?.main?.pressure ?? 0,
    wind: json?.wind?.speed ?? 0,
    rainfall,
    description: json?.weather?.[0]?.description || "",
    icon: json?.weather?.[0]?.icon || "",
    lat: json?.coord?.lat ?? 0,
    lon: json?.coord?.lon ?? 0,
    elevation,
  };
};

export const demoWeather = {
  city: "Hassan",
  country: "IN",
  temp: 23,
  feels_like: 22,
  humidity: 72,
  pressure: 1008,
  wind: 3,
  rainfall: 8,
  description: "light rain",
  icon: "10d",
  lat: 13.0,
  lon: 76.0,
  elevation: 950,
};

