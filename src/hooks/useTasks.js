import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import tasksData from '../data/tasks.json';

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage('tasks', tasksData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addTask = (newTask) => {
    try {
      const taskWithId = {
        ...newTask,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        completed: false
      };
      setTasks(prev => [...prev, taskWithId]);
      return taskWithId;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const updateTask = (id, updatedFields) => {
    try {
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, ...updatedFields, updatedAt: new Date().toISOString() } : task
        )
      );
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleTaskCompletion = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { 
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null 
      });
    }
  };

  const getTasksByPlantId = (plantId) => {
    return tasks.filter(task => task.plantId === plantId);
  };

  const getUpcomingTasks = (limit = 5) => {
    const today = new Date();
    return tasks
      .filter(task => !task.completed && new Date(task.dueDate) >= today)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, limit);
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTasksByPlantId,
    getUpcomingTasks
  };
}