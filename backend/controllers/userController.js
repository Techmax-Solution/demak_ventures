import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {};

        // Filter by active status
        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        // Filter by role
        if (req.query.role) {
            query.role = req.query.role;
        }

        // Search by name or email
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                address: updatedUser.address,
                isActive: updatedUser.isActive,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Don't allow deletion of admin users
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot delete admin user' });
            }

            // Soft delete by deactivating the user
            user.isActive = false;
            await user.save();

            res.json({ message: 'User deactivated successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const regularUsers = await User.countDocuments({ role: 'user' });

        // Get users registered in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsers = await User.countDocuments({ 
            createdAt: { $gte: thirtyDaysAgo } 
        });

        res.json({
            totalUsers,
            activeUsers,
            inactiveUsers,
            adminUsers,
            regularUsers,
            recentUsers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user analytics for dashboard
// @route   GET /api/users/analytics
// @access  Private/Admin
export const getUserAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

        // Current period data (last 30 days)
        const currentPeriodData = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                    inactiveUsers: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
                    adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
                    regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
                }
            }
        ]);

        // Previous period data (30-60 days ago)
        const previousPeriodData = await User.aggregate([
            { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                    inactiveUsers: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
                    adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
                    regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
                }
            }
        ]);

        const current = currentPeriodData[0] || {
            totalUsers: 0, activeUsers: 0, inactiveUsers: 0, adminUsers: 0, regularUsers: 0
        };

        const previous = previousPeriodData[0] || {
            totalUsers: 0, activeUsers: 0, inactiveUsers: 0, adminUsers: 0, regularUsers: 0
        };

        // Calculate daily changes (today vs yesterday)
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Get today's data
        const todayData = await User.aggregate([
            { $match: { createdAt: { $gte: today } } },
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                    inactiveUsers: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
                    adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
                    regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
                }
            }
        ]);

        // Get yesterday's data
        const yesterdayData = await User.aggregate([
            { $match: { createdAt: { $gte: yesterday, $lt: today } } },
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
                    inactiveUsers: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
                    adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
                    regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
                }
            }
        ]);

        const todayStats = todayData[0] || {
            totalUsers: 0, activeUsers: 0, inactiveUsers: 0, adminUsers: 0, regularUsers: 0
        };

        const yesterdayStats = yesterdayData[0] || {
            totalUsers: 0, activeUsers: 0, inactiveUsers: 0, adminUsers: 0, regularUsers: 0
        };

        res.json({
            current: {
                totalUsers: current.totalUsers,
                activeUsers: current.activeUsers,
                inactiveUsers: current.inactiveUsers,
                adminUsers: current.adminUsers,
                regularUsers: current.regularUsers
            },
            previous: {
                totalUsers: previous.totalUsers,
                activeUsers: previous.activeUsers,
                inactiveUsers: previous.inactiveUsers,
                adminUsers: previous.adminUsers,
                regularUsers: previous.regularUsers
            },
            dailyChanges: {
                totalUsers: todayStats.totalUsers - yesterdayStats.totalUsers,
                activeUsers: todayStats.activeUsers - yesterdayStats.activeUsers,
                inactiveUsers: todayStats.inactiveUsers - yesterdayStats.inactiveUsers,
                adminUsers: todayStats.adminUsers - yesterdayStats.adminUsers,
                regularUsers: todayStats.regularUsers - yesterdayStats.regularUsers
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};