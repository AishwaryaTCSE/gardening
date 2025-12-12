import { useEffect, useState } from "react";
import { detectDisease as detectDiseaseApi } from "../api/plantApi";

const pageStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  width: "100%",
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
    try {
      const result = await detectDiseaseApi(imageFile);
      if (result.error) {
        setDiseaseError(result.error);
      } else {
        setDiseaseResult(result);
      }
    } catch (error) {
      setDiseaseError(error.message || "Failed to detect disease. Please try again.");
    } finally {
      setIsDetecting(false);
    }
  };


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 28px)", margin: 0, fontWeight: 800 }}>
          Plant Disease Detection
        </h1>
        <p style={{ color: "#64748b", fontSize: "clamp(14px, 2vw, 16px)", marginTop: "8px" }}>
          Upload an image of your plant to detect diseases and get treatment recommendations.
        </p>
      </div>
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
          <button 
            style={{
              ...buttonStyle,
              opacity: isDetecting ? 0.7 : 1,
              cursor: isDetecting ? "not-allowed" : "pointer",
            }} 
            onClick={handleDetectDisease}
            disabled={isDetecting}
          >
            {isDetecting ? "Analyzing..." : "Detect Disease"}
          </button>
          {diseaseError && (
            <div style={{ ...errorStyle, padding: "10px", backgroundColor: "#fee2e2", borderRadius: "8px", marginTop: "8px" }}>
              {diseaseError}
            </div>
          )}
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Upload preview"
              style={{ 
                width: "100%", 
                maxHeight: "400px",
                borderRadius: "8px", 
                objectFit: "cover",
                border: "1px solid #e2e8f0"
              }}
            />
          )}
          {diseaseResult && !diseaseResult.error && (
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginTop: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px", color: "#14532d" }}>
                Detection Results
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <strong style={{ color: "#14532d" }}>Disease Name:</strong>{" "}
                  <span style={{ color: "#0f172a" }}>{diseaseResult.name}</span>
                </div>
                <div>
                  <strong style={{ color: "#14532d" }}>Confidence Score:</strong>{" "}
                  <span style={{ color: "#0f172a" }}>
                    {diseaseResult.confidence?.toFixed(1) || "N/A"}%
                  </span>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <strong style={{ color: "#14532d" }}>Treatment Suggestions:</strong>
                  <p style={{ color: "#334155", marginTop: "4px", lineHeight: 1.6 }}>
                    {diseaseResult.remedy || "No treatment information available."}
                  </p>
                </div>
                {diseaseResult.preventive && (
                  <div style={{ marginTop: "8px" }}>
                    <strong style={{ color: "#14532d" }}>Preventive Measures:</strong>
                    <p style={{ color: "#334155", marginTop: "4px", lineHeight: 1.6 }}>
                      {diseaseResult.preventive}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

