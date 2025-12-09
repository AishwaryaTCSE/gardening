// Optional integration with Plant.id API.
// Uses `import.meta.env.VITE_PLANT_ID_API_KEY` if present.
// Falls back to caller to handle mock suggestions when no key is set.

export async function identifyPlantByImageDataUrl(dataUrl, apiKey) {
  try {
    if (!apiKey) {
      throw new Error('Missing API key');
    }

    // Extract base64 payload from data URL
    const commaIndex = dataUrl.indexOf(',');
    const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;

    const body = {
      images: [base64],
      modifiers: ['crops_fast'],
      plant_language: 'en',
      plant_details: [
        'common_names',
        'url',
        'taxonomy',
        'wiki_description',
        'wiki_image',
      ],
    };

    const res = await fetch('https://api.plant.id/v2/identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Plant.id error ${res.status}: ${text}`);
    }

    const data = await res.json();
    // Normalize suggestions robustly (support different response shapes)
    const suggestions = Array.isArray(data.suggestions)
      ? data.suggestions.map((s) => {
          const commonName =
            (s.plant?.common_names && s.plant.common_names[0]) ||
            (s.species?.common_names && s.species.common_names[0]);
          const scientificName =
            s.plant?.scientific_name || s.species?.scientific_name || s.plant?.name || s.species?.name;
          const displayName = commonName || scientificName || s.plant_name || 'Unknown';
          return {
            id:
              s.id ||
              scientificName ||
              displayName ||
              Math.random().toString(36).slice(2),
            name: displayName,
            species: scientificName || '',
            probability: typeof s.probability === 'number' ? s.probability : null,
            url: s.plant?.url || s.species?.url || null,
          };
        })
      : [];

    return { suggestions };
  } catch (err) {
    return { error: err.message, suggestions: [] };
  }
}