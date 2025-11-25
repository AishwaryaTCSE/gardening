import { useState, useEffect } from 'react';
import { FiDroplet, FiSun, FiWind, FiCloudRain, FiThermometer, FiCalendar } from 'react-icons/fi';

const Weather = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState([]);

  // Mock weather data - in a real app, you would fetch this from a weather API
  const mockWeather = {
    location: 'New York, NY',
    current: {
      temp: 72,
      condition: 'Partly Cloudy',
      humidity: 65,
      wind: 8,
      precipitation: 10,
      icon: 'partly-cloudy-day',
      feelsLike: 74
    },
    today: {
      high: 78,
      low: 65,
      sunrise: '6:45 AM',
      sunset: '7:30 PM'
    }
  };

  const mockForecast = [
    { day: 'Mon', high: 78, low: 65, condition: 'partly-cloudy-day', precipitation: 10 },
    { day: 'Tue', high: 82, low: 68, condition: 'clear-day', precipitation: 0 },
    { day: 'Wed', high: 75, low: 62, condition: 'rain', precipitation: 80 },
    { day: 'Thu', high: 70, low: 60, condition: 'cloudy', precipitation: 40 },
    { day: 'Fri', high: 74, low: 63, condition: 'partly-cloudy-day', precipitation: 20 }
  ];

  // Simulate loading weather data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setWeather(mockWeather);
      setForecast(mockForecast);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

    if (precipitation > 50) {
      return 'Heavy rain expected - check your garden for proper drainage.';
    } else if (temp > 85) {
      return 'Hot day ahead - water plants in the early morning or late evening.';
    } else if (temp < 40) {
      return 'Cold temperatures expected - protect sensitive plants from frost.';
    } else if (precipitation < 10 && temp > 70) {
      return 'Dry and warm - make sure to water your plants thoroughly.';
    } else {
      return 'Great weather for gardening! Consider planting or transplanting.';
    }
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
          <div className="max-w-md mx-auto">
            <div className="relative">
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
          </div>
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
                    <h2 className="text-2xl font-bold text-gray-900">{weather.location}</h2>
                    <p className="text-gray-500">Current Weather</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="flex items-center">
                      <span className="text-5xl font-light">{weather.current.temp}°</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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