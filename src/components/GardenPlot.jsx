import { useState, useRef, useEffect } from 'react';
import { FiPlus, FiMinus, FiRotateCw, FiGrid, FiX } from 'react-icons/fi';

const GardenPlot = ({ rows = 5, cols = 5, onPlotSelect }) => {
  const [zoom, setZoom] = useState(1);
  const [plants, setPlants] = useState({});
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Sample plant data - in a real app, this would come from props or context
  const availablePlants = [
    { id: 'tomato', name: 'Tomato', color: 'bg-red-500' },
    { id: 'carrot', name: 'Carrot', color: 'bg-orange-500' },
    { id: 'lettuce', name: 'Lettuce', color: 'bg-green-500' },
    { id: 'pepper', name: 'Pepper', color: 'bg-yellow-500' },
  ];

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleCellClick = (row, col) => {
    if (selectedPlant) {
      const plantId = `${row}-${col}`;
      setPlants(prev => ({
        ...prev,
        [plantId]: {
          id: plantId,
          plant: selectedPlant,
          position: { row, col }
        }
      }));
      onPlotSelect?.(row, col, selectedPlant);
      setSelectedPlant(null);
    }
  };

  const handlePlantSelect = (plant) => {
    setSelectedPlant(plant);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Prevent text selection while dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      return () => {
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Garden Plot</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleZoomIn}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title="Zoom In"
          >
            <FiPlus />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title="Zoom Out"
          >
            <FiMinus />
          </button>
          <button
            onClick={handleReset}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title="Reset View"
          >
            <FiRotateCw />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Select Plant</h3>
        <div className="flex flex-wrap gap-2">
          {availablePlants.map(plant => (
            <button
              key={plant.id}
              onClick={() => handlePlantSelect(plant)}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                selectedPlant?.id === plant.id 
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span 
                className={`w-3 h-3 rounded-full ${plant.color} mr-2`} 
                aria-hidden="true"
              />
              {plant.name}
            </button>
          ))}
          {selectedPlant && (
            <button
              onClick={() => setSelectedPlant(null)}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
              title="Clear selection"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative overflow-hidden border border-gray-200 rounded-lg bg-gray-50"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          height: '500px',
          cursor: isDragging ? 'grabbing' : selectedPlant ? 'crosshair' : 'grab',
        }}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '2px',
            padding: '1rem',
            width: '100%',
            height: '100%',
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const cellId = `${row}-${col}`;
            const plant = plants[cellId];
            
            return (
              <div
                key={cellId}
                onClick={() => handleCellClick(row, col)}
                className={`
                  aspect-square border border-gray-200 bg-white flex items-center justify-center
                  hover:bg-gray-50 transition-colors relative
                  ${selectedPlant ? 'cursor-crosshair' : 'cursor-pointer'}
                `}
              >
                {plant ? (
                  <div 
                    className={`w-3/4 h-3/4 rounded-full ${plant.plant.color} flex items-center justify-center text-white font-medium text-xs`}
                    title={plant.plant.name}
                  >
                    {plant.plant.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <FiGrid className="text-gray-200" />
                )}
                <div className="absolute bottom-0 right-0 text-[8px] text-gray-400">
                  {row},{col}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
        <div>
          {selectedPlant ? (
            <span>Click on a cell to place <strong>{selectedPlant.name}</strong></span>
          ) : (
            <span>Select a plant to place in your garden</span>
          )}
        </div>
        <div className="text-xs">
          {rows}×{cols} grid
        </div>
      </div>
    </div>
  );
};

export default GardenPlot;