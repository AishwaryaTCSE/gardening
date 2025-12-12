import { useEffect, useState } from "react";
import { detectSoilByImage } from "../api/soilApi";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  width: "100%",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const titleStyle = { fontSize: "24px", fontWeight: 700, margin: 0, color: "#14532d" };
const subtitleStyle = { fontSize: "16px", color: "#64748b", marginTop: "-8px" };
const labelStyle = { fontWeight: 600, color: "#14532d", fontSize: "14px" };
const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  width: "100%",
};

const buttonStyle = {
  padding: "12px 24px",
  backgroundColor: "#16a34a",
  color: "#f0fdf4",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "14px",
  transition: "background-color 0.2s ease",
};

const errorStyle = { 
  color: "#b91c1c", 
  fontWeight: 600,
  padding: "12px",
  backgroundColor: "#fee2e2",
  borderRadius: "8px",
  marginTop: "8px",
};

const successStyle = { color: "#0f172a", lineHeight: 1.6 };
const badgeStyle = {
  display: "inline-block",
  backgroundColor: "#dcfce7",
  color: "#166534",
  padding: "6px 12px",
  borderRadius: "9999px",
  fontWeight: 700,
  fontSize: "12px",
};

const resultCardStyle = {
  background: "#f8fafc",
  padding: "20px",
  borderRadius: "8px",
  marginTop: "12px",
  border: "1px solid #e2e8f0",
};

export default function Soil() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [soilResult, setSoilResult] = useState(null);
  const [soilError, setSoilError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!imageFile) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const handleAnalyzeSoil = async () => {
    if (!imageFile) {
      setSoilError("Please upload a soil image first.");
      return;
    }
    setSoilError("");
    setSoilResult(null);
    setIsAnalyzing(true);
    try {
      const result = await detectSoilByImage(imageFile);
      if (result.error) {
        setSoilError(result.error);
      }
      setSoilResult(result);
    } catch (error) {
      setSoilError(error.message || "Failed to analyze soil. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={{ ...titleStyle, fontSize: "clamp(20px, 5vw, 24px)" }}>Soil Analysis</h1>
        <p style={{ ...subtitleStyle, fontSize: "clamp(14px, 2vw, 16px)", marginTop: "8px" }}>
          Upload an image of your soil to identify soil type, get crop recommendations, and nutrient requirements.
        </p>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#14532d" }}>
            Upload Soil Image
          </h2>
          {isAnalyzing && <span style={badgeStyle}>Analyzing...</span>}
        </div>

        <label style={labelStyle}>Select Soil Image</label>
        <input
          type="file"
          accept="image/*"
          style={inputStyle}
          onChange={(e) => {
            const file = e.target.files?.[0];
            setImageFile(file || null);
            setSoilResult(null);
            setSoilError("");
          }}
        />

        {imagePreview && (
          <div style={{ marginTop: "8px" }}>
            <img
              src={imagePreview}
              alt="Soil preview"
              style={{
                width: "100%",
                maxHeight: "300px",
                borderRadius: "8px",
                objectFit: "cover",
                border: "1px solid #e2e8f0",
              }}
            />
          </div>
        )}

        <button
          style={{
            ...buttonStyle,
            opacity: isAnalyzing ? 0.7 : 1,
            cursor: isAnalyzing ? "not-allowed" : "pointer",
          }}
          onClick={handleAnalyzeSoil}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analyzing Soil..." : "Analyze Soil"}
        </button>

        {soilError && <div style={errorStyle}>{soilError}</div>}

        {soilResult && (
          <div style={resultCardStyle}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "#14532d" }}>
              Analysis Results
            </h3>

            {soilResult.error && (
              <div style={{ ...errorStyle, marginBottom: "12px" }}>
                {soilResult.error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <strong style={{ color: "#14532d" }}>Soil Type:</strong>{" "}
                <span style={successStyle}>{soilResult.type || "Unknown"}</span>
              </div>

              {soilResult.ph && (
                <div>
                  <strong style={{ color: "#14532d" }}>pH Level:</strong>{" "}
                  <span style={successStyle}>{soilResult.ph}</span>
                </div>
              )}

              {soilResult.bestCrops && soilResult.bestCrops.length > 0 && (
                <div>
                  <strong style={{ color: "#14532d" }}>Best Crops:</strong>
                  <ul style={{ paddingLeft: "20px", marginTop: "4px", color: "#334155" }}>
                    {soilResult.bestCrops.map((crop, idx) => (
                      <li key={idx} style={{ marginBottom: "4px" }}>{crop}</li>
                    ))}
                  </ul>
                </div>
              )}

              {soilResult.requiredNutrients && (
                <div>
                  <strong style={{ color: "#14532d" }}>Required Nutrients:</strong>
                  <p style={{ ...successStyle, marginTop: "4px" }}>
                    {soilResult.requiredNutrients}
                  </p>
                </div>
              )}

              {soilResult.npkQuantity && (
                <div>
                  <strong style={{ color: "#14532d" }}>NPK Quantity to Add:</strong>
                  <p style={{ ...successStyle, marginTop: "4px" }}>
                    {soilResult.npkQuantity}
                  </p>
                </div>
              )}

              {soilResult.organicContent && (
                <div>
                  <strong style={{ color: "#14532d" }}>Organic Content Required:</strong>
                  <p style={{ ...successStyle, marginTop: "4px" }}>
                    {soilResult.organicContent}
                  </p>
                </div>
              )}

              {soilResult.recommendations && (
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                  <strong style={{ color: "#14532d" }}>Recommendations:</strong>
                  <p style={{ ...successStyle, marginTop: "4px" }}>
                    {soilResult.recommendations}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
