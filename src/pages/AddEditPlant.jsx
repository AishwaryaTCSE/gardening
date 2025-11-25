import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlants } from '../context/PlantContext';
import { FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';

const AddEditPlant = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { addPlant, updatePlant, getPlantById } = usePlants();

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    image: '',
    waterFrequency: 7,
    lastWatered: new Date().toISOString().split('T')[0],
    notes: '',
    health: 'healthy',
    sunlight: 'medium',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const plant = getPlantById(id);
      if (plant) {
        setFormData({
          name: plant.name || '',
          species: plant.species || '',
          image: plant.image || '',
          waterFrequency: plant.waterFrequency || 7,
          lastWatered: plant.lastWatered ? new Date(plant.lastWatered).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          notes: plant.notes || '',
          health: plant.health || 'healthy',
          sunlight: plant.sunlight || 'medium',
        });
        if (plant.image) {
          setPreviewImage(plant.image);
        }
      }
    }
  }, [id, isEditMode, getPlantById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage('');
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isEditMode) {
        await updatePlant(id, formData);
      } else {
        await addPlant(formData);
      }
      navigate('/plants');
    } catch (error) {
      console.error('Error saving plant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Plant' : 'Add New Plant'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plant Image */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Plant Image
            </label>
            <div className="mt-1 flex items-center">
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Plant preview"
                    className="h-40 w-40 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUpload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 2MB)</p>
                    </div>
                    <input
                      id="image-upload"
                      name="image"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Plant Details */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Plant Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="species" className="block text-sm font-medium text-gray-700">
                Species <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="species"
                name="species"
                value={formData.species}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="waterFrequency" className="block text-sm font-medium text-gray-700">
                Watering Frequency (days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="waterFrequency"
                name="waterFrequency"
                min="1"
                value={formData.waterFrequency}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="lastWatered" className="block text-sm font-medium text-gray-700">
                Last Watered
              </label>
              <input
                type="date"
                id="lastWatered"
                name="lastWatered"
                value={formData.lastWatered}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="sunlight" className="block text-sm font-medium text-gray-700">
                Sunlight Requirements
              </label>
              <select
                id="sunlight"
                name="sunlight"
                value={formData.sunlight}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="low">Low Light</option>
                <option value="medium">Medium Light</option>
                <option value="high">Bright Light</option>
              </select>
            </div>

            <div>
              <label htmlFor="health" className="block text-sm font-medium text-gray-700">
                Plant Health
              </label>
              <select
                id="health"
                name="health"
                value={formData.health}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="healthy">Healthy</option>
                <option value="needs-care">Needs Care</option>
                <option value="struggling">Struggling</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <div className="mt-1">
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full border border-gray-300 rounded-md sm:text-sm p-2"
              placeholder="Add any notes about your plant..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Plant'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditPlant;