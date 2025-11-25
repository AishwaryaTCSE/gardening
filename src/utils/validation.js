// Validation utility functions
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

export const validatePlantData = (plantData) => {
  const errors = {};
  
  if (!plantData.name || plantData.name.trim() === '') {
    errors.name = 'Plant name is required';
  }
  
  if (!plantData.species || plantData.species.trim() === '') {
    errors.species = 'Species is required';
  }
  
  if (!plantData.waterFrequency || isNaN(plantData.waterFrequency) || plantData.waterFrequency < 1) {
    errors.waterFrequency = 'Please enter a valid watering frequency';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateTaskData = (taskData) => {
  const errors = {};
  
  if (!taskData.title || taskData.title.trim() === '') {
    errors.title = 'Task title is required';
  }
  
  if (!taskData.dueDate) {
    errors.dueDate = 'Due date is required';
  } else if (new Date(taskData.dueDate) < new Date()) {
    errors.dueDate = 'Due date cannot be in the past';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};