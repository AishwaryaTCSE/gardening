import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiSearch,
  FiThermometer,
  FiDroplet,
  FiCloudRain,
  FiWind,
  FiTrendingUp,
} from "react-icons/fi";
import {
  buildCropPlan,
  classifyRegion,
  normalizeOpenWeather,
  demoWeather,
  aiRecommendCrops,
  AI_ENABLED,
} from "../utils/cropEngine";

const API_KEY =
  import.meta.env.VITE_WEATHER_API_KEY ||
  import.meta.env.REACT_APP_WEATHER_API_KEY ||
  "";

const geocodeUrl = (q) =>
  `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    q
  )}&limit=6&appid=${API_KEY}`;

const weatherUrl = (lat, lon) =>
  `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

const elevationUrl = (lat, lon) =>
  `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`;

const useDebounce = (value, delay = 400) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
};

const badgeClass = (score) => {
  if (score >= 80) return "bg-green-100 text-green-700 ring-green-300";
  if (score >= 60) return "bg-yellow-100 text-yellow-700 ring-yellow-300";
  if (score >= 40) return "bg-orange-100 text-orange-700 ring-orange-300";
  return "bg-red-100 text-red-700 ring-red-300";
};

export default function SmartCropFinder() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [aiRecs, setAiRecs] = useState([]);
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [region, setRegion] = useState(null);
  const debouncedQuery = useDebounce(query, 450);
  const listRef = useRef(null);

  const applyPlan = (w, locationLabel = "") => {
    const plan = buildCropPlan(w, locationLabel);
    setRegion(plan.region);
    setRecommendations(plan.recommendations);
    setAiRecs([]);
    setAiError("");
    if (aiRecommendCrops) {
      setAiLoading(true);
      aiRecommendCrops(w, plan.region, locationLabel)
        .then((res) => {
          if (res?.recs?.length) {
            setAiRecs(res.recs);
          } else if (res?.fallback?.length) {
            // When AI is disabled or fails, fall back to local recommendations quietly.
            setAiRecs(res.fallback);
          }
          if (res?.rateLimited) setAiError("AI rate-limited; retry shortly.");
          else if (res?.error && !res.recs && !res.fallback) setAiError("AI recommendations unavailable.");
        })
        .catch(() => setAiError("AI recommendations unavailable."))
        .finally(() => setAiLoading(false));
    }
  };

  function fetchWeather(lat, lon) {
    if (!API_KEY) {
      setWeatherError("Using demo data; set VITE_WEATHER_API_KEY for live weather and geocoding.");
      setWeather(demoWeather);
      applyPlan(demoWeather, query);
      return;
    }
    setWeatherLoading(true);
    setWeatherError("");
    fetch(weatherUrl(lat, lon))
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!data || data.cod === "404") {
          setWeatherError("Weather not found.");
          setWeather(null);
          setRecommendations([]);
          return;
        }
        if (data?.cod === 401) {
          setWeatherError("OpenWeather API key invalid.");
          setWeather(null);
          setRecommendations([]);
          return;
        }
        const w0 = normalizeOpenWeather(data);
        fetch(elevationUrl(lat, lon))
          .then((r) => r.json())
          .then((ej) => {
            const elevation = Array.isArray(ej?.elevation) ? ej.elevation[0] ?? 0 : ej?.elevation ?? 0;
            const w = { ...w0, elevation: Math.round(elevation || 0) };
            setWeather(w);
            applyPlan(w, query);
          })
          .catch(() => {
            const w = { ...w0 };
            setWeather(w);
            applyPlan(w, query);
          });
        // recommendations handled after elevation fetch above
      })
      .catch(() => {
        setWeatherError("Weather fetch failed.");
        setWeather(null);
        setRecommendations([]);
      })
      .finally(() => setWeatherLoading(false));
  }

  useEffect(() => {
    const last = localStorage.getItem("smartcrop_last");
    if (last) {
      const obj = JSON.parse(last);
      fetchWeather(obj.lat, obj.lon);
    }
    if (!last && !API_KEY) {
      setWeather(demoWeather);
      applyPlan(demoWeather, "");
      setWeatherError("Using demo data; set VITE_WEATHER_API_KEY for live weather and geocoding.");
    }
  }, []);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setGeocodeError("");
      return;
    }
    if (!API_KEY) {
      setGeocodeError("Set OpenWeather API key to enable geocoding.");
      setSuggestions([]);
      return;
    }
    setGeocodeLoading(true);
    setGeocodeError("");
    fetch(geocodeUrl(debouncedQuery))
      .then(async (res) => {
        const data = await res.json().catch(() => []);
        if (data?.cod === 401) {
          setGeocodeError("OpenWeather API key invalid.");
          setSuggestions([]);
          return;
        }
        if (!Array.isArray(data)) {
          setGeocodeError("No results.");
          setSuggestions([]);
          return;
        }
        setSuggestions(
          data.map((d) => ({
            key: `${d.name}-${d.lat}-${d.lon}`,
            name: d.name,
            state: d.state || "",
            country: d.country || "",
            lat: d.lat,
            lon: d.lon,
          }))
        );
      })
      .catch(() => {
        setGeocodeError("Geocoding failed.");
        setSuggestions([]);
      })
      .finally(() => setGeocodeLoading(false));
  }, [debouncedQuery]);

  const selectSuggestion = (s) => {
    setQuery(`${s.name}${s.state ? ", " + s.state : ""}, ${s.country}`);
    setSuggestions([]);
    setActiveIndex(-1);
    fetchWeather(s.lat, s.lon);
    localStorage.setItem("smartcrop_last", JSON.stringify({ lat: s.lat, lon: s.lon }));
  };

  const onKeyDown = (e) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
      scrollActiveIntoView();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
      scrollActiveIntoView();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const s = activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];
      if (s) selectSuggestion(s);
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  const scrollActiveIntoView = () => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector('[data-active="true"]');
    if (active) active.scrollIntoView({ block: "nearest" });
  };

  const weatherCard = useMemo(() => {
    if (!weather) return null;
    const rp = region || classifyRegion(weather, query);
    return (
      <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-xl p-6 flex flex-col gap-3 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">{weather.city}{weather.country ? `, ${weather.country}` : ""}</div>
          <div className="text-sm text-slate-600 capitalize">{weather.description}</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <FiThermometer className="text-rose-600" />
            <div className="text-slate-800">Temp {Math.round(weather.temp)}°C</div>
          </div>
          <div className="flex items-center gap-2">
            <FiThermometer className="text-rose-400" />
            <div className="text-slate-800">Feels {Math.round(weather.feels_like)}°C</div>
          </div>
          <div className="flex items-center gap-2">
            <FiDroplet className="text-sky-600" />
            <div className="text-slate-800">Humidity {Math.round(weather.humidity)}%</div>
          </div>
          <div className="flex items-center gap-2">
            <FiCloudRain className="text-indigo-600" />
            <div className="text-slate-800">Rain {weather.rainfall} mm</div>
          </div>
          <div className="flex items-center gap-2">
            <FiWind className="text-slate-700" />
            <div className="text-slate-800">Wind {Math.round(weather.wind)} m/s</div>
          </div>
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-slate-700" />
            <div className="text-slate-800">Pressure {weather.pressure} hPa</div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <div className="rounded-lg bg-emerald-50 text-emerald-800 px-3 py-1">Altitude {weather.elevation} m</div>
          <div className="rounded-lg bg-teal-50 text-teal-800 px-3 py-1">Terrain {rp.terrain}</div>
          <div className="rounded-lg bg-cyan-50 text-cyan-800 px-3 py-1">Rainfall {rp.rainfallZone}</div>
          <div className="rounded-lg bg-lime-50 text-lime-800 px-3 py-1">Soil {rp.soil}</div>
          <div className="rounded-lg bg-sky-50 text-sky-800 px-3 py-1">Season {rp.season}</div>
        </div>
      </div>
    );
  }, [weather]);

  return (
    <div className="min-h-[100vh] bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="rounded-2xl shadow-lg bg-white/70 backdrop-blur-md border border-white p-4">
          <div className="flex items-center gap-3">
            <FiSearch className="text-emerald-700" />
            <input
              aria-label="Search place"
              aria-autocomplete="list"
              role="combobox"
              className="w-full bg-white/80 border border-emerald-200 rounded-lg px-3 py-2 outline-none focus:ring-2 ring-emerald-400 text-slate-800"
              placeholder="Type a place"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          {geocodeLoading && (
            <div className="mt-3 text-sm text-slate-600">Searching…</div>
          )}
          {geocodeError && (
            <div className="mt-3 text-sm text-red-600">{geocodeError}</div>
          )}
          {!!suggestions.length && (
            <ul
              ref={listRef}
              role="listbox"
              className="mt-3 max-h-60 overflow-auto rounded-xl border border-emerald-100 bg-white shadow-md"
            >
              {suggestions.map((s, i) => (
                <li
                  key={s.key}
                  role="option"
                  aria-selected={activeIndex === i}
                  data-active={activeIndex === i}
                  className={`px-3 py-2 cursor-pointer hover:bg-emerald-50 ${
                    activeIndex === i ? "bg-emerald-50" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(-1)}
                  onClick={() => selectSuggestion(s)}
                >
                  <div className="text-slate-800">
                    {s.name}
                    {s.state ? `, ${s.state}` : ""}, {s.country}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {weatherLoading && (
          <div className="rounded-xl bg-white/70 border border-white p-4 text-slate-700">
            Loading weather…
          </div>
        )}
        {weatherError && (
          <div className="rounded-xl bg-white/70 border border-white p-4 text-red-600">
            {weatherError}
          </div>
        )}
        {weather && weatherCard}

        {weather && (
          <div className="grid gap-4 sm:grid-cols-2">
            {(aiRecs.length ? aiRecs : recommendations).map((r) => (
              <div
                key={r.name}
                className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-xl p-5 hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{r.name}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ring ${badgeClass(r.suitability)}`}>
                    {r.suitability}
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-700">{r.reason}</div>
                {!!r.risks.length && (
                  <div className="mt-1 text-xs text-orange-700">
                    Risk: {r.risks.join(", ")}
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-emerald-50 text-emerald-800 px-3 py-2">
                    Water: {r.water}
                  </div>
                  <div className="rounded-lg bg-sky-50 text-sky-800 px-3 py-2">
                    Fertilizer: {r.fertilizer}
                  </div>
                  <div className="rounded-lg bg-indigo-50 text-indigo-800 px-3 py-2">
                    Yield: {r.yield}
                  </div>
                  <div className="rounded-lg bg-teal-50 text-teal-800 px-3 py-2">
                    Region fit: {region?.regionType || "dynamic"}
                  </div>
                </div>
              </div>
            ))}
            {!aiRecs.length && !recommendations.length && (
              <div className="rounded-xl bg-white/70 border border-white p-4 text-slate-700">
                No recommendations available.
              </div>
            )}
            {aiLoading && (
              <div className="rounded-xl bg-white/70 border border-white p-4 text-slate-700">
                Fetching AI crop picks…
              </div>
            )}
            {aiError && (
              <div className="rounded-xl bg-white/70 border border-white p-4 text-orange-700">
                {aiError}
              </div>
            )}
            {!recommendations.length && (
              <div className="rounded-xl bg-white/70 border border-white p-4 text-slate-700">
                No recommendations available.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
