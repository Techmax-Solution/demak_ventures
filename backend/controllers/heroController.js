import HeroImage from '../models/HeroImage.js';

// @desc    Get all hero images
// @route   GET /api/hero-images
// @access  Public
export const getHeroImages = async (req, res) => {
    try {
        const heroImages = await HeroImage.find({ isActive: true })
            .sort({ sortOrder: 1, createdAt: -1 })
            .populate('createdBy', 'name email');

        res.json(heroImages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all hero images (admin)
// @route   GET /api/admin/hero-images
// @access  Private/Admin
export const getAllHeroImages = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await HeroImage.countDocuments();
        const heroImages = await HeroImage.find()
            .sort({ sortOrder: 1, createdAt: -1 })
            .populate('createdBy', 'name email')
            .skip(skip)
            .limit(limit);

        res.json({
            heroImages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalHeroImages: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single hero image
// @route   GET /api/hero-images/:id
// @access  Public
export const getHeroImageById = async (req, res) => {
    try {
        const heroImage = await HeroImage.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (heroImage && heroImage.isActive) {
            res.json(heroImage);
        } else {
            res.status(404).json({ message: 'Hero image not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create hero image
// @route   POST /api/admin/hero-images
// @access  Private/Admin
export const createHeroImage = async (req, res) => {
    try {
        const heroImage = new HeroImage({
            ...req.body,
            createdBy: req.user._id
        });

        const createdHeroImage = await heroImage.save();
        await createdHeroImage.populate('createdBy', 'name email');
        
        res.status(201).json(createdHeroImage);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid hero image data', error: error.message });
    }
};

// @desc    Update hero image
// @route   PUT /api/admin/hero-images/:id
// @access  Private/Admin
export const updateHeroImage = async (req, res) => {
    try {
        const heroImage = await HeroImage.findById(req.params.id);

        if (heroImage) {
            Object.keys(req.body).forEach(key => {
                heroImage[key] = req.body[key];
            });

            const updatedHeroImage = await heroImage.save();
            await updatedHeroImage.populate('createdBy', 'name email');
            
            res.json(updatedHeroImage);
        } else {
            res.status(404).json({ message: 'Hero image not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid hero image data', error: error.message });
    }
};

// @desc    Delete hero image
// @route   DELETE /api/admin/hero-images/:id
// @access  Private/Admin
export const deleteHeroImage = async (req, res) => {
    try {
        const heroImage = await HeroImage.findById(req.params.id);

        if (heroImage) {
            // Soft delete by deactivating
            heroImage.isActive = false;
            await heroImage.save();
            
            res.json({ message: 'Hero image removed successfully' });
        } else {
            res.status(404).json({ message: 'Hero image not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update hero image sort order
// @route   PUT /api/admin/hero-images/:id/sort
// @access  Private/Admin
export const updateHeroImageSortOrder = async (req, res) => {
    try {
        const { sortOrder } = req.body;
        const heroImage = await HeroImage.findById(req.params.id);

        if (heroImage) {
            heroImage.sortOrder = sortOrder;
            await heroImage.save();
            
            res.json({ message: 'Sort order updated successfully', heroImage });
        } else {
            res.status(404).json({ message: 'Hero image not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid sort order data' });
    }
};

// @desc    Bulk update hero images sort order
// @route   PUT /api/admin/hero-images/sort
// @access  Private/Admin
export const bulkUpdateSortOrder = async (req, res) => {
    try {
        const { heroImages } = req.body; // Array of { id, sortOrder }

        const updatePromises = heroImages.map(({ id, sortOrder }) =>
            HeroImage.findByIdAndUpdate(id, { sortOrder }, { new: true })
        );

        await Promise.all(updatePromises);
        
        res.json({ message: 'Sort order updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid sort order data' });
    }
};
