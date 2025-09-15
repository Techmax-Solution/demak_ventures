import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes
export const protect = async (req, res, next) => {
    let token;

    console.log('🔐 Auth middleware - Request:', {
        method: req.method,
        url: req.url,
        hasAuthHeader: !!req.headers.authorization,
        authHeader: req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'none'
    });

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            console.log('🔐 Token extracted, length:', token.length);

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('🔐 Token decoded successfully:', { userId: decoded.id, exp: new Date(decoded.exp * 1000) });

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');
            console.log('🔐 User found:', req.user ? { id: req.user._id, email: req.user.email, role: req.user.role, isActive: req.user.isActive } : 'null');

            if (!req.user) {
                console.log('❌ User not found in database');
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            if (!req.user.isActive) {
                console.log('❌ User account is deactivated');
                return res.status(401).json({ message: 'Account is deactivated' });
            }

            console.log('✅ Auth middleware passed');
            next();
        } catch (error) {
            console.error('❌ Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.log('❌ No token provided');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Admin middleware
export const admin = (req, res, next) => {
    console.log('👑 Admin middleware - User:', req.user ? { id: req.user._id, email: req.user.email, role: req.user.role } : 'null');
    
    if (req.user && req.user.role === 'admin') {
        console.log('✅ Admin middleware passed');
        next();
    } else {
        console.log('❌ Admin middleware failed - user role:', req.user?.role || 'no user');
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

// Generate JWT token
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};
