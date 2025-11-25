import { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

// Sample initial tasks
const initialTasks = [
  {
    id: 1,
    title: 'Water tomatoes',
    type: 'watering',
    plantId: 1,
    dueDate: new Date(),
    priority: 'high',
    completed: false,
    notes: 'Check soil moisture first',
  },
  {
    id: 2,
    title: 'Prune roses',
    type: 'pruning',
    plantId: 3,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    priority: 'medium',
    completed: false,
    notes: 'Remove dead or crossing branches',
  },
  {
    id: 3,
    title: 'Fertilize vegetables',
    type: 'fertilizing',
    plantId: 1,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
    priority: 'medium',
    completed: false,
    notes: 'Use organic vegetable fertilizer',
  },
];

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    // Load tasks from localStorage if available, otherwise use initialTasks
    const savedTasks = localStorage.getItem('gardening_tasks');
    return savedTasks ? JSON.parse(savedTasks) : initialTasks;
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gardening_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (newTask) => {
    try {
      setIsLoading(true);
      const taskWithId = {
        ...newTask,
        id: Date.now(), // Simple ID generation
        createdAt: new Date(),
        completed: false,
      };
      setTasks([...tasks, taskWithId]);
      return { success: true, task: taskWithId };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = (id, updatedFields) => {
    try {
      setIsLoading(true);
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, ...updatedFields, updatedAt: new Date() } : task
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

  const deleteTask = (id) => {
    try {
      setIsLoading(true);
      setTasks(tasks.filter((task) => task.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      return updateTask(id, { 
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null 
      });
    }
    return { success: false, error: 'Task not found' };
  };

  const getTaskById = (id) => {
    return tasks.find((task) => task.id === id);
  };

  // Get tasks due today or overdue
  const getTodaysTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks
      .filter(
        (task) =>
          !task.completed &&
          new Date(task.dueDate).setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0)
      )
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  // Get upcoming tasks (next 7 days)
  const getUpcomingTasks = (limit = 5) => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return tasks
      .filter(
        (task) =>
          !task.completed &&
          new Date(task.dueDate) >= today &&
          new Date(task.dueDate) <= nextWeek
      )
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, limit);
  };

  // Get tasks by plant ID
  const getTasksByPlantId = (plantId) => {
    return tasks.filter((task) => task.plantId === plantId);
  };

  // Get tasks by type (watering, pruning, etc.)
  const getTasksByType = (type) => {
    return tasks.filter((task) => task.type === type);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        selectedTask,
        isLoading,
        error,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        getTaskById,
        getTodaysTasks,
        getUpcomingTasks,
        getTasksByPlantId,
        getTasksByType,
        setSelectedTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext;