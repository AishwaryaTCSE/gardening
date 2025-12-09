const cardStyle = {
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  borderRadius: "12px",
  padding: "24px",
  color: "#0f172a",
};

const titleStyle = { fontSize: "24px", fontWeight: 700, marginBottom: "12px" };
const textStyle = { lineHeight: 1.6, color: "#334155" };
const listStyle = { paddingLeft: "18px", color: "#334155" };

export default function Soil() {
  return (
    <div style={cardStyle}>
      <h1 style={titleStyle}>Soil Health Guide</h1>
      <p style={textStyle}>
        This section highlights general soil best practices. For interactive pH
        analysis and crop recommendations, head to the Pests page where soil
        and weather tools are available side by side.
      </p>
      <ul style={listStyle}>
        <li>Maintain organic matter with compost and cover crops.</li>
        <li>Monitor pH annually to keep nutrients available.</li>
        <li>Use mulching to preserve moisture and regulate temperature.</li>
      </ul>
    </div>
  );
}

