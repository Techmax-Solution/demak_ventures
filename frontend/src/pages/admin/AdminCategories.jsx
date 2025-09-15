import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Table from '../../components/admin/Table';
import FormModal from '../../components/admin/FormModal';
import AuthDebugPanel from '../../components/admin/AuthDebugPanel';
import adminApi from '../../services/adminApi';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sortOrder: 0,
    isActive: true,
    seoTitle: '',
    seoDescription: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminApi.categories.getAllCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sortOrder: 0,
      isActive: true,
      seoTitle: '',
      seoDescription: ''
    });
    setEditingCategory(null);
  };

  const handleCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive !== undefined ? category.isActive : true,
      seoTitle: category.seoTitle || '',
      seoDescription: category.seoDescription || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.categories.deleteCategory(category._id);
      fetchCategories(); // Refresh the categories list
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingCategory) {
        await adminApi.categories.updateCategory(editingCategory._id, formData);
      } else {
        await adminApi.categories.createCategory(formData);
      }
      
      setModalOpen(false);
      resetForm();
      fetchCategories(); // Refresh the categories list
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    { 
      key: '_id', 
      title: 'ID',
      render: (id) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {id?.slice(-8)}
        </span>
      )
    },
    { 
      key: 'name', 
      title: 'Name',
      render: (name) => (
        <span className="font-medium text-gray-900 capitalize">
          {name}
        </span>
      )
    },
    { 
      key: 'slug', 
      title: 'Slug',
      render: (slug) => (
        <span className="font-mono text-sm text-gray-600">
          {slug}
        </span>
      )
    },
    { 
      key: 'description', 
      title: 'Description',
      render: (description) => (
        <span className="text-sm text-gray-600 max-w-xs truncate">
          {description || 'No description'}
        </span>
      )
    },
    {
      key: 'sortOrder',
      title: 'Order',
      render: (sortOrder) => (
        <span className="text-sm font-medium">
          {sortOrder || 0}
        </span>
      ),
      sortable: true
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (isActive) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      sortable: false
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Debug Panel - Remove this after debugging */}
        {process.env.NODE_ENV === 'development' && <AuthDebugPanel />}
        
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage product categories</p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Category
            </button>
          </div>
        </div>


        {/* Categories Table */}
        <Table
          columns={columns}
          data={categories}
          loading={loading}
          searchable={true}
          sortable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Category Form Modal */}
        <FormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            resetForm();
          }}
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
          onSubmit={handleSubmit}
          loading={formLoading}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="Enter category description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="isActive"
                  value={formData.isActive}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleInputChange}
                className="input-field"
                placeholder="SEO title for search engines"
                maxLength="60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Description
              </label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleInputChange}
                rows={2}
                className="input-field"
                placeholder="SEO description for search engines"
                maxLength="160"
              />
            </div>
          </div>
        </FormModal>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
