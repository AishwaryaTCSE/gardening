import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiTrash2, 
  FiDroplet, 
  FiSun, 
  FiCalendar, 
  FiClock, 
  FiInfo,
  FiChevronRight
} from 'react-icons/fi';
import { usePlants } from '../context/PlantContext';

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { plants, deletePlant } = usePlants();
  const [plant, setPlant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const foundPlant = plants.find(p => p.id === parseInt(id));
    if (foundPlant) {
      setPlant(foundPlant);
    } else {
      // Handle plant not found
      navigate('/plants');
    }
    setIsLoading(false);
  }, [id, plants, navigate]);

  const handleDelete = async () => {
    try {
      await deletePlant(parseInt(id));
      navigate('/plants');
    } catch (error) {
      console.error('Error deleting plant:', error);
    }
  };

  const getHealthStatus = (health) => {
    switch (health) {
      case 'excellent':
        return { text: 'Excellent', color: 'text-green-600 bg-green-100' };
      case 'good':
        return { text: 'Good', color: 'text-blue-600 bg-blue-100' };
      case 'needs-attention':
        return { text: 'Needs Attention', color: 'text-yellow-600 bg-yellow-100' };
      case 'poor':
        return { text: 'Needs Care', color: 'text-red-600 bg-red-100' };
      default:
        return { text: 'Unknown', color: 'text-gray-600 bg-gray-100' };
    }
  };

  const getSunlightText = (sunlight) => {
    switch (sunlight) {
      case 'full':
        return 'Full Sun (6+ hours)';
      case 'partial':
        return 'Partial Sun (3-6 hours)';
      case 'shade':
        return 'Shade (Less than 3 hours)';
      default:
        return sunlight || 'Not specified';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading || !plant) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const healthStatus = getHealthStatus(plant.health);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{plant.name}</h1>
        <div className="ml-auto flex space-x-2">
          <Link
            to={`/plants/edit/${plant.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FiEdit className="-ml-1 mr-2 h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FiTrash2 className="-ml-1 mr-2 h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden bg-gray-200">
              {plant.image ? (
                <img
                  src={plant.image}
                  alt={plant.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-plant.jpg';
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <FiPlant className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-lg leading-6 font-medium text-gray-900">{plant.name}</h2>
              {plant.species && (
                <p className="text-sm text-gray-500">{plant.species}</p>
              )}
            </div>
            <div className="ml-auto">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${healthStatus.color}`}>
                {healthStatus.text}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FiInfo className="mr-2 h-4 w-4 text-gray-400" />
                About
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {plant.notes || 'No additional information available.'}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FiSun className="mr-2 h-4 w-4 text-yellow-500" />
                Sunlight
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {getSunlightText(plant.sunlight)}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FiDroplet className="mr-2 h-4 w-4 text-blue-400" />
                Watering
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                Every {plant.waterFrequency || 'N/A'} days
                {plant.lastWatered && (
                  <span className="block text-xs text-gray-500 mt-1">
                    Last watered: {formatDate(plant.lastWatered)}
                  </span>
                )}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FiCalendar className="mr-2 h-4 w-4 text-green-500" />
                Added to Garden
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(plant.addedDate)}
              </dd>
            </div>

            {plant.lastFertilized && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FiDroplet className="mr-2 h-4 w-4 text-yellow-500" />
                  Last Fertilized
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(plant.lastFertilized)}
                </dd>
              </div>
            )}

            {plant.nextFertilize && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FiClock className="mr-2 h-4 w-4 text-purple-500" />
                  Next Fertilization
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(plant.nextFertilize)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link
              to={`/tasks?plantId=${plant.id}`}
              className="font-medium text-green-600 hover:text-green-500 flex items-center"
            >
              View all tasks for this plant
              <FiChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <FiTrash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete {plant.name}?
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this plant? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDetail;