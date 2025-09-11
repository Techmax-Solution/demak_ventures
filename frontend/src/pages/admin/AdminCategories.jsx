import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Table from '../../components/admin/Table';
import FormModal from '../../components/admin/FormModal';
import adminApi from '../../services/adminApi';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
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
      description: ''
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
      description: category.description || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      // Since categories are hardcoded in the backend, we'll show a message
      alert('Categories are currently hardcoded in the system. To modify categories, please update the backend Product model.');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Since categories are hardcoded in the backend, we'll show a message
      alert('Categories are currently hardcoded in the system. To add/edit categories, please update the backend Product model.');
      
      setModalOpen(false);
      resetForm();
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
          {id}
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
      key: 'description', 
      title: 'Description'
    },
    {
      key: 'status',
      title: 'Status',
      render: () => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Active
        </span>
      ),
      sortable: false
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage product categories</p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>

        {/* Info Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Categories Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Categories are currently hardcoded in the backend system. The available categories are: 
                  Men, Women, Kids, Accessories, Shoes, and Bags. To modify categories, you would need to 
                  update the Product model in the backend and create appropriate API endpoints.
                </p>
              </div>
            </div>
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
              <p className="text-xs text-gray-500 mt-1">
                Note: This will not actually create a new category due to backend constraints
              </p>
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

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Important:</strong> Categories are currently hardcoded in the backend. 
                    This form is for demonstration purposes. To implement full category management, 
                    you would need to create a Category model and appropriate API endpoints in the backend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FormModal>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
