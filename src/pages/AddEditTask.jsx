import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiSave, FiX, FiCalendar, FiInfo } from 'react-icons/fi';
import { useTasks } from '../context/TaskContext';
import { usePlants } from '../context/PlantContext';

const AddEditTask = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const plantId = searchParams.get('plantId');
  
  const { addTask, updateTask, getTaskById } = useTasks();
  const { plants } = usePlants();
  
  const isEditMode = Boolean(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'watering',
    plantId: plantId || '',
    dueDate: new Date().toISOString().slice(0, 16),
    priority: 'medium',
    completed: false,
    notes: ''
  });

  // Load task data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const task = getTaskById(parseInt(id));
      if (task) {
        setFormData({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''
        });
      } else {
        setError('Task not found');
      }
    }
  }, [id, isEditMode, getTaskById]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const taskData = {
        ...formData,
        plantId: formData.plantId ? parseInt(formData.plantId) : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
      };

      if (isEditMode) {
        await updateTask(parseInt(id), taskData);
      } else {
        await addTask(taskData);
      }
      navigate(-1); // Go back to previous page
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Task' : 'Add New Task'}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-gray-500"
          aria-label="Close"
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="e.g., Water the plants"
              />
            </div>

            {/* Task Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Task Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="watering">Watering</option>
                <option value="fertilizing">Fertilizing</option>
                <option value="pruning">Pruning</option>
                <option value="repotting">Repotting</option>
                <option value="checkup">Checkup</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Plant Selection */}
            <div>
              <label htmlFor="plantId" className="block text-sm font-medium text-gray-700">
                Plant (Optional)
              </label>
              <select
                id="plantId"
                name="plantId"
                value={formData.plantId || ''}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="">Select a plant (optional)</option>
                {plants.map(plant => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date & Time
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border border-gray-300 rounded-md py-2"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['low', 'medium', 'high'].map(priority => (
                  <label
                    key={priority}
                    className={`relative flex items-center p-3 border rounded-md cursor-pointer ${
                      formData.priority === priority
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={formData.priority === priority}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="ml-3 block text-sm font-medium text-gray-700 capitalize">
                      {priority}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                  placeholder="Any additional notes about this task..."
                />
              </div>
            </div>

            {/* Completed Checkbox */}
            {isEditMode && (
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="completed"
                    name="completed"
                    type="checkbox"
                    checked={formData.completed}
                    onChange={handleChange}
                    className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="completed" className="font-medium text-gray-700">
                    Mark as completed
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditTask;