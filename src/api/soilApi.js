const SOIL_API_KEY =
  import.meta.env.VITE_SOIL_API_KEY ||
  import.meta.env.VITE_PLANT_ID_API_KEY ||
  "ENTER_MY_API_KEY_HERE";
const SOIL_API_URL =
  import.meta.env.VITE_SOIL_API_URL ||
  import.meta.env.VITE_PLANT_ID_URL ||
  "https://api.plant.id/v3/identification";

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || "";
      const base64 = result.toString().split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function detectSoilByImage(imageFile) {
  try {
    if (!SOIL_API_KEY || SOIL_API_KEY === "ENTER_MY_API_KEY_HERE") {
      // Return sample data if API key is not set
      return {
        type: "Loamy Soil",
        ph: 6.5,
        bestCrops: ["Tomato", "Lettuce", "Corn", "Beans", "Peppers"],
        requiredNutrients: "Nitrogen (N), Phosphorus (P), Potassium (K), Calcium (Ca), Magnesium (Mg)",
        npkQuantity: "Apply NPK 10-10-10 at 2-3 kg per 100 square meters",
        organicContent: "Add 5-10% organic matter (compost or well-rotted manure)",
        recommendations: "This soil type is well-balanced. Maintain pH between 6.0-7.0. Add organic matter annually to improve structure and fertility.",
      };
    }

    const base64 = await fileToBase64(imageFile);
    const payload = {
      images: [base64],
      modifiers: ["crops_fast", "similar_images"],
      plant_details: ["common_names", "url", "name_authority", "wiki_description", "taxonomy"],
      language: "en",
    };

    const response = await fetch(SOIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": SOIL_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to analyze soil image");
    }

    const data = await response.json();
    
    // Extract soil information from API response
    // Note: Plant.id API is primarily for plant identification, so we'll provide
    // intelligent defaults based on common soil types
    const identifiedPlant = data?.result?.classification?.suggestions?.[0];
    
    // Determine soil type based on image analysis or use defaults
    const soilType = determineSoilType(identifiedPlant);
    const ph = getPHForSoilType(soilType);
    const crops = getBestCropsForSoilType(soilType);
    
    return {
      type: soilType,
      ph: ph,
      bestCrops: crops,
      requiredNutrients: getNutrientsForSoilType(soilType),
      npkQuantity: getNPKForSoilType(soilType),
      organicContent: getOrganicContentForSoilType(soilType),
      recommendations: getRecommendationsForSoilType(soilType, ph),
    };
  } catch (error) {
    // Return sample data on error so UI still works
    return {
      error: error.message || "Soil analysis unavailable. Check API key and internet, then retry.",
      type: "Loamy Soil",
      ph: 6.5,
      bestCrops: ["Tomato", "Lettuce", "Corn", "Beans", "Peppers"],
      requiredNutrients: "Nitrogen (N), Phosphorus (P), Potassium (K)",
      npkQuantity: "Apply NPK 10-10-10 at 2-3 kg per 100 square meters",
      organicContent: "Add 5-10% organic matter",
      recommendations: "Maintain pH between 6.0-7.0. Add organic matter annually.",
    };
  }
}

function determineSoilType(plantData) {
  // This is a simplified determination - in a real app, you'd use ML or specialized soil APIs
  if (!plantData) return "Loamy Soil";
  
  const plantName = (plantData.name || "").toLowerCase();
  if (plantName.includes("sandy") || plantName.includes("desert")) return "Sandy Soil";
  if (plantName.includes("clay")) return "Clay Soil";
  if (plantName.includes("peat") || plantName.includes("bog")) return "Peaty Soil";
  if (plantName.includes("chalk") || plantName.includes("limestone")) return "Chalky Soil";
  
  return "Loamy Soil"; // Default
}

function getPHForSoilType(type) {
  const phMap = {
    "Sandy Soil": 6.0,
    "Clay Soil": 7.0,
    "Loamy Soil": 6.5,
    "Peaty Soil": 5.5,
    "Chalky Soil": 7.5,
  };
  return phMap[type] || 6.5;
}

function getBestCropsForSoilType(type) {
  const cropMap = {
    "Sandy Soil": ["Carrots", "Potatoes", "Radishes", "Peanuts", "Sweet Potatoes"],
    "Clay Soil": ["Broccoli", "Cabbage", "Brussels Sprouts", "Kale", "Cauliflower"],
    "Loamy Soil": ["Tomato", "Lettuce", "Corn", "Beans", "Peppers"],
    "Peaty Soil": ["Blueberries", "Cranberries", "Potatoes", "Carrots", "Onions"],
    "Chalky Soil": ["Spinach", "Beets", "Sweet Corn", "Cabbage", "Broccoli"],
  };
  return cropMap[type] || ["Tomato", "Lettuce", "Corn", "Beans", "Peppers"];
}

function getNutrientsForSoilType(type) {
  const nutrientMap = {
    "Sandy Soil": "Nitrogen (N), Phosphorus (P), Potassium (K), Magnesium (Mg). Sandy soils drain quickly and need frequent fertilization.",
    "Clay Soil": "Nitrogen (N), Phosphorus (P), Potassium (K), Organic matter. Clay soils hold nutrients well but need better drainage.",
    "Loamy Soil": "Balanced NPK (10-10-10), Calcium (Ca), Magnesium (Mg). Loamy soils are well-balanced.",
    "Peaty Soil": "Nitrogen (N), Phosphorus (P), Potassium (K), Lime (to raise pH). Peaty soils are acidic.",
    "Chalky Soil": "Iron (Fe), Manganese (Mn), Zinc (Zn), Organic matter. Chalky soils are alkaline and may lock up some nutrients.",
  };
  return nutrientMap[type] || "Nitrogen (N), Phosphorus (P), Potassium (K)";
}

function getNPKForSoilType(type) {
  const npkMap = {
    "Sandy Soil": "Apply NPK 12-12-12 at 3-4 kg per 100 square meters, split into 2-3 applications",
    "Clay Soil": "Apply NPK 10-10-10 at 2-3 kg per 100 square meters, incorporate well",
    "Loamy Soil": "Apply NPK 10-10-10 at 2-3 kg per 100 square meters",
    "Peaty Soil": "Apply NPK 8-8-8 at 2-3 kg per 100 square meters, add lime to raise pH",
    "Chalky Soil": "Apply NPK 10-10-10 at 2-3 kg per 100 square meters, add chelated micronutrients",
  };
  return npkMap[type] || "Apply NPK 10-10-10 at 2-3 kg per 100 square meters";
}

function getOrganicContentForSoilType(type) {
  const organicMap = {
    "Sandy Soil": "Add 10-15% organic matter (compost, well-rotted manure) to improve water retention",
    "Clay Soil": "Add 5-10% organic matter to improve drainage and workability",
    "Loamy Soil": "Add 5-10% organic matter annually to maintain fertility",
    "Peaty Soil": "Add 5-8% organic matter, focus on composted materials",
    "Chalky Soil": "Add 8-12% organic matter to improve nutrient availability",
  };
  return organicMap[type] || "Add 5-10% organic matter (compost or well-rotted manure)";
}

function getRecommendationsForSoilType(type, ph) {
  let rec = `For ${type} with pH ${ph}: `;
  
  if (ph < 6.0) {
    rec += "Soil is acidic. Add lime to raise pH. ";
  } else if (ph > 7.5) {
    rec += "Soil is alkaline. Add sulfur or organic matter to lower pH. ";
  } else {
    rec += "pH is optimal for most crops. ";
  }
  
  if (type === "Sandy Soil") {
    rec += "Water frequently as sandy soil drains quickly. Use mulch to retain moisture.";
  } else if (type === "Clay Soil") {
    rec += "Improve drainage with organic matter. Avoid working soil when wet.";
  } else if (type === "Loamy Soil") {
    rec += "Maintain organic matter levels. This is ideal soil for most crops.";
  } else if (type === "Peaty Soil") {
    rec += "Raise pH with lime. Add drainage if waterlogged.";
  } else if (type === "Chalky Soil") {
    rec += "Add organic matter and chelated micronutrients. Monitor for nutrient deficiencies.";
  }
  
  return rec;
}

// Legacy function for backward compatibility
export async function fetchSoil(locationOrType) {
  try {
    // This function is kept for backward compatibility
    // In a real implementation, you might call a location-based soil API
    return {
      ph: 6.5,
      type: "Loam",
      needsTreatment: false,
      suggestedCrops: ["Tomato", "Lettuce", "Corn", "Beans", "Peppers"],
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

