const PLANT_API_KEY =
  import.meta.env.VITE_PLANT_ID_API_KEY ||
  import.meta.env.VITE_PLANT_API_KEY ||
  "ENTER_MY_API_KEY_HERE";
const API_URL =
  import.meta.env.VITE_PLANT_ID_URL ||
  import.meta.env.VITE_PLANT_API_URL ||
  "https://api.plant.id/v3/health_assessment";

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

/**
 * Analyzes a plant image for diseases and health status
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise<Object>} Analysis results including disease info, health status, and similar images
 */
export async function detectDisease(imageFile) {
  try {
    if (!PLANT_API_KEY || PLANT_API_KEY === "ENTER_MY_API_KEY_HERE") {
      throw new Error("Plant API key missing. Please set VITE_PLANT_ID_API_KEY in your .env file.");
    }

    const base64 = await fileToBase64(imageFile);
    
    // Strictly following allowed modifiers
    const payload = {
      images: [base64],
      modifiers: [
        "classification_level=species",  // Using species for detailed classification
        "disease_model=full",           // Using full disease model
        "health=all"                    // Get all health information
      ],
      similar_images: true,              // Include similar images
      symptoms: true                     // Include symptoms
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": PLANT_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const disease = data?.diseases?.[0];
    const plantInfo = data?.plant;
    
    // Process similar images
    const similarImages = (data?.similar_images || []).map(img => ({
      url: img.url,
      similarity: img.similarity,
      license: img.license
    }));

    // Process symptoms if available
    const symptoms = disease?.symptoms?.map(s => s.description).join(". ") || "No specific symptoms detected.";
    
    // Get health status
    const healthStatus = {
      isHealthy: disease?.is_healthy || false,
      probability: disease?.probability ? Math.round(disease.probability * 100) : 0,
      isPlant: data?.is_plant?.probability > 0.5
    };

    // Get treatment and prevention
    const treatment = disease?.treatment?.chemical?.length > 0 
      ? disease.treatment.chemical[0].name 
      : disease?.treatment?.biological?.length > 0 
        ? disease.treatment.biological[0].name 
        : "No specific treatment available.";

    return {
      // Plant information
      plantName: plantInfo?.scientific_name?.[0] || "Unknown Plant",
      commonNames: plantInfo?.common_names || [],
      
      // Disease information
      disease: disease?.name ? {
        name: disease.name,
        scientificName: disease.scientific_name,
        description: disease.details?.description,
        treatment,
        probability: healthStatus.probability,
        symptoms
      } : null,
      
      // Health status
      isHealthy: healthStatus.isHealthy,
      isPlant: healthStatus.isPlant,
      
      // Additional data
      similarImages,
      rawData: data,  // Include raw data for debugging
      
      // Metadata
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("Error in detectDisease:", error);
    return {
      error: error.message || "Failed to analyze plant image. Please try again.",
      isPlant: false,
      isHealthy: false,
      similarImages: []
    };
  }
}

