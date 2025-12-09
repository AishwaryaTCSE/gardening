export const WEATHER_API_KEY =
  import.meta.env.VITE_WEATHER_API_KEY ||
  import.meta.env.REACT_APP_WEATHER_API_KEY ||
  "";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const getCurrentWeather = async (location) => {
  try {
    if (!WEATHER_API_KEY) throw new Error("Weather API key missing");
    const response = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('Weather data not found');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

export const getWeatherForecast = async (location, days = 5) => {
  try {
    if (!WEATHER_API_KEY) throw new Error("Weather API key missing");
    const response = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric&cnt=${days}`
    );
    
    if (!response.ok) {
      throw new Error('Forecast data not found');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

export const getWeatherByCoords = async (lat, lon) => {
  try {
    if (!WEATHER_API_KEY) throw new Error("Weather API key missing");
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('Weather data not found');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather by coordinates:', error);
    throw error;
  }
};
