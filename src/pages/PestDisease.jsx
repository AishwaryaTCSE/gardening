import { useState } from 'react';
import { FiSearch, FiAlertTriangle, FiDroplet, FiSun, FiWind } from 'react-icons/fi';

const PestDisease = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for pests and diseases
  const issues = [
    {
      id: 1,
      name: 'Aphids',
      type: 'pest',
      affectedPlants: ['Roses', 'Tomatoes', 'Peppers'],
      symptoms: 'Sticky leaves, stunted growth, curled leaves',
      treatment: 'Spray with insecticidal soap or neem oil. Introduce ladybugs.',
      prevention: 'Encourage natural predators, avoid over-fertilizing',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 2,
      name: 'Powdery Mildew',
      type: 'disease',
      affectedPlants: ['Cucumbers', 'Squash', 'Roses'],
      symptoms: 'White powdery spots on leaves and stems',
      treatment: 'Apply fungicide, remove affected leaves, improve air circulation',
      prevention: 'Water at the base, ensure proper spacing, choose resistant varieties',
      image: 'https://images.unsplash.com/photo-1596693542740-2f4cacd0b1a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    }
  ];

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         issue.affectedPlants.some(plant => 
                           plant.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesCategory = selectedCategory === 'all' || issue.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plant Health Center</h1>
          <p className="text-gray-600">Identify and treat common plant pests and diseases</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Search by pest, disease, or plant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="pest">Pests</option>
                <option value="disease">Diseases</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issues Grid */}
        {filteredIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-gray-100 relative">
                  {issue.image && (
                    <img
                      src={issue.image}
                      alt={issue.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    issue.type === 'pest' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {issue.type === 'pest' ? 'Pest' : 'Disease'}
                  </span>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{issue.name}</h3>
                  
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Affects:</h4>
                    <div className="flex flex-wrap gap-1">
                      {issue.affectedPlants.map((plant, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {plant}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <h4 className="font-medium text-gray-700">Symptoms:</h4>
                      <p>{issue.symptoms}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Treatment:</h4>
                      <p>{issue.treatment}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Prevention:</h4>
                      <p>{issue.prevention}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiAlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No issues found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery 
                ? 'No pests or diseases match your search.'
                : 'No pests or diseases found in this category.'}
            </p>
          </div>
        )}

        {/* Prevention Tips */}
        <div className="mt-12 bg-green-50 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Prevention Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <FiDroplet className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Water Properly</h3>
                <p className="mt-1 text-sm text-gray-500">Water at the base of plants to keep foliage dry and prevent fungal diseases.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <FiSun className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Provide Adequate Sunlight</h3>
                <p className="mt-1 text-sm text-gray-500">Ensure plants get the right amount of sunlight to promote healthy growth.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <FiWind className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Ensure Good Airflow</h3>
                <p className="mt-1 text-sm text-gray-500">Space plants properly to allow for air circulation and reduce humidity.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <FiAlertTriangle className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Inspect Regularly</h3>
                <p className="mt-1 text-sm text-gray-500">Check plants often for early signs of problems to address them quickly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PestDisease;