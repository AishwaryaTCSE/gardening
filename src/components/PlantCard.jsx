import { Link } from 'react-router-dom';
import { FiDroplet, FiSun, FiCalendar, FiEdit2, FiTrash2 } from 'react-icons/fi';

const PlantCard = ({ 
  plant, 
  onDelete,
  onWater,
  className = '' 
}) => {
  const {
    id,
    name,
    species,
    image,
    lastWatered,
    nextWatering,
    location,
    healthStatus = 'healthy'
  } = plant;

  const getStatusColor = () => {
    switch (healthStatus.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'needs-attention':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const daysUntilWatering = nextWatering 
    ? Math.ceil((new Date(nextWatering) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}>
      {/* Plant Image */}
      <div className="relative h-48 bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <span>No Image</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {healthStatus}
          </span>
        </div>
      </div>

      {/* Plant Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{species}</p>
          </div>
          {location && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {location}
            </span>
          )}
        </div>

        {/* Watering Info */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <FiDroplet className="mr-2 text-blue-500" />
            <span>
              {daysUntilWatering !== null 
                ? `Water in ${daysUntilWatering} ${daysUntilWatering === 1 ? 'day' : 'days'}` 
                : 'No watering scheduled'}
            </span>
          </div>
          {lastWatered && (
            <div className="flex items-center text-sm text-gray-500">
              <FiCalendar className="mr-2 text-gray-400" />
              <span>Last watered: {new Date(lastWatered).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => onWater && onWater(id)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiDroplet className="mr-1" />
              Water
            </button>
            <Link
              to={`/plants/edit/${id}`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiEdit2 className="mr-1" />
              Edit
            </Link>
          </div>
          <button
            onClick={() => onDelete && onDelete(id)}
            className="text-gray-400 hover:text-red-500 focus:outline-none"
            aria-label="Delete plant"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;