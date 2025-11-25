import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FiPlus, 
  FiFilter, 
  FiSearch, 
  FiCalendar, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClock,
  FiList,
  FiX
} from 'react-icons/fi';
import { useTasks } from '../context/TaskContext';
import { usePlants } from '../context/PlantContext';
import TaskCard from '../components/TaskCard';

// Helper component for summary cards
const SummaryCard = ({ title, count, icon, color, active, onClick }) => (
  <div 
    className={`p-4 rounded-lg cursor-pointer transition-colors ${active ? 'ring-2 ring-green-500' : 'hover:bg-gray-50'} ${color} bg-opacity-50`}
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className={`p-2 rounded-full ${color} bg-opacity-30`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold">{count}</p>
      </div>
    </div>
  </div>
);

const TaskList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plantId = searchParams.get('plantId');
  
  const { tasks, getTasksByPlantId, getTodaysTasks, getUpcomingTasks } = useTasks();
  const { plants } = usePlants();
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [plantFilter, setPlantFilter] = useState(plantId || 'all');
  const [taskTypeFilter, setTaskTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get plant name for the header if filtered by plant
  const currentPlant = plantId ? plants.find(p => p.id === parseInt(plantId)) : null;

  // Check if a task is due today
  const isDueToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const dueDate = new Date(dateString);
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  };

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    // Filter by plant if plantId is in URL or plantFilter is set
    if (plantId && task.plantId !== parseInt(plantId)) return false;
    if (plantFilter !== 'all' && task.plantId !== parseInt(plantFilter)) return false;
    
    // Filter by status
    if (statusFilter === 'completed' && !task.completed) return false;
    if (statusFilter === 'pending' && task.completed) return false;
    if (statusFilter === 'overdue' && (task.completed || new Date(task.dueDate) >= new Date())) return false;
    if (statusFilter === 'today' && !isDueToday(task.dueDate)) return false;
    
    // Filter by task type
    if (taskTypeFilter !== 'all' && task.type !== taskTypeFilter) return false;
    
    // Filter by priority
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const plant = plants.find(p => p.id === task.plantId);
      const plantName = plant ? plant.name.toLowerCase() : '';
      
      if (!task.title.toLowerCase().includes(term) && 
          !(task.notes && task.notes.toLowerCase().includes(term)) &&
          !plantName.includes(term)) {
        return false;
      }
    }
    
    return true;
  });

  // Get task counts for summary
  const taskCounts = {
    all: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length,
    today: tasks.filter(t => !t.completed && isDueToday(t.dueDate)).length
  };

  // Get unique task types for filter
  const taskTypes = [...new Set(tasks.map(task => task.type))];

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPlantFilter('all');
    setTaskTypeFilter('all');
    setPriorityFilter('all');
  };

  // Check if any filter is active
  const isFilterActive = 
    searchTerm || 
    statusFilter !== 'all' || 
    (plantFilter !== 'all' && !plantId) || 
    taskTypeFilter !== 'all' || 
    priorityFilter !== 'all';

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentPlant ? `${currentPlant.name} Tasks` : 'All Tasks'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FiFilter className="mr-2 h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            onClick={() => navigate('/tasks/add' + (plantId ? `?plantId=${plantId}` : ''))}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FiX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due Today</option>
              </select>
            </div>

            {/* Plant Filter (only show if not already filtered by plant) */}
            {!plantId && (
              <div>
                <label htmlFor="plant" className="block text-sm font-medium text-gray-700 mb-1">
                  Plant
                </label>
                <select
                  id="plant"
                  name="plant"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  value={plantFilter}
                  onChange={(e) => setPlantFilter(e.target.value)}
                >
                  <option value="all">All Plants</option>
                  {plants.map(plant => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Task Type Filter */}
            <div>
              <label htmlFor="taskType" className="block text-sm font-medium text-gray-700 mb-1">
                Task Type
              </label>
              <select
                id="taskType"
                name="taskType"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                value={taskTypeFilter}
                onChange={(e) => setTaskTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {taskTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {isFilterActive && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                <FiX className="mr-1 h-4 w-4" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <SummaryCard 
          title="All Tasks" 
          count={taskCounts.all} 
          icon={<FiList className="h-5 w-5" />}
          color="bg-gray-100 text-gray-800"
          active={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
        />
        <SummaryCard 
          title="Pending" 
          count={taskCounts.pending} 
          icon={<FiClock className="h-5 w-5" />}
          color="bg-blue-100 text-blue-800"
          active={statusFilter === 'pending'}
          onClick={() => setStatusFilter('pending')}
        />
        <SummaryCard 
          title="Due Today" 
          count={taskCounts.today} 
          icon={<FiCalendar className="h-5 w-5" />}
          color="bg-yellow-100 text-yellow-800"
          active={statusFilter === 'today'}
          onClick={() => setStatusFilter('today')}
        />
        <SummaryCard 
          title="Overdue" 
          count={taskCounts.overdue} 
          icon={<FiAlertCircle className="h-5 w-5" />}
          color="bg-red-100 text-red-800"
          active={statusFilter === 'overdue'}
          onClick={() => setStatusFilter('overdue')}
        />
        <SummaryCard 
          title="Completed" 
          count={taskCounts.completed} 
          icon={<FiCheckCircle className="h-5 w-5" />}
          color="bg-green-100 text-green-800"
          active={statusFilter === 'completed'}
          onClick={() => setStatusFilter('completed')}
        />
      </div>

      {/* Task List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {filteredTasks.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredTasks.map(task => {
              const plant = plants.find(p => p.id === task.plantId);
              return (
                <li key={task.id}>
                  <TaskCard 
                    task={{
                      ...task,
                      plantName: plant?.name
                    }} 
                    onTaskUpdate={() => {}}
                    showPlant={!plantId}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-12">
            <FiList className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isFilterActive 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating a new task.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/tasks/add')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                New Task
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;