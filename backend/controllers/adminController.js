import User from '../models/User.js';
import crypto from 'crypto';

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private/Admin
export const getAllAdmins = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await User.countDocuments({ role: 'admin' });
        const admins = await User.find({ role: 'admin' })
            .select('-password -verificationToken -verificationTokenExpiry -resetToken -resetTokenExpiry')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            admins,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalAdmins: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new admin
// @route   POST /api/admin/admins
// @access  Private/Admin
export const createAdmin = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        console.log('Creating admin with data:', { name, email, phone, address });

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Name, email, and password are required',
                received: { name, email, password: password ? '***' : undefined }
            });
        }

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        // Clean up address object - remove empty fields
        let cleanAddress = undefined;
        if (address && (address.street || address.city || address.state || address.zipCode || address.country)) {
            cleanAddress = {};
            if (address.street) cleanAddress.street = address.street;
            if (address.city) cleanAddress.city = address.city;
            if (address.state) cleanAddress.state = address.state;
            if (address.zipCode) cleanAddress.zipCode = address.zipCode;
            if (address.country) cleanAddress.country = address.country;
        }

        // Create new admin with automatic verification
        const admin = new User({
            name,
            email,
            password,
            role: 'admin',
            phone: phone || undefined,
            address: cleanAddress,
            isVerified: true, // Automatically verified
            isActive: true
        });

        const createdAdmin = await admin.save();

        // Remove sensitive data from response
        const adminResponse = {
            _id: createdAdmin._id,
            name: createdAdmin.name,
            email: createdAdmin.email,
            role: createdAdmin.role,
            phone: createdAdmin.phone,
            address: createdAdmin.address,
            isActive: createdAdmin.isActive,
            isVerified: createdAdmin.isVerified,
            createdAt: createdAdmin.createdAt,
            updatedAt: createdAdmin.updatedAt
        };

        res.status(201).json({
            message: 'Admin created successfully',
            admin: adminResponse
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            code: error.code,
            errors: error.errors
        });
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }
        
        res.status(400).json({ 
            message: 'Invalid admin data', 
            error: error.message 
        });
    }
};

// @desc    Update admin
// @route   PUT /api/admin/admins/:id
// @access  Private/Admin
export const updateAdmin = async (req, res) => {
    try {
        const { name, email, phone, address, isActive } = req.body;
        const adminId = req.params.id;

        // Don't allow updating the current admin's own account
        if (adminId === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot modify your own admin account' });
        }

        const admin = await User.findOne({ _id: adminId, role: 'admin' });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== admin.email) {
            const existingAdmin = await User.findOne({ email, _id: { $ne: adminId } });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Admin with this email already exists' });
            }
        }

        // Update admin fields
        if (name) admin.name = name;
        if (email) admin.email = email;
        if (phone !== undefined) admin.phone = phone;
        if (address) admin.address = address;
        if (isActive !== undefined) admin.isActive = isActive;

        const updatedAdmin = await admin.save();

        // Remove sensitive data from response
        const adminResponse = {
            _id: updatedAdmin._id,
            name: updatedAdmin.name,
            email: updatedAdmin.email,
            role: updatedAdmin.role,
            phone: updatedAdmin.phone,
            address: updatedAdmin.address,
            isActive: updatedAdmin.isActive,
            isVerified: updatedAdmin.isVerified,
            createdAt: updatedAdmin.createdAt,
            updatedAt: updatedAdmin.updatedAt
        };

        res.json({
            message: 'Admin updated successfully',
            admin: adminResponse
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ 
            message: 'Invalid admin data', 
            error: error.message 
        });
    }
};

// @desc    Delete admin (deactivate)
// @route   DELETE /api/admin/admins/:id
// @access  Private/Admin
export const deleteAdmin = async (req, res) => {
    try {
        const adminId = req.params.id;

        // Don't allow deleting the current admin's own account
        if (adminId === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own admin account' });
        }

        const admin = await User.findOne({ _id: adminId, role: 'admin' });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Soft delete by deactivating
        admin.isActive = false;
        await admin.save();

        res.json({ message: 'Admin deactivated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset admin password
// @route   POST /api/admin/admins/:id/reset-password
// @access  Private/Admin
export const resetAdminPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const adminId = req.params.id;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const admin = await User.findOne({ _id: adminId, role: 'admin' });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        res.json({ message: 'Admin password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ 
            message: 'Invalid password data', 
            error: error.message 
        });
    }
};

// @desc    Get admin statistics
// @route   GET /api/admin/admins/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
    try {
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });
        const verifiedAdmins = await User.countDocuments({ role: 'admin', isVerified: true });

        res.json({
            totalAdmins,
            activeAdmins,
            verifiedAdmins,
            inactiveAdmins: totalAdmins - activeAdmins
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
