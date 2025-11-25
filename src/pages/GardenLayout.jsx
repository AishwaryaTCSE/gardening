import { useState } from 'react';
import { FiPlus, FiSave, FiGrid, FiTrash2, FiRotateCcw } from 'react-icons/fi';
import GardenPlot from '../components/GardenPlot';

const GardenLayout = () => {
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [currentLayout, setCurrentLayout] = useState({
    name: 'My Garden',
    rows: 8,
    cols: 12,
    plants: {}
  });

  const handleSaveLayout = () => {
    const newLayout = {
      ...currentLayout,
      lastSaved: new Date().toISOString()
    };
    setSavedLayouts(prev => [newLayout, ...prev].slice(0, 5)); // Keep last 5 layouts
    // In a real app, you would save to a database here
  };

  const handlePlantPlaced = (row, col, plant) => {
    setCurrentLayout(prev => ({
      ...prev,
      plants: {
        ...prev.plants,
        [`${row}-${col}`]: {
          plant,
          plantedAt: new Date().toISOString()
        }
      }
    }));
  };

  const clearGarden = () => {
    if (window.confirm('Are you sure you want to clear your garden layout?')) {
      setCurrentLayout(prev => ({
        ...prev,
        plants: {}
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Garden Area */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Garden Planner</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveLayout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiSave className="mr-2 h-4 w-4" />
                Save Layout
              </button>
              <button
                onClick={clearGarden}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <GardenPlot 
              rows={currentLayout.rows}
              cols={currentLayout.cols}
              onPlotSelect={handlePlantPlaced}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Saved Layouts */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Saved Layouts</h2>
            {savedLayouts.length > 0 ? (
              <ul className="space-y-2">
                {savedLayouts.map((layout, index) => (
                  <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm font-medium">{layout.name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(layout.lastSaved).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No saved layouts yet.</p>
            )}
          </div>

          {/* Garden Stats */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Garden Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Total Plants</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.keys(currentLayout.plants).length}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Garden Size</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {currentLayout.rows}×{currentLayout.cols}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <span>Add Plant</span>
                <FiPlus className="h-4 w-4" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <span>Change Layout</span>
                <FiGrid className="h-4 w-4" />
              </button>
              <button 
                onClick={clearGarden}
                className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-red-600 bg-white hover:bg-red-50"
              >
                <span>Reset Garden</span>
                <FiRotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenLayout;