import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiDroplet, FiSun } from 'react-icons/fi';
import { usePlants } from '../context/PlantContext';

const PlantLibrary = () => {
  const { plants, deletePlant } = usePlants();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [filteredPlants, setFilteredPlants] = useState(plants);

  // Filter plants based on search and filter
  useEffect(() => {
    let result = [...plants];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(plant => 
        plant.name.toLowerCase().includes(term) || 
        plant.species?.toLowerCase().includes(term) ||
        plant.notes?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(plant => plant.health === filter);
    }

    setFilteredPlants(result);
  }, [plants, searchTerm, filter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plant? This action cannot be undone.')) {
      await deletePlant(id);
    }
  };

  const getHealthBadgeClass = (health) => {
    switch (health) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'needs-attention':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSunlightIcon = (sunlight) => {
    switch (sunlight) {
      case 'full':
        return <FiSun className="text-yellow-500" />;
      case 'partial':
        return <FiSun className="text-yellow-300" />;
      case 'shade':
        return <FiSun className="text-gray-400" />;
      default:
        return <FiSun className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plant Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredPlants.length} {filteredPlants.length === 1 ? 'plant' : 'plants'} found
          </p>
        </div>
        <Link
          to="/plants/add"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FiPlus className="-ml-1 mr-2 h-5 w-5" />
          Add New Plant
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Plants</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="needs-attention">Needs Attention</option>
                <option value="poor">Poor</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiFilter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plants Grid */}
      {filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlants.map((plant) => (
            <div key={plant.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="h-48 bg-gray-200 overflow-hidden">
                {plant.image ? (
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-plant.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <FiPlant className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{plant.name}</h3>
                    {plant.species && (
                      <p className="text-sm text-gray-500">{plant.species}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/plants/edit/${plant.id}`}
                      className="text-gray-400 hover:text-green-600"
                      title="Edit plant"
                    >
                      <FiEdit2 className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(plant.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete plant"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthBadgeClass(plant.health)}`}>
                    {plant.health.replace('-', ' ')}
                  </span>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    {plant.waterFrequency && (
                      <span className="flex items-center" title={`Water every ${plant.waterFrequency} days`}>
                        <FiDroplet className="mr-1 text-blue-400" />
                        {plant.waterFrequency}d
                      </span>
                    )}
                    {plant.sunlight && (
                      <span className="flex items-center" title={`${plant.sunlight} sunlight`}>
                        {getSunlightIcon(plant.sunlight)}
                      </span>
                    )}
                  </div>
                </div>
                
                {plant.notes && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {plant.notes}
                  </p>
                )}
                
                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/plants/${plant.id}`}
                    className="text-sm font-medium text-green-600 hover:text-green-500"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FiPlant className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No plants found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding a new plant.'}
          </p>
          <div className="mt-6">
            <Link
              to="/plants/add"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Add Plant
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantLibrary;