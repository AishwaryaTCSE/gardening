const WEATHER_API = "ENTER_MY_WEATHER_API_KEY";
const API_URL = "https://example-weather-api.com/v1/conditions";

export async function fetchWeather(location) {
  try {
    const response = await fetch(`${API_URL}?q=${encodeURIComponent(location)}`, {
      headers: { Authorization: `Bearer ${WEATHER_API}` },
    });

    if (!response.ok) {
      throw new Error("Unable to fetch weather");
    }

    const data = await response.json();
    return {
      temperature: data?.temperature ?? 24,
      humidity: data?.humidity ?? 60,
      rainfall: data?.rainfall ?? 3,
      month: data?.month ?? "April",
    };
  } catch (error) {
    // Fallback demo values so the UI remains functional.
    return {
      error: error.message,
      temperature: 26,
      humidity: 65,
      rainfall: 2.4,
      month: "May",
    };
  }
}

