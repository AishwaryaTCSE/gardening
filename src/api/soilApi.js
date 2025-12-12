// Using VITE_PLANT_ID_API_KEY first as it appears to be valid
const SOIL_API_KEY =
  import.meta.env.VITE_PLANT_ID_API_KEY ||
  import.meta.env.VITE_SOIL_API_KEY ||
  "";
const SOIL_API_URL =
  import.meta.env.VITE_SOIL_API_URL ||
  import.meta.env.VITE_PLANT_ID_URL ||
  "https://api.plant.id/v3/identification";
const SOIL_PROXY = import.meta.env.VITE_SOIL_PROXY || "/api/soil-id";
const SOIL_DIRECT = import.meta.env.VITE_SOIL_DIRECT === "true";

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
    const useDirect = SOIL_DIRECT;
    const endpoint = useDirect ? SOIL_API_URL : SOIL_PROXY;

    if (useDirect && !SOIL_API_KEY) {
      return {
        error:
          "Soil API key missing. Set VITE_SOIL_API_KEY (Plant.id key) in .env to fetch real results.",
        type: "Loamy Soil",
        ph: 6.5,
        bestCrops: ["Tomato", "Lettuce", "Corn", "Beans", "Peppers"],
        requiredNutrients:
          "Nitrogen (N), Phosphorus (P), Potassium (K), Calcium (Ca), Magnesium (Mg)",
        npkQuantity: "Apply NPK 10-10-10 at 2-3 kg per 100 square meters",
        organicContent: "Add 5-10% organic matter (compost or well-rotted manure)",
        recommendations:
          "This soil type is well-balanced. Maintain pH between 6.0-7.0. Add organic matter annually to improve structure and fertility.",
      };
    }

    const base64 = await fileToBase64(imageFile);
    const payload = {
      images: [base64],
      // Using only allowed modifiers for soil analysis
      classification_level: "species",
      disease_model: "general",
      health: "all",
      similar_images: true,
      symptoms: true
    };

    const headers = {
      "Content-Type": "application/json",
    };
    // Always forward the key when we have it (proxy can strip it if needed)
    if (SOIL_API_KEY) {
      headers["Api-Key"] = SOIL_API_KEY;
    }
    
    // Log request details for debugging
    console.log('Sending request to:', endpoint);
    console.log('Headers:', headers);
    console.log('Payload:', {
      ...payload,
      images: ['[BASE64_IMAGE_DATA]'] // Don't log the full base64 string
    });
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const rawErrorText = await response.text();
      let errorData;
      try {
        errorData = rawErrorText ? JSON.parse(rawErrorText) : {};
      } catch (e) {
        errorData = { message: rawErrorText };
      }
      
      let errorMessage = "Failed to analyze soil image";
      
      if (response.status === 400) {
        errorMessage = `Bad request: ${errorData.message || 'Invalid request format'}`;
      } else if (response.status === 401) {
        errorMessage = "Invalid or unauthorized API key. Please check your Plant.id API key in the .env file.";
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (response.statusText) {
        errorMessage = response.statusText;
      }
      
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        request: {
          url: endpoint,
          headers: headers,
          payload: {
            ...payload,
            images: ['[BASE64_IMAGE_DATA]']
          }
        }
      });
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.details = errorData;
      throw error;
    }

    const data = await response.json();
    
    // Extract soil information from API response
    const identifiedPlant = data?.result?.classification?.suggestions?.[0];
    
    // Determine soil type based on image analysis or use defaults
    const soilType = await determineSoilType(identifiedPlant, base64);
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

async function determineSoilType(plantData, base64Image) {
  // If we have plant data, try to determine soil type from it
  if (plantData) {
    const plantName = (plantData.name || "").toLowerCase();
    if (plantName.includes("sandy") || plantName.includes("desert")) return "Sandy Soil";
    if (plantName.includes("clay")) return "Clay Soil";
    if (plantName.includes("peat") || plantName.includes("bog")) return "Peaty Soil";
    if (plantName.includes("chalk") || plantName.includes("limestone")) return "Chalky Soil";
  }
  
  // If no plant data or couldn't determine from plant data, try to analyze image
  if (base64Image) {
    try {
      // Create an image element to analyze colors
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64Image}`;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Create a canvas to analyze the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      // Sample some pixels from the image
      const sampleSize = 100;
      let darkPixels = 0;
      let redPixels = 0;
      let brownPixels = 0;
      let lightPixels = 0;
      
      for (let i = 0; i < sampleSize; i++) {
        const x = Math.floor(Math.random() * img.width);
        const y = Math.floor(Math.random() * img.height);
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const [r, g, b] = pixel;
        
        // Calculate brightness
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // Check for red soil (reddish hue)
        if (r > g * 1.2 && r > b * 1.2) redPixels++;
        // Check for dark soil (likely black soil)
        else if (brightness < 40) darkPixels++;
        // Check for brown soil (brownish hue)
        else if (r > 100 && g > 50 && b < 100) brownPixels++;
        // Light colored soil
        else if (brightness > 180) lightPixels++;
      }
      
      // Determine soil type based on pixel analysis
      if (darkPixels > sampleSize * 0.4) return "Black Soil";
      if (redPixels > sampleSize * 0.3) return "Red Soil";
      if (brownPixels > sampleSize * 0.4) return "Loamy Soil";
      if (lightPixels > sampleSize * 0.5) return "Sandy Soil";
      
    } catch (error) {
      console.error('Error analyzing soil image:', error);
    }
  }
  
  // Default fallback if no other method works
  return "Loamy Soil";
}

function getPHForSoilType(type) {
  const phMap = {
    "Sandy Soil": 6.0,
    "Clay Soil": 7.0,
    "Loamy Soil": 6.5,
    "Peaty Soil": 5.5,
    "Chalky Soil": 7.5,
    "Black Soil": 7.0,
    "Red Soil": 6.0,
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
    "Black Soil": ["Cotton", "Soybean", "Sugarcane", "Wheat", "Pulses"],
    "Red Soil": ["Millets", "Tobacco", "Potato", "Oilseeds", "Citrus Fruits"],
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
    "Black Soil": "Nitrogen (N), Phosphorus (P), Calcium (Ca), Magnesium (Mg). Black soils are rich in clay and moisture-retentive.",
    "Red Soil": "Nitrogen (N), Phosphorus (P), Organic matter. Red soils are typically deficient in nitrogen and humus.",
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
    "Black Soil": "Apply NPK 12-12-15 at 2-3 kg per 100 square meters, add organic matter",
    "Red Soil": "Apply NPK 15-15-10 at 2.5-3.5 kg per 100 square meters, add organic compost",
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
    "Black Soil": "Add 5-8% organic matter to maintain soil structure and fertility",
    "Red Soil": "Add 10-12% organic matter to improve water retention and nutrient content",
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
  } else if (type === "Black Soil") {
    rec += "Retains moisture well. Add organic matter to maintain structure. Ideal for cotton and cereals.";
  } else if (type === "Red Soil") {
    rec += "Improve with organic matter. Good drainage but may need additional nutrients.";
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

