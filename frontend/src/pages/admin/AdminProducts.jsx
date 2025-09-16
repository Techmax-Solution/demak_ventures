import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Table from '../../components/admin/Table';
import FormModal from '../../components/admin/FormModal';
import ImageUpload from '../../components/admin/ImageUpload';
import adminApi from '../../services/adminApi';
import { fixProductsImageUrls, getPlaceholderImage } from '../../utils/imageUtils';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    brand: '',
    sizes: [{ size: 'S', quantity: 0 }],
    colors: [{ color: '', hexCode: '#000000' }],
    images: [{ url: '', alt: '' }],
    tags: '',
    material: '',
    careInstructions: '',
    featured: false,
    onSale: false
  });

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', 'One Size'];
  // categoryOptions will be populated from the API

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminApi.products.getAllProducts();
      const productsData = response.products || response || [];
      // Fix image URLs for all products
      setProducts(fixProductsImageUrls(productsData));
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminApi.categories.getAllCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: field === 'quantity' ? parseInt(value) || 0 : value };
    setFormData(prev => ({ ...prev, sizes: newSizes }));
  };

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: 'S', quantity: 0 }]
    }));
  };

  const removeSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...formData.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { color: '', hexCode: '#000000' }]
    }));
  };

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', alt: '' }]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      subcategory: '',
      brand: '',
      sizes: [{ size: 'S', quantity: 0 }],
      colors: [{ color: '', hexCode: '#000000' }],
      images: [{ url: '', alt: '' }],
      tags: '',
      material: '',
      careInstructions: '',
      featured: false,
      onSale: false
    });
    setEditingProduct(null);
  };

  const handleCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      category: product.category?._id || product.category || '',
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      sizes: product.sizes?.length > 0 ? product.sizes : [{ size: 'S', quantity: 0 }],
      colors: product.colors?.length > 0 ? product.colors : [{ color: '', hexCode: '#000000' }],
      images: product.images?.length > 0 ? product.images : [{ url: '', alt: '' }],
      tags: product.tags?.join(', ') || '',
      material: product.material || '',
      careInstructions: product.careInstructions?.join(', ') || '',
      featured: product.featured || false,
      onSale: product.onSale || false
    });
    setModalOpen(true);
  };

  const handleDelete = async (product) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await adminApi.products.deleteProduct(product._id);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        careInstructions: formData.careInstructions.split(',').map(instruction => instruction.trim()).filter(instruction => instruction),
        sizes: formData.sizes.filter(size => size.size && size.quantity >= 0),
        colors: formData.colors.filter(color => color.color),
        images: formData.images.filter(image => image.url)
      };

      if (editingProduct) {
        await adminApi.products.updateProduct(editingProduct._id, productData);
      } else {
        await adminApi.products.createProduct(productData);
      }

      setModalOpen(false);
      resetForm();
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      key: 'images',
      title: 'Image',
      render: (images) => {
        const imageUrl = images?.[0]?.url;
        return (
          <img 
            src={imageUrl || getPlaceholderImage()} 
            alt="Product" 
            className="w-12 h-12 object-cover rounded"
            onError={(e) => {
              e.target.src = getPlaceholderImage();
            }}
          />
        );
      },
      sortable: false
    },
    { key: 'name', title: 'Name' },
    { 
      key: 'category', 
      title: 'Category',
      render: (category) => {
        // Handle both object and string category formats
        if (typeof category === 'object' && category !== null) {
          return category.name || category.slug || 'Unknown';
        }
        return category || 'Unknown';
      }
    },
    { key: 'brand', title: 'Brand' },
    { 
      key: 'price', 
      title: 'Price',
      type: 'currency'
    },
    {
      key: 'totalStock',
      title: 'Stock',
      render: (stock) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          stock > 10 ? 'bg-green-100 text-green-800' :
          stock > 0 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {stock || 0}
        </span>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (isActive) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      title: 'Created',
      type: 'date'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 w-full sm:w-auto justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* Products Table */}
        <Table
          columns={columns}
          data={products}
          loading={loading}
          searchable={true}
          sortable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Product Form Modal */}
        <FormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            resetForm();
          }}
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          onSubmit={handleSubmit}
          loading={formLoading}
          size="xl"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter brand name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="input-field"
                placeholder="Enter product description"
              />
            </div>

            {/* Category and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory *
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="e.g., t-shirts, jeans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Price (optional)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sizes and Stock
              </label>
              {formData.sizes.map((size, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <select
                    value={size.size}
                    onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                    className="input-field flex-1"
                  >
                    {sizeOptions.map(sizeOption => (
                      <option key={sizeOption} value={sizeOption}>{sizeOption}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={size.quantity}
                    onChange={(e) => handleSizeChange(index, 'quantity', e.target.value)}
                    min="0"
                    className="input-field w-24"
                    placeholder="Qty"
                  />
                  {formData.sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSize}
                className="text-orange-500 hover:text-orange-700 text-sm"
              >
                + Add Size
              </button>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Colors
              </label>
              {formData.colors.map((color, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={color.color}
                    onChange={(e) => handleColorChange(index, 'color', e.target.value)}
                    className="input-field flex-1"
                    placeholder="Color name"
                  />
                  <input
                    type="color"
                    value={color.hexCode}
                    onChange={(e) => handleColorChange(index, 'hexCode', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  {formData.colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addColor}
                className="text-orange-500 hover:text-orange-700 text-sm"
              >
                + Add Color
              </button>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              
              {/* Image Upload Component */}
              <div className="mb-4">
                <ImageUpload
                  multiple={true}
                  onUpload={(uploadedImages) => {
                    if (Array.isArray(uploadedImages)) {
                      setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, ...uploadedImages]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, uploadedImages]
                      }));
                    }
                  }}
                  className="mb-4"
                />
              </div>

              {/* Existing Images */}
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center space-x-3 mb-3 p-3 border border-gray-200 rounded-md">
                  {image.url && (
                    <img 
                      src={image.url} 
                      alt={image.alt || 'Product image'} 
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="url"
                      value={image.url}
                      onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                      className="input-field"
                      placeholder="Image URL"
                    />
                    <input
                      type="text"
                      value={image.alt}
                      onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                      className="input-field"
                      placeholder="Alt text"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addImage}
                className="text-orange-500 hover:text-orange-700 text-sm"
              >
                + Add Image URL Manually
              </button>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., 100% Cotton"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., casual, summer, comfortable"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Care Instructions (comma-separated)
              </label>
              <input
                type="text"
                name="careInstructions"
                value={formData.careInstructions}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Machine wash cold, Tumble dry low"
              />
            </div>

            {/* Flags */}
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured Product</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="onSale"
                  checked={formData.onSale}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">On Sale</span>
              </label>
            </div>
          </div>
        </FormModal>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
