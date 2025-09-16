import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        let query = { isActive: true };

        // Category filter
        if (req.query.category) {
            // Handle both category ID and category name/slug
            if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
                // If it's a valid ObjectId, use it directly
                query.category = req.query.category;
            } else {
                // If it's a name or slug, find the category first
                const Category = (await import('../models/Category.js')).default;
                const category = await Category.findOne({
                    $or: [
                        { name: { $regex: req.query.category, $options: 'i' } },
                        { slug: req.query.category }
                    ],
                    isActive: true
                });
                if (category) {
                    query.category = category._id;
                }
            }
        }

        // Subcategory filter
        if (req.query.subcategory) {
            query.subcategory = { $regex: req.query.subcategory, $options: 'i' };
        }

        // Brand filter
        if (req.query.brand) {
            query.brand = { $regex: req.query.brand, $options: 'i' };
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) {
                query.price.$gte = parseFloat(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                query.price.$lte = parseFloat(req.query.maxPrice);
            }
        }

        // Size filter
        if (req.query.size) {
            query['sizes.size'] = req.query.size;
        }

        // Color filter
        if (req.query.color) {
            query['colors.color'] = { $regex: req.query.color, $options: 'i' };
        }

        // Search by name, description, or tags
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { tags: { $in: [new RegExp(req.query.search, 'i')] } }
            ];
        }

        // Featured products only
        if (req.query.featured === 'true') {
            query.featured = true;
        }

        // On sale products only
        if (req.query.onSale === 'true') {
            query.onSale = true;
        }

        // In stock only
        if (req.query.inStock === 'true') {
            query.totalStock = { $gt: 0 };
        }

        // Sort options
        let sortBy = {};
        if (req.query.sortBy) {
            switch (req.query.sortBy) {
                case 'price_asc':
                    sortBy = { price: 1 };
                    break;
                case 'price_desc':
                    sortBy = { price: -1 };
                    break;
                case 'rating':
                    sortBy = { averageRating: -1 };
                    break;
                case 'newest':
                    sortBy = { createdAt: -1 };
                    break;
                case 'name':
                    sortBy = { name: 1 };
                    break;
                default:
                    sortBy = { createdAt: -1 };
            }
        } else {
            sortBy = { createdAt: -1 };
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sortBy)
            .skip(skip)
            .limit(limit);

        res.json({
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug')
            .populate('reviews.user', 'name email');

        if (product && product.isActive) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            user: req.user._id
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid product data', error: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            Object.keys(req.body).forEach(key => {
                product[key] = req.body[key];
            });

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid product data', error: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        console.log('🗑️ Attempting to delete product:', req.params.id);
        
        const product = await Product.findById(req.params.id);
        console.log('📦 Product found:', product ? { id: product._id, name: product.name, isActive: product.isActive } : 'null');

        if (product) {
            // Soft delete by deactivating the product
            product.isActive = false;
            
            // For deletion, we'll use findByIdAndUpdate to bypass validation
            // This is safer than trying to fix validation issues during deletion
            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { 
                    new: true,
                    runValidators: false // Skip validation for deletion
                }
            );
            
            if (updatedProduct) {
                console.log('✅ Product deactivated successfully');
                res.json({ message: 'Product removed successfully' });
            } else {
                console.log('❌ Failed to update product');
                res.status(500).json({ message: 'Failed to delete product' });
            }
        } else {
            console.log('❌ Product not found');
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }

            const review = {
                user: req.user._id,
                rating: Number(rating),
                comment
            };

            product.reviews.push(review);
            product.calculateAverageRating();

            await product.save();
            res.status(201).json({ message: 'Review added successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid review data' });
    }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
export const getTopProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const products = await Product.find({ isActive: true })
            .populate('category', 'name slug')
            .sort({ averageRating: -1, numReviews: -1 })
            .limit(limit);

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get newest products
// @route   GET /api/products/newest
// @access  Public
export const getNewestProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const products = await Product.find({ isActive: true })
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get product categories and filters
// @route   GET /api/products/filters
// @access  Public
export const getProductFilters = async (req, res) => {
    try {
        // Get active categories from Category model
        const Category = (await import('../models/Category.js')).default;
        const categories = await Category.find({ isActive: true })
            .select('name slug')
            .sort({ sortOrder: 1, name: 1 });

        const subcategories = await Product.distinct('subcategory', { isActive: true });
        const brands = await Product.distinct('brand', { isActive: true });
        const colors = await Product.distinct('colors.color', { isActive: true });
        const sizes = await Product.distinct('sizes.size', { isActive: true });

        // Get price range
        const priceRange = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);

        res.json({
            categories: categories,
            subcategories: subcategories.sort(),
            brands: brands.sort(),
            colors: colors.sort(),
            sizes: sizes.sort(),
            priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
export const updateProductStock = async (req, res) => {
    try {
        const { sizes } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.sizes = sizes;
            await product.save();
            res.json({ message: 'Stock updated successfully', product });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid stock data' });
    }
};

// @desc    Get product analytics for dashboard
// @route   GET /api/products/analytics
// @access  Private/Admin
export const getProductAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

        // Current period data (last 30 days)
        const currentPeriodData = await Product.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    activeProducts: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                    inactiveProducts: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
                    featuredProducts: { $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] } },
                    onSaleProducts: { $sum: { $cond: [{ $eq: ['$onSale', true] }, 1, 0] } },
                    inStockProducts: { $sum: { $cond: [{ $gt: ['$totalStock', 0] }, 1, 0] } },
                    outOfStockProducts: { $sum: { $cond: [{ $eq: ['$totalStock', 0] }, 1, 0] } }
                }
            }
        ]);

        // Previous period data (30-60 days ago)
        const previousPeriodData = await Product.aggregate([
            { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    activeProducts: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                    inactiveProducts: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
                    featuredProducts: { $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] } },
                    onSaleProducts: { $sum: { $cond: [{ $eq: ['$onSale', true] }, 1, 0] } },
                    inStockProducts: { $sum: { $cond: [{ $gt: ['$totalStock', 0] }, 1, 0] } },
                    outOfStockProducts: { $sum: { $cond: [{ $eq: ['$totalStock', 0] }, 1, 0] } }
                }
            }
        ]);

        const current = currentPeriodData[0] || {
            totalProducts: 0, activeProducts: 0, inactiveProducts: 0, 
            featuredProducts: 0, onSaleProducts: 0, inStockProducts: 0, outOfStockProducts: 0
        };

        const previous = previousPeriodData[0] || {
            totalProducts: 0, activeProducts: 0, inactiveProducts: 0, 
            featuredProducts: 0, onSaleProducts: 0, inStockProducts: 0, outOfStockProducts: 0
        };

        // Calculate daily changes (today vs yesterday)
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Get today's data
        const todayData = await Product.aggregate([
            { $match: { createdAt: { $gte: today } } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    activeProducts: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                    inactiveProducts: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
                    featuredProducts: { $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] } },
                    onSaleProducts: { $sum: { $cond: [{ $eq: ['$onSale', true] }, 1, 0] } },
                    inStockProducts: { $sum: { $cond: [{ $gt: ['$totalStock', 0] }, 1, 0] } },
                    outOfStockProducts: { $sum: { $cond: [{ $eq: ['$totalStock', 0] }, 1, 0] } }
                }
            }
        ]);

        // Get yesterday's data
        const yesterdayData = await Product.aggregate([
            { $match: { createdAt: { $gte: yesterday, $lt: today } } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    activeProducts: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                    inactiveProducts: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
                    featuredProducts: { $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] } },
                    onSaleProducts: { $sum: { $cond: [{ $eq: ['$onSale', true] }, 1, 0] } },
                    inStockProducts: { $sum: { $cond: [{ $gt: ['$totalStock', 0] }, 1, 0] } },
                    outOfStockProducts: { $sum: { $cond: [{ $eq: ['$totalStock', 0] }, 1, 0] } }
                }
            }
        ]);

        const todayStats = todayData[0] || {
            totalProducts: 0, activeProducts: 0, inactiveProducts: 0, 
            featuredProducts: 0, onSaleProducts: 0, inStockProducts: 0, outOfStockProducts: 0
        };

        const yesterdayStats = yesterdayData[0] || {
            totalProducts: 0, activeProducts: 0, inactiveProducts: 0, 
            featuredProducts: 0, onSaleProducts: 0, inStockProducts: 0, outOfStockProducts: 0
        };

        res.json({
            current: {
                totalProducts: current.totalProducts,
                activeProducts: current.activeProducts,
                inactiveProducts: current.inactiveProducts,
                featuredProducts: current.featuredProducts,
                onSaleProducts: current.onSaleProducts,
                inStockProducts: current.inStockProducts,
                outOfStockProducts: current.outOfStockProducts
            },
            previous: {
                totalProducts: previous.totalProducts,
                activeProducts: previous.activeProducts,
                inactiveProducts: previous.inactiveProducts,
                featuredProducts: previous.featuredProducts,
                onSaleProducts: previous.onSaleProducts,
                inStockProducts: previous.inStockProducts,
                outOfStockProducts: previous.outOfStockProducts
            },
            dailyChanges: {
                totalProducts: todayStats.totalProducts - yesterdayStats.totalProducts,
                activeProducts: todayStats.activeProducts - yesterdayStats.activeProducts,
                inactiveProducts: todayStats.inactiveProducts - yesterdayStats.inactiveProducts,
                featuredProducts: todayStats.featuredProducts - yesterdayStats.featuredProducts,
                onSaleProducts: todayStats.onSaleProducts - yesterdayStats.onSaleProducts,
                inStockProducts: todayStats.inStockProducts - yesterdayStats.inStockProducts,
                outOfStockProducts: todayStats.outOfStockProducts - yesterdayStats.outOfStockProducts
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};