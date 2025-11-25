// Storage utility functions
export const saveToLocalStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// Helper for handling large data with compression (basic implementation)
export const compressData = (data) => {
  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('Error compressing data:', error);
    return null;
  }
};

export const decompressData = (compressedData) => {
  try {
    return JSON.parse(atob(compressedData));
  } catch (error) {
    console.error('Error decompressing data:', error);
    return null;
  }
};