import { useState } from 'react';
import {
  FiDroplet,
  FiSun,
  FiWind,
  FiCloudRain,
  FiThermometer,
  FiCalendar,
  FiSearch,
} from "react-icons/fi";
import {
  getCurrentWeather,
  getWeatherForecast,
  WEATHER_API_KEY,
} from "../utils/weatherApi";
import { buildCropPlan } from "../utils/cropEngine";

const Weather = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [suggestedCrops, setSuggestedCrops] = useState([]);
  const [searchedLocation, setSearchedLocation] = useState('');
  const [regionProfile, setRegionProfile] = useState(null);

  const fallbackWeather = {
    location: 'Sampleville',
    current: {
      temp: 26,
      condition: 'Partly Cloudy',
      humidity: 62,
      wind: 5,
      precipitation: 12,
      icon: 'partly-cloudy-day',
      feelsLike: 27,
      rainfall: 2.4,
    },
    today: {
      high: 28,
      low: 19,
      sunrise: '6:20 AM',
      sunset: '6:55 PM',
    },
  };

  const fallbackForecast = [
    { day: 'Mon', high: 28, low: 19, condition: 'partly-cloudy-day', precipitation: 10 },
    { day: 'Tue', high: 29, low: 20, condition: 'clear-day', precipitation: 5 },
    { day: 'Wed', high: 26, low: 18, condition: 'rain', precipitation: 70 },
    { day: 'Thu', high: 24, low: 17, condition: 'cloudy', precipitation: 40 },
    { day: 'Fri', high: 25, low: 18, condition: 'partly-cloudy-day', precipitation: 15 },
  ];

  const handleSearch = async () => {
    if (!location.trim()) {
      setError("Enter a location to search.");
      return;
    }
    setError(null);
    setLoading(true);

    // If no API key, skip network calls and use fallback immediately.
    if (!WEATHER_API_KEY) {
      setWeather(fallbackWeather);
      setForecast(fallbackForecast);
      const plan = mapToCropPlan(fallbackWeather);
      setSuggestedCrops(plan.recommendations);
      setRegionProfile(plan.region);
      setSearchedLocation(fallbackWeather.location);
      setError("Using sample data; set VITE_WEATHER_API_KEY for live weather.");
      setLoading(false);
      return;
    }

    try {
      const current = await getCurrentWeather(location.trim());
      const next = await getWeatherForecast(location.trim(), 5);
      const normalized = normalizeWeather(current, next);
      setWeather(normalized.current);
      setForecast(normalized.forecast);
      const plan = mapToCropPlan(normalized.current);
      setSuggestedCrops(plan.recommendations);
      setRegionProfile(plan.region);
      setSearchedLocation(normalized.current.location);
    } catch (err) {
      // fall back to sample data so UI still works
      setWeather(fallbackWeather);
      setForecast(fallbackForecast);
      const plan = mapToCropPlan(fallbackWeather);
      setSuggestedCrops(plan.recommendations);
      setRegionProfile(plan.region);
      setError("Using sample data; live weather unavailable.");
      setSearchedLocation(fallbackWeather.location);
    } finally {
      setLoading(false);
    }
  };

  const normalizeWeather = (current, forecastData) => {
    const cur = {
      location: `${current.name}, ${current.sys?.country || ''}`.trim(),
      current: {
        temp: Math.round(current.main?.temp ?? 0),
        condition: current.weather?.[0]?.description || 'Unknown',
        humidity: current.main?.humidity ?? 0,
        wind: Math.round(current.wind?.speed ?? 0),
        precipitation: Math.round((current.rain?.['1h'] ?? current.rain?.['3h'] ?? 0) * 10) || 0,
        rainfall: current.rain?.['1h'] ?? current.rain?.['3h'] ?? 0,
        icon: current.weather?.[0]?.main?.toLowerCase() || 'clear-day',
        feelsLike: Math.round(current.main?.feels_like ?? current.main?.temp ?? 0),
      },
      today: {
        high: Math.round(current.main?.temp_max ?? current.main?.temp ?? 0),
        low: Math.round(current.main?.temp_min ?? current.main?.temp ?? 0),
        sunrise: current.sys?.sunrise
          ? new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '--',
        sunset: current.sys?.sunset
          ? new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '--',
      },
    };

    const fc = (forecastData?.list || []).slice(0, 5).map((entry) => {
      const day = new Date(entry.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' });
      return {
        day,
        high: Math.round(entry.main?.temp_max ?? entry.main?.temp ?? 0),
        low: Math.round(entry.main?.temp_min ?? entry.main?.temp ?? 0),
        condition: entry.weather?.[0]?.main?.toLowerCase() || 'partly-cloudy-day',
        precipitation: Math.round((entry.pop ?? 0) * 100),
      };
    });

    return { current: cur, forecast: fc };
  };

  const mapToCropPlan = (data) => {
    const current = data.current || {};
    const payload = {
      city: data.location || searchedLocation || "",
      country: "",
      temp: current.temp ?? 0,
      humidity: current.humidity ?? 0,
      rainfall:
        typeof current.rainfall === "number"
          ? current.rainfall
          : typeof current.precipitation === "number"
          ? current.precipitation / 10
          : 0,
      wind: current.wind ?? current.windSpeed ?? 0,
      elevation: 0,
      description: current.condition || "",
    };
    return buildCropPlan(payload, data.location || location);
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      'clear-day': '☀️',
      'clear-night': '🌙',
      'partly-cloudy-day': '⛅',
      'partly-cloudy-night': '☁️',
      'cloudy': '☁️',
      'rain': '🌧️',
      'snow': '❄️',
      'sleet': '🌨️',
      'wind': '💨',
      'fog': '🌫️'
    };
    return icons[condition] || '☀️';
  };

  const getGardeningTip = () => {
    if (!weather) return 'Loading gardening tips...';
    const temp = weather.current.temp;
    const precipitation = weather.current.precipitation;

    if (precipitation > 50) return 'Heavy rain expected - check drainage and staking.';
    if (temp > 32) return 'Hot day ahead - water early/late and add mulch.';
    if (temp < 10) return 'Cold snap coming - protect sensitive plants from frost.';
    if (precipitation < 10 && temp > 22) return 'Dry and warm - deep water and consider shade cloth.';
    return 'Great weather for gardening! Ideal for planting or transplanting.';
  };

  const getPlantingRecommendations = () => {
    const month = new Date().getMonth() + 1;
    
    if (month >= 3 && month <= 5) {
      return ['Tomatoes', 'Peppers', 'Basil', 'Zucchini', 'Cucumbers'];
    } else if (month >= 6 && month <= 8) {
      return ['Beans', 'Corn', 'Squash', 'Okra', 'Sweet Potatoes'];
    } else if (month >= 9 && month <= 11) {
      return ['Lettuce', 'Spinach', 'Kale', 'Broccoli', 'Cauliflower'];
    } else {
      return ['Garlic', 'Onions', 'Peas', 'Carrots', 'Beets'];
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Garden Weather</h1>
          <p className="text-gray-600">Weather information and gardening recommendations</p>
        </div>

        {/* Search and Location */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSun className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Enter location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 transition disabled:opacity-60"
              disabled={loading}
            >
              <FiSearch className="mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <p className="text-center text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading weather data...</p>
          </div>
        ) : weather ? (
          <>
            {/* Current Weather */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {searchedLocation || weather.location}
                    </h2>
                    <p className="text-gray-500">Current Weather</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="flex items-center">
                      <span className="text-5xl font-light">
                        {weather.current.temp}°
                      </span>
                      <span className="ml-2 text-4xl">{getWeatherIcon(weather.current.icon)}</span>
                    </div>
                    <p className="text-gray-600">{weather.current.condition}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <FiThermometer className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Feels Like</p>
                      <p className="font-medium">{weather.current.feelsLike}°</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiDroplet className="h-5 w-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Humidity</p>
                      <p className="font-medium">{weather.current.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiWind className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Wind</p>
                      <p className="font-medium">{weather.current.wind} mph</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiCloudRain className="h-5 w-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Precip</p>
                      <p className="font-medium">{weather.current.precipitation}%</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiCloudRain className="h-5 w-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Rainfall</p>
                      <p className="font-medium">
                        {weather.current.rainfall ?? 0} mm
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Sunrise</p>
                      <p className="font-medium">{weather.today.sunrise}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sunset</p>
                      <p className="font-medium">{weather.today.sunset}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">High / Low</p>
                      <p className="font-medium">{weather.today.high}° / {weather.today.low}°</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Forecast */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5-Day Forecast</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                  {forecast.map((day, index) => (
                    <div key={index} className="p-4 text-center">
                      <p className="font-medium text-gray-900">{day.day}</p>
                      <p className="text-3xl my-2">{getWeatherIcon(day.condition)}</p>
                      <div className="flex justify-center space-x-2">
                        <span className="font-medium">{day.high}°</span>
                        <span className="text-gray-500">{day.low}°</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        <FiDroplet className="inline mr-1" />
                        {day.precipitation}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gardening Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-green-50 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Gardening Tip</h2>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <FiSun className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">{getGardeningTip()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">This Month's Planting</h2>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <FiCalendar className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">Consider planting these in your garden this month:</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getPlantingRecommendations().map((plant, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {plant}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Best Crops Now</h2>
                <p className="text-gray-600 mb-3">
                  Based on live temperature, humidity, rainfall, wind, and local terrain.
                </p>
                {regionProfile && (
                  <div className="mb-4 text-sm text-gray-700">
                    Region profile: {regionProfile.regionType} · Season {regionProfile.season}
                  </div>
                )}
                <div className="divide-y divide-gray-200">
                  {suggestedCrops.map((crop, idx) => (
                    <div key={idx} className="py-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-800">{crop.name}</p>
                        <span className="text-xs rounded-full px-2 py-1 bg-green-50 text-green-700 border border-green-200">
                          {crop.suitability}/100
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{crop.reason}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Yield:</span> {crop.yield} ·{" "}
                        <span className="font-medium">Water:</span> {crop.water} ·{" "}
                        <span className="font-medium">Fertilizer:</span> {crop.fertilizer}
                      </p>
                      {!!crop.risks?.length && (
                        <p className="text-xs text-orange-700 mt-1">Risk: {crop.risks.join(", ")}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiSun className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No weather data available</h3>
            <p className="mt-1 text-sm text-gray-500">We couldn't load the weather information.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
