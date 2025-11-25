import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import plantsData from '../data/plants.json';

export function usePlants() {
  const [plants, setPlants] = useLocalStorage('plants', plantsData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addPlant = (newPlant) => {
    try {
      const plantWithId = {
        ...newPlant,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setPlants(prev => [...prev, plantWithId]);
      return plantWithId;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const updatePlant = (id, updatedFields) => {
    try {
      setPlants(prev => 
        prev.map(plant => 
          plant.id === id ? { ...plant, ...updatedFields, updatedAt: new Date().toISOString() } : plant
        )
      );
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const deletePlant = (id) => {
    setPlants(prev => prev.filter(plant => plant.id !== id));
  };

  const getPlantById = (id) => {
    return plants.find(plant => plant.id === id);
  };

  const waterPlant = (id) => {
    const plant = getPlantById(id);
    if (plant) {
      const today = new Date();
      const nextWatering = new Date(today);
      nextWatering.setDate(today.getDate() + (plant.waterFrequency || 7));
      
      updatePlant(id, {
        lastWatered: today.toISOString(),
        nextWatering: nextWatering.toISOString()
      });
    }
  };

  return {
    plants,
    loading,
    error,
    addPlant,
    updatePlant,
    deletePlant,
    getPlantById,
    waterPlant
  };
}