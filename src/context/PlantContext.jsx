import { createContext, useContext, useState, useEffect } from 'react';

const PlantContext = createContext();

// Sample initial data
const initialPlants = [
  {
    id: 1,
    name: 'Tomato',
    species: 'Solanum lycopersicum',
    image: '/placeholder-plant-1.jpg',
    addedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    lastWatered: new Date(),
    waterFrequency: 2, // days
    sunlight: 'full',
    health: 'good',
    notes: 'Planted in the raised bed. Looking healthy!',
  },
  {
    id: 2,
    name: 'Basil',
    species: 'Ocimum basilicum',
    image: '/placeholder-plant-2.jpg',
    addedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    lastWatered: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    waterFrequency: 1, // days
    sunlight: 'partial',
    health: 'excellent',
    notes: 'Growing well in the kitchen window.',
  },
  {
    id: 3,
    name: 'Rose',
    species: 'Rosa',
    image: '/placeholder-plant-3.jpg',
    addedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    lastWatered: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    waterFrequency: 3, // days
    sunlight: 'full',
    health: 'needs-attention',
    notes: 'Some yellowing leaves. Check for pests.',
  },
];

export const PlantProvider = ({ children }) => {
  const [plants, setPlants] = useState(() => {
    // Load plants from localStorage if available, otherwise use initialPlants
    const savedPlants = localStorage.getItem('gardening_plants');
    return savedPlants ? JSON.parse(savedPlants) : initialPlants;
  });
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save plants to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gardening_plants', JSON.stringify(plants));
  }, [plants]);

  const addPlant = (newPlant) => {
    try {
      setIsLoading(true);
      const plantWithId = {
        ...newPlant,
        id: Date.now(), // Simple ID generation
        addedDate: new Date(),
        lastWatered: new Date(),
      };
      setPlants([...plants, plantWithId]);
      return { success: true, plant: plantWithId };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlant = (id, updatedFields) => {
    try {
      setIsLoading(true);
      setPlants(
        plants.map((plant) =>
          plant.id === id ? { ...plant, ...updatedFields, lastUpdated: new Date() } : plant
        )
      );
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlant = (id) => {
    try {
      setIsLoading(true);
      setPlants(plants.filter((plant) => plant.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const waterPlant = (id) => {
    return updatePlant(id, { lastWatered: new Date() });
  };

  const getPlantById = (id) => {
    return plants.find((plant) => plant.id === id);
  };

  // Get plants that need watering (not watered in the last 'waterFrequency' days)
  const getPlantsNeedingWater = () => {
    const now = new Date();
    return plants.filter((plant) => {
      const daysSinceWatered = Math.floor(
        (now - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24)
      );
      return daysSinceWatered >= plant.waterFrequency;
    });
  };

  // Get recently added plants (last 7 days)
  const getRecentPlants = (limit = 5) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return plants
      .filter((plant) => new Date(plant.addedDate) >= oneWeekAgo)
      .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
      .slice(0, limit);
  };

  return (
    <PlantContext.Provider
      value={{
        plants,
        selectedPlant,
        isLoading,
        error,
        addPlant,
        updatePlant,
        deletePlant,
        waterPlant,
        getPlantById,
        getPlantsNeedingWater,
        getRecentPlants,
        setSelectedPlant,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
};

export const usePlants = () => {
  const context = useContext(PlantContext);
  if (context === undefined) {
    throw new Error('usePlants must be used within a PlantProvider');
  }
  return context;
};

export default PlantContext;