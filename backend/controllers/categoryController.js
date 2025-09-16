import Category from '../models/Category.js';
import Product from '../models/Product.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
    try {
        const { active, parent } = req.query;
        
        let query = {};
        
        // Filter by active status
        if (active !== undefined) {
            query.isActive = active === 'true';
        }
        
        // Filter by parent category
        if (parent !== undefined) {
            if (parent === 'null' || parent === '') {
                query.parentCategory = null;
            } else {
                query.parentCategory = parent;
            }
        }

        const categories = await Category.find(query)
            .populate('parentCategory', 'name slug')
            .populate('subcategories', 'name slug isActive')
            .sort({ sortOrder: 1, name: 1 });

        res.json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('parentCategory', 'name slug')
            .populate('subcategories', 'name slug isActive');

        if (!category || !category.isActive) {
            return res.status(404).json({ 
                success: false,
                message: 'Category not found' 
            });
        }

        res.json({
            success: true,
            category
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
    try {
        const category = new Category(req.body);
        
        // Check if parent category exists and is active
        if (req.body.parentCategory) {
            const parentCategory = await Category.findById(req.body.parentCategory);
            if (!parentCategory || !parentCategory.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Parent category not found or inactive'
                });
            }
        }

        const createdCategory = await category.save();
        
        // Populate the created category
        await createdCategory.populate('parentCategory', 'name slug');

        res.status(201).json({
            success: true,
            category: createdCategory
        });
    } catch (error) {
        console.error(error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category name or slug already exists'
            });
        }
        
        res.status(400).json({ 
            success: false,
            message: 'Invalid category data',
            error: error.message 
        });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ 
                success: false,
                message: 'Category not found' 
            });
        }

        // Check if parent category exists and is active (if being updated)
        if (req.body.parentCategory) {
            if (req.body.parentCategory === category._id.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Category cannot be its own parent'
                });
            }
            
            const parentCategory = await Category.findById(req.body.parentCategory);
            if (!parentCategory || !parentCategory.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Parent category not found or inactive'
                });
            }
        }

        // Update category fields
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                category[key] = req.body[key];
            }
        });

        const updatedCategory = await category.save();
        
        // Populate the updated category
        await updatedCategory.populate('parentCategory', 'name slug');

        res.json({
            success: true,
            category: updatedCategory
        });
    } catch (error) {
        console.error(error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category name or slug already exists'
            });
        }
        
        res.status(400).json({ 
            success: false,
            message: 'Invalid category data',
            error: error.message 
        });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ 
                success: false,
                message: 'Category not found' 
            });
        }

        // Get counts for information purposes
        const productsCount = await Product.countDocuments({ category: category._id });
        const subcategoriesCount = await Category.countDocuments({ parentCategory: category._id });

        // Handle associated products - move them to a default category or create one
        if (productsCount > 0) {
            let defaultCategory = await Category.findOne({ name: 'General' });
            
            // Create a "General" category if it doesn't exist
            if (!defaultCategory) {
                defaultCategory = new Category({
                    name: 'General',
                    description: 'Default category for products without a specific category',
                    isActive: true,
                    sortOrder: 999
                });
                await defaultCategory.save();
            }

            // Move all products to the default category
            await Product.updateMany(
                { category: category._id },
                { category: defaultCategory._id }
            );
        }

        // Handle subcategories - move them to parent category or make them top-level
        if (subcategoriesCount > 0) {
            if (category.parentCategory) {
                // Move subcategories to the parent category
                await Category.updateMany(
                    { parentCategory: category._id },
                    { parentCategory: category.parentCategory }
                );
            } else {
                // Make subcategories top-level (remove parent reference)
                await Category.updateMany(
                    { parentCategory: category._id },
                    { $unset: { parentCategory: 1 } }
                );
            }
        }

        // Delete the category
        await Category.findByIdAndDelete(req.params.id);

        res.json({ 
            success: true,
            message: `Category deleted successfully. ${productsCount} products moved to General category, ${subcategoriesCount} subcategories reorganized.`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// @desc    Get category tree (hierarchical structure)
// @route   GET /api/categories/tree
// @access  Public
export const getCategoryTree = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .populate('subcategories', 'name slug isActive')
            .sort({ sortOrder: 1, name: 1 });

        // Build tree structure
        const buildTree = (categories, parentId = null) => {
            return categories
                .filter(cat => {
                    if (parentId === null) return !cat.parentCategory;
                    return cat.parentCategory && cat.parentCategory.toString() === parentId;
                })
                .map(cat => ({
                    ...cat.toObject(),
                    subcategories: buildTree(categories, cat._id.toString())
                }));
        };

        const categoryTree = buildTree(categories);

        res.json({
            success: true,
            categories: categoryTree
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};
