const containerStyle = {
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  borderRadius: "12px",
  padding: "24px",
};

const titleStyle = { fontSize: "24px", fontWeight: 700, marginBottom: "12px" };

const textStyle = { lineHeight: 1.6, color: "#334155" };

export default function Home() {
  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Smart Farming Dashboard</h1>
      <p style={textStyle}>
        Welcome to the smart farming demo. Use the navigation bar to explore
        pest detection, weather-based crop suggestions, and soil health
        insights. Each feature runs directly in the browser with quick inline
        styles for a lightweight experience.
      </p>
    </div>
  );
}

