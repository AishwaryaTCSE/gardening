import { FiCheck, FiClock, FiAlertCircle, FiCheckCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useTasks } from '../context/TaskContext';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ task, onTaskUpdate, showPlant = true }) => {
  const { toggleTaskCompletion, deleteTask } = useTasks();
  const navigate = useNavigate();

  const isOverdue = !task.completed && new Date(task.dueDate) < new Date();
  const isDueToday = !task.completed && 
    new Date(task.dueDate).toDateString() === new Date().toDateString();

  // Get priority color
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get task type icon
  const getTaskTypeIcon = () => {
    switch (task.type) {
      case 'watering': return '💧';
      case 'fertilizing': return '🌱';
      case 'pruning': return '✂️';
      case 'repotting': return '🪴';
      case 'checkup': return '🔍';
      default: return '📝';
    }
  };

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    await toggleTaskCompletion(task.id);
    if (onTaskUpdate) onTaskUpdate();
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/tasks/edit/${task.id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
      if (onTaskUpdate) onTaskUpdate();
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div 
      className={`border rounded-lg p-4 mb-3 transition-all duration-200 ${
        task.completed 
          ? 'bg-gray-50 border-gray-200' 
          : isOverdue 
            ? 'bg-red-50 border-red-200' 
            : isDueToday
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-sm'
      }`}
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <button
            onClick={handleToggleComplete}
            className={`mt-1 flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center ${
              task.completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300 hover:border-green-500'
            }`}
            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.completed && <FiCheck className="h-3 w-3" />}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className={`text-sm font-medium ${
                task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
              
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
              </span>
              
              {!task.completed && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor()}`}>
                  {task.priority} priority
                </span>
              )}
              
              {isOverdue && !task.completed && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center">
                  <FiAlertCircle className="mr-1" /> Overdue
                </span>
              )}
              
              {isDueToday && !task.completed && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                  <FiClock className="mr-1" /> Due today
                </span>
              )}
              
              {task.completed && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 flex items-center">
                  <FiCheckCircle className="mr-1" /> Completed
                </span>
              )}
            </div>
            
            {task.dueDate && (
              <p className={`text-xs mt-1 ${
                task.completed ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <FiClock className="inline mr-1" />
                {formatDate(task.dueDate)}
              </p>
            )}
            
            {task.notes && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.notes}
              </p>
            )}
            
            {showPlant && task.plantId && (
              <div className="mt-2 text-xs text-gray-500">
                Plant: {task.plantName || `#${task.plantId}`}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={handleEdit}
            className="p-1 text-gray-400 hover:text-green-600"
            aria-label="Edit task"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600"
            aria-label="Delete task"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;