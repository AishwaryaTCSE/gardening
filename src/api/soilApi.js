const SOIL_API =
  import.meta.env.VITE_SOIL_API_KEY || "ENTER_MY_SOIL_API_KEY";
const API_URL =
  import.meta.env.VITE_SOIL_API_URL || "https://example-soil-api.com/v1/soil";

export async function fetchSoil(locationOrType) {
  try {
    if (!SOIL_API || SOIL_API === "ENTER_MY_SOIL_API_KEY") {
      throw new Error("Soil API key missing");
    }

    const response = await fetch(
      `${API_URL}?q=${encodeURIComponent(locationOrType)}`,
      {
        headers: { Authorization: `Bearer ${SOIL_API}` },
      }
    );

    if (!response.ok) {
      throw new Error("Unable to fetch soil data");
    }

    const data = await response.json();
    return {
      ph: data?.ph ?? 6.5,
      type: data?.type ?? "Loam",
      needsTreatment: data?.needsTreatment ?? false,
      suggestedCrops:
        data?.suggestedCrops ?? ["Tomato", "Lettuce", "Corn", "Beans", "Peppers"],
    };
  } catch (error) {
    return {
      error: error.message,
      ph: 6.2,
      type: "Loam",
      needsTreatment: false,
      suggestedCrops: ["Tomato", "Strawberry", "Spinach", "Peas", "Onion"],
    };
  }
}

