import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from '../controllers/categoryController.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middlewares.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin routes (protected)
const requireAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.post('/', verifyJWT('admin'), requireAdmin, upload.single('image'), createCategory);
router.put('/:id', verifyJWT('admin'), requireAdmin, upload.single('image'), updateCategory);
router.delete('/:id', verifyJWT('admin'), requireAdmin, deleteCategory);
router.patch('/:id/toggle-status', verifyJWT('admin'), requireAdmin, toggleCategoryStatus);

export default router;
