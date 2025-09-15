// Utility functions for handling image URLs

// Base64 encoded SVG placeholder image (50x50 gray square with icon)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEgzMFYzMEgyMFYyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE1IDE1SDM1VjM1SDE1VjE1WiIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+';

/**
 * Get a placeholder image URL
 * @returns {string} - The placeholder image URL
 */
export const getPlaceholderImage = () => PLACEHOLDER_IMAGE;

/**
 * Fix image URL by ensuring it points to the correct static file path
 * @param {string} imageUrl - The image URL to fix
 * @returns {string} - The corrected image URL
 */
export const fixImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it starts with /uploads, prepend the base URL
  if (imageUrl.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    return baseUrl.replace('/api/v1', '') + imageUrl;
  }
  
  // If it's a relative path, assume it's an upload
  if (imageUrl.startsWith('/')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    return baseUrl.replace('/api/v1', '') + imageUrl;
  }
  
  // If it's just a filename, assume it's in uploads
  if (!imageUrl.includes('/')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    return baseUrl.replace('/api/v1', '') + '/uploads/' + imageUrl;
  }
  
  return imageUrl;
};

/**
 * Fix image URLs in a product object
 * @param {Object} product - The product object
 * @returns {Object} - The product with fixed image URLs
 */
export const fixProductImageUrls = (product) => {
  if (!product || !product.images) return product;
  
  return {
    ...product,
    images: product.images.map(image => ({
      ...image,
      url: fixImageUrl(image.url)
    }))
  };
};

/**
 * Fix image URLs in an array of products
 * @param {Array} products - Array of product objects
 * @returns {Array} - Array of products with fixed image URLs
 */
export const fixProductsImageUrls = (products) => {
  if (!Array.isArray(products)) return products;
  
  return products.map(fixProductImageUrls);
};
