import express from 'express';
import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserStats
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and require admin access
router.use(protect);
router.use(admin);

router.route('/')
    .get(getUsers);

router.get('/stats', getUserStats);

router.route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

export default router;
