import { useState, useEffect } from 'react';
import { FiSun, FiCloud, FiCloudRain, FiCloudSnow, FiWind, FiCloud } from 'react-icons/fi';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This is a mock implementation - in a real app, you would fetch from a weather API
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Mock weather data
        const mockWeather = {
          temperature: 22,
          condition: 'Sunny',
          humidity: 65,
          windSpeed: 12,
          icon: 'sun'
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setWeather(mockWeather);
        setLoading(false);
      } catch (err) {
        setError('Failed to load weather data');
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <FiSun className="h-8 w-8 text-yellow-400" />;
      case 'cloudy':
        return <FiCloud className="h-8 w-8 text-gray-400" />;
      case 'rainy':
        return <FiCloudRain className="h-8 w-8 text-blue-400" />;
      case 'snowy':
        return <FiCloudSnow className="h-8 w-8 text-blue-200" />;
      case 'windy':
        return <FiWind className="h-8 w-8 text-gray-500" />;
      default:
        return <FiCloud className="h-8 w-8 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Weather</h3>
            <p className="text-sm text-gray-500">Current conditions</p>
          </div>
          {weather && getWeatherIcon(weather.condition)}
        </div>
        
        {weather && (
          <div className="mt-4">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">
                {weather.temperature}°
              </span>
              <span className="ml-1 text-lg text-gray-500">C</span>
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="flex items-center text-sm text-gray-500">
                <FiDroplet className="h-4 w-4 mr-1 text-blue-400" />
                <span>Humidity: {weather.humidity}%</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FiWind className="h-4 w-4 mr-1 text-gray-400" />
                <span>Wind: {weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 px-4 py-3 text-right">
        <a
          href="/weather"
          className="text-sm font-medium text-green-600 hover:text-green-700"
        >
          View forecast
        </a>
      </div>
    </div>
  );
};

export default WeatherWidget;