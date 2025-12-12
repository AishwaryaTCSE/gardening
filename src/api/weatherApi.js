const WEATHER_API =
  import.meta.env.VITE_WEATHER_API_KEY ||
  import.meta.env.REACT_APP_WEATHER_API_KEY ||
  "";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function fetchWeather(location) {
  try {
    if (!WEATHER_API) {
      throw new Error("Weather API key missing");
    }
    const response = await fetch(
      `${API_URL}?q=${encodeURIComponent(location)}&appid=${WEATHER_API}&units=metric`
    );

    if (!response.ok) {
      throw new Error("Unable to fetch weather");
    }

    const data = await response.json();
    return {
      temperature: data?.main?.temp ?? 24,
      humidity: data?.main?.humidity ?? 60,
      rainfall:
        typeof data?.rain?.["1h"] === "number"
          ? Number(data.rain["1h"].toFixed(1))
          : typeof data?.rain?.["3h"] === "number"
          ? Number(data.rain["3h"].toFixed(1))
          : 3,
      month: new Intl.DateTimeFormat("en", { month: "long" }).format(new Date()),
      description: data?.weather?.[0]?.description || "",
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

