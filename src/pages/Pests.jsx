import { useEffect, useMemo, useState } from "react";
import { detectDisease as detectDiseaseApi } from "../api/plantApi";
import { fetchWeather } from "../api/weatherApi";
import { fetchSoil } from "../api/soilApi";

const pageStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const titleStyle = { fontSize: "20px", fontWeight: 700, margin: 0, color: "#14532d" };
const labelStyle = { fontWeight: 600, color: "#14532d" };
const inputStyle = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
};

const buttonStyle = {
  padding: "10px 12px",
  backgroundColor: "#16a34a",
  color: "#f0fdf4",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 700,
  transition: "background-color 0.2s ease",
};

const errorStyle = { color: "#b91c1c", fontWeight: 600 };
const successStyle = { color: "#0f172a" };
const badgeStyle = {
  display: "inline-block",
  backgroundColor: "#dcfce7",
  color: "#166534",
  padding: "6px 10px",
  borderRadius: "9999px",
  fontWeight: 700,
};

export default function Pests() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [diseaseError, setDiseaseError] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  const [location, setLocation] = useState("");
  const [weatherResult, setWeatherResult] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const [soilLocation, setSoilLocation] = useState("");
  const [soilResult, setSoilResult] = useState(null);
  const [soilError, setSoilError] = useState("");
  const [isLoadingSoil, setIsLoadingSoil] = useState(false);

  useEffect(() => {
    if (!imageFile) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const handleDetectDisease = async () => {
    if (!imageFile) {
      setDiseaseError("Please upload an image first.");
      return;
    }
    setDiseaseError("");
    setDiseaseResult(null);
    setIsDetecting(true);
    const result = await detectDiseaseApi(imageFile);
    if (result.error) {
      setDiseaseError(result.error);
    }
    setDiseaseResult(result);
    setIsDetecting(false);
  };

  const handleWeatherSearch = async () => {
    if (!location.trim()) {
      setWeatherError("Enter a location to search.");
      return;
    }
    setWeatherError("");
    setWeatherResult(null);
    setIsLoadingWeather(true);
    const result = await getWeatherCropSuggestion(location.trim());
    if (result.error) {
      setWeatherError(result.error);
    }
    setWeatherResult(result);
    setIsLoadingWeather(false);
  };

  const handleSoilSearch = async () => {
    if (!soilLocation.trim()) {
      setSoilError("Enter a soil location or type.");
      return;
    }
    setSoilError("");
    setSoilResult(null);
    setIsLoadingSoil(true);
    const result = await getSoilPHInfo(soilLocation.trim());
    if (result.error) {
      setSoilError(result.error);
    }
    setSoilResult(result);
    setIsLoadingSoil(false);
  };

  const getWeatherCropSuggestion = async (loc) => {
    const data = await fetchWeather(loc);
    const crops = buildCropSuggestions(data);
    return { ...data, crops };
  };

  const buildCropSuggestions = (data) => {
    const items = [];
    const temp = data.temperature ?? 0;
    const humidity = data.humidity ?? 0;
    const rainfall = data.rainfall ?? 0;

    if (temp >= 20 && temp <= 30 && humidity > 50) {
      items.push("Tomato - thrives in warm, moderately humid climates.");
    }
    if (temp >= 18 && temp <= 28 && rainfall >= 2) {
      items.push("Corn - enjoys steady moisture and warm temperatures.");
    }
    if (temp <= 25 && humidity >= 60) {
      items.push("Lettuce - crisp heads form best with cooler, humid air.");
    }
    if (rainfall < 2) {
      items.push("Millet - drought-tolerant option for low rainfall.");
    }
    if (humidity >= 70) {
      items.push("Rice - high humidity and moisture suit paddy fields.");
    }
    while (items.length < 5) {
      items.push("Beans - versatile and nitrogen-fixing for most soils.");
    }
    return items.slice(0, 5);
  };

  const getSoilPHInfo = async (query) => {
    const data = await fetchSoil(query);
    const { ph, type } = data;
    let treatment = ph < 5.5 || ph > 7.5;
    return {
      ...data,
      needsTreatment: data.needsTreatment ?? treatment,
    };
  };

  const cropListMemo = useMemo(
    () => weatherResult?.crops ?? [],
    [weatherResult]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <h1 style={{ fontSize: "28px", margin: 0, fontWeight: 800 }}>
        Smart Farming Toolkit
      </h1>
      <div style={pageStyle}>
        {/* Plant Disease Detection */}
        <section style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={titleStyle}>Plant Disease Detection</h2>
            {isDetecting && <span style={badgeStyle}>Analyzing...</span>}
          </div>
          <label style={labelStyle}>Upload Plant Image</label>
          <input
            type="file"
            accept="image/*"
            style={inputStyle}
            onChange={(e) => {
              const file = e.target.files?.[0];
              setImageFile(file || null);
            }}
          />
          <button style={buttonStyle} onClick={handleDetectDisease}>
            {isDetecting ? "Analyzing..." : "Detect Disease"}
          </button>
          {diseaseError && <p style={errorStyle}>{diseaseError}</p>}
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Upload preview"
              style={{ width: "100%", borderRadius: "8px", objectFit: "cover" }}
            />
          )}
          {diseaseResult && (
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
              <p style={successStyle}>
                <strong>Disease:</strong> {diseaseResult.name}
              </p>
              <p style={successStyle}>
                <strong>Confidence:</strong> {diseaseResult.confidence?.toFixed(1)}%
              </p>
              <p style={successStyle}>
                <strong>Remedy:</strong> {diseaseResult.remedy}
              </p>
            </div>
          )}
        </section>

        {/* Weather → Crop Suggestion */}
        <section style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={titleStyle}>Weather → Crop Suggestion</h2>
            {isLoadingWeather && <span style={badgeStyle}>Loading...</span>}
          </div>
          <label style={labelStyle}>Location</label>
          <input
            type="text"
            placeholder="e.g., Nairobi"
            style={inputStyle}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button style={buttonStyle} onClick={handleWeatherSearch}>
            Search
          </button>
          {weatherError && <p style={errorStyle}>{weatherError}</p>}
          {weatherResult && (
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
              <p style={successStyle}>
                <strong>Temp:</strong> {weatherResult.temperature}°C |{" "}
                <strong>Humidity:</strong> {weatherResult.humidity}% |{" "}
                <strong>Rainfall:</strong> {weatherResult.rainfall}mm
              </p>
              <p style={successStyle}>
                <strong>Season/Month:</strong> {weatherResult.month}
              </p>
              <div style={{ marginTop: "8px" }}>
                <strong>Top 5 crops:</strong>
                <ul style={{ paddingLeft: "18px", marginTop: "6px", color: "#334155" }}>
                  {cropListMemo.map((crop, idx) => (
                    <li key={idx}>{crop}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Soil pH Analysis */}
        <section style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={titleStyle}>Soil pH Analysis</h2>
            {isLoadingSoil && <span style={badgeStyle}>Checking...</span>}
          </div>
          <label style={labelStyle}>Soil Location / Type</label>
          <input
            type="text"
            placeholder="e.g., Sandy, Farm 21"
            style={inputStyle}
            value={soilLocation}
            onChange={(e) => setSoilLocation(e.target.value)}
          />
          <button style={buttonStyle} onClick={handleSoilSearch}>
            Search
          </button>
          {soilError && <p style={errorStyle}>{soilError}</p>}
          {soilResult && (
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
              <p style={successStyle}>
                <strong>Soil Type:</strong> {soilResult.type}
              </p>
              <p style={successStyle}>
                <strong>pH Level:</strong> {soilResult.ph}
              </p>
              <p style={successStyle}>
                <strong>Best Crops:</strong> {soilResult.suggestedCrops?.join(", ")}
              </p>
              <p style={successStyle}>
                <strong>Treatment Needed:</strong>{" "}
                {soilResult.needsTreatment ? "Yes - adjust pH before planting." : "No - ready for planting."}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

