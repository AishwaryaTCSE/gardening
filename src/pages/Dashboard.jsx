import { Link } from 'react-router-dom';
import { 
  FiPlus, 
  FiClipboard, 
  FiDroplet, 
  FiAlertTriangle, 
  FiSun,
  FiCalendar,
  FiScissors 
} from 'react-icons/fi';

const Dashboard = () => {
  // Sample data - in a real app, this would come from your state management
  const upcomingTasks = [
    { id: 1, title: 'Water tomatoes', due: 'Today', priority: 'high', type: 'watering' },
    { id: 2, title: 'Prune roses', due: 'Tomorrow', priority: 'medium', type: 'pruning' },
    { id: 3, title: 'Fertilize vegetables', due: 'In 2 days', priority: 'medium', type: 'fertilizing' },
  ];

  const recentPlants = [
    { id: 1, name: 'Tomato', added: '2 days ago', health: 'good', image: '/placeholder-plant-1.jpg' },
    { id: 2, name: 'Basil', added: '1 week ago', health: 'excellent', image: '/placeholder-plant-2.jpg' },
    { id: 3, name: 'Rose', added: '2 weeks ago', health: 'needs-attention', image: '/placeholder-plant-3.jpg' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'needs-attention':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, Gardener! 👋</h1>
        <p className="mt-2 text-gray-600">Here's what's happening in your garden today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Plants Card */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <FiSun className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Plants</p>
            <p className="text-2xl font-semibold">24</p>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <FiCalendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Upcoming Tasks</p>
            <p className="text-2xl font-semibold">5</p>
          </div>
        </div>

        {/* Watering Card */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
            <FiDroplet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Needs Watering</p>
            <p className="text-2xl font-semibold">3</p>
          </div>
        </div>

        {/* Issues Card */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <FiAlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Needs Attention</p>
            <p className="text-2xl font-semibold">2</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            <Link to="/tasks" className="text-sm text-green-600 hover:text-green-700 font-medium">View All</Link>
          </div>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-full ${task.type === 'watering' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                  {task.type === 'watering' ? <FiDroplet className="h-5 w-5" /> : <FiScissors className="h-5 w-5" />}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-500">Due {task.due}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
            <button className="w-full mt-2 flex items-center justify-center p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              <FiPlus className="h-4 w-4 mr-2" />
              <span>Add New Task</span>
            </button>
          </div>
        </div>

        {/* Recent Plants */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Plants</h2>
            <Link to="/plants" className="text-sm text-green-600 hover:text-green-700 font-medium">View All</Link>
          </div>
          <div className="space-y-4">
            {recentPlants.map((plant) => (
              <div key={plant.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                  <img className="h-full w-full object-cover" src={plant.image} alt={plant.name} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">{plant.name}</p>
                  <div className="flex items-center">
                    <span className={`h-2 w-2 rounded-full ${getHealthColor(plant.health)} mr-2`}></span>
                    <span className="text-xs text-gray-500 capitalize">
                      {plant.health.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{plant.added}</span>
              </div>
            ))}
            <button className="w-full mt-2 flex items-center justify-center p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              <FiPlus className="h-4 w-4 mr-2" />
              <span>Add New Plant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/plants/add" className="p-4 border rounded-lg text-center hover:bg-gray-50">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-2">
              <FiPlus className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">Add Plant</span>
          </Link>
          <Link to="/tasks/add" className="p-4 border rounded-lg text-center hover:bg-gray-50">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-2">
              <FiCalendar className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">Add Task</span>
          </Link>
          <Link to="/journal/new" className="p-4 border rounded-lg text-center hover:bg-gray-50">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-purple-600 mb-2">
              <FiClipboard className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">New Journal Entry</span>
          </Link>
          <Link to="/garden" className="p-4 border rounded-lg text-center hover:bg-gray-50">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 text-yellow-600 mb-2">
              <FiDroplet className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">Plan Garden</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;