import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import adminApi from '../../services/adminApi';
import ImageUpload from '../../components/admin/ImageUpload';
import FormModal from '../../components/admin/FormModal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import SuccessModal from '../../components/admin/SuccessModal';

const AdminHeroImages = () => {
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editingHeroImage, setEditingHeroImage] = useState(null);
  const [deletingHeroImage, setDeletingHeroImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tagline: '',
    imageUrl: '',
    bgColor: 'from-orange-800 via-orange-900 to-orange-950',
    linkUrl: '/shop',
    linkText: 'Shop Collection',
    isActive: true,
    sortOrder: 0
  });
  const [dragStartIndex, setDragStartIndex] = useState(null);

  const bgColorOptions = [
    { value: 'from-orange-200 via-orange-300 to-orange-400', label: 'Light Orange' },
    { value: 'from-amber-950 via-amber-900 to-stone-900', label: 'Dark Amber' },
    { value: 'from-gray-700 via-gray-600 to-gray-800', label: 'Dark Gray' },
    { value: 'from-orange-800 via-orange-900 to-orange-950', label: 'Dark Orange' },
    { value: 'from-amber-800 via-amber-900 to-amber-950', label: 'Dark Brown' },
    { value: 'from-stone-800 via-stone-900 to-stone-950', label: 'Dark Stone' },
    { value: 'from-neutral-800 via-neutral-900 to-neutral-950', label: 'Dark Neutral' },
    { value: 'from-slate-800 via-slate-900 to-slate-950', label: 'Dark Slate' },
    { value: 'from-zinc-800 via-zinc-900 to-zinc-950', label: 'Dark Zinc' },
    { value: 'from-orange-700 via-orange-800 to-orange-900', label: 'Medium Dark Orange' },
    { value: 'from-amber-700 via-amber-800 to-amber-900', label: 'Medium Dark Brown' },
    { value: 'from-stone-700 via-stone-800 to-stone-900', label: 'Medium Dark Stone' },
    { value: 'from-gray-800 via-gray-900 to-black', label: 'Charcoal' },
    { value: 'from-orange-900 via-red-900 to-red-950', label: 'Dark Orange Red' },
    { value: 'from-amber-900 via-orange-900 to-orange-950', label: 'Dark Brown Orange' }
  ];

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    try {
      setLoading(true);
      const response = await adminApi.heroImages.getAllHeroImages();
      setHeroImages(response.heroImages || []);
    } catch (error) {
      console.error('Error fetching hero images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (uploadResult) => {
    // Handle both direct URL string and upload result object
    const imageUrl = typeof uploadResult === 'string' ? uploadResult : uploadResult.url;
    setFormData(prev => ({
      ...prev,
      imageUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHeroImage) {
        await adminApi.heroImages.updateHeroImage(editingHeroImage._id, formData);
        setSuccessMessage('Hero image updated successfully!');
      } else {
        await adminApi.heroImages.createHeroImage(formData);
        setSuccessMessage('Hero image created successfully!');
      }
      
      setShowFormModal(false);
      setShowSuccessModal(true);
      resetForm();
      fetchHeroImages();
    } catch (error) {
      console.error('Error saving hero image:', error);
    }
  };

  const handleEdit = (heroImage) => {
    setEditingHeroImage(heroImage);
    setFormData({
      title: heroImage.title,
      subtitle: heroImage.subtitle,
      tagline: heroImage.tagline,
      imageUrl: heroImage.imageUrl,
      bgColor: heroImage.bgColor,
      linkUrl: heroImage.linkUrl,
      linkText: heroImage.linkText,
      isActive: heroImage.isActive,
      sortOrder: heroImage.sortOrder
    });
    setShowFormModal(true);
  };

  const handleDelete = (heroImage) => {
    setDeletingHeroImage(heroImage);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await adminApi.heroImages.deleteHeroImage(deletingHeroImage._id);
      setSuccessMessage('Hero image deleted successfully!');
      setShowDeleteModal(false);
      setShowSuccessModal(true);
      fetchHeroImages();
    } catch (error) {
      console.error('Error deleting hero image:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      tagline: '',
      imageUrl: '',
      bgColor: 'from-orange-800 via-orange-900 to-orange-950',
      linkUrl: '/shop',
      linkText: 'Shop Collection',
      isActive: true,
      sortOrder: 0
    });
    setEditingHeroImage(null);
  };

  const handleDragStart = (e, index) => {
    setDragStartIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (dragStartIndex === null || dragStartIndex === dropIndex) return;

    const newHeroImages = [...heroImages];
    const draggedItem = newHeroImages[dragStartIndex];
    newHeroImages.splice(dragStartIndex, 1);
    newHeroImages.splice(dropIndex, 0, draggedItem);

    // Update sort orders
    const updatedHeroImages = newHeroImages.map((item, index) => ({
      ...item,
      sortOrder: index
    }));

    setHeroImages(updatedHeroImages);

    try {
      const sortData = updatedHeroImages.map((item, index) => ({
        id: item._id,
        sortOrder: index
      }));
      await adminApi.heroImages.bulkUpdateSortOrder(sortData);
    } catch (error) {
      console.error('Error updating sort order:', error);
      fetchHeroImages(); // Revert on error
    }

    setDragStartIndex(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hero Images</h1>
            <p className="text-gray-600">Manage hero section images and content</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowFormModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Hero Image
          </button>
        </div>

        {/* Hero Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {heroImages.map((heroImage, index) => (
            <div
              key={heroImage._id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                heroImage.isActive ? 'border-green-200' : 'border-gray-200'
              } hover:shadow-lg transition-shadow cursor-move`}
            >
              {/* Image Preview */}
              <div className="relative h-48 bg-gray-100">
                {heroImage.imageUrl ? (
                  <img
                    src={heroImage.imageUrl}
                    alt={heroImage.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    heroImage.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {heroImage.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Sort Order */}
                <div className="absolute top-2 left-2">
                  <span className="bg-black bg-opacity-50 text-white px-2 py-1 text-xs font-semibold rounded">
                    #{heroImage.sortOrder + 1}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{heroImage.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{heroImage.subtitle}</p>
                <p className="text-xs text-gray-500 mb-3">{heroImage.tagline}</p>
                
                {/* Background Color Preview */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xs text-gray-500">BG:</span>
                  <div className={`w-6 h-4 rounded bg-gradient-to-r ${heroImage.bgColor}`}></div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(heroImage)}
                    className="flex-1 bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(heroImage)}
                    className="flex-1 bg-red-50 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {heroImages.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hero Images</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first hero image.</p>
            <button
              onClick={() => {
                resetForm();
                setShowFormModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Hero Image
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          resetForm();
        }}
        title={editingHeroImage ? 'Edit Hero Image' : 'Add Hero Image'}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Image *
            </label>
            <ImageUpload
              onUpload={handleImageUpload}
              className="w-full"
            />
            {formData.imageUrl && (
              <div className="mt-4">
                <img
                  src={formData.imageUrl}
                  alt="Hero image preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Soft Orange"
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle *
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Sweatshirt"
              required
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline *
            </label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Made From Cotton"
              required
            />
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color *
            </label>
            <select
              name="bgColor"
              value={formData.bgColor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {bgColorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link URL
            </label>
            <input
              type="text"
              name="linkUrl"
              value={formData.linkUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="/shop"
            />
          </div>

          {/* Link Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Text
            </label>
            <input
              type="text"
              name="linkText"
              value={formData.linkText}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Shop Collection"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort Order
            </label>
            <input
              type="number"
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Hero Image"
        message={`Are you sure you want to delete "${deletingHeroImage?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmClass="bg-red-600 hover:bg-red-700"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </AdminLayout>
  );
};

export default AdminHeroImages;
