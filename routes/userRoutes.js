import express from 'express';
import { editData, addUser, deleteUser, updateUser } from '../controllers/userController.js';
// import your authentication and admin middleware as needed

const router = express.Router();

// Route for a logged-in user to edit their data
router.put('/edit', /* authMiddleware, */ editData);

// Admin routes (add your admin middleware for protection)
router.post('/add', /* adminMiddleware, */ addUser);
router.delete('/:id', /* adminMiddleware, */ deleteUser);
router.put('/:id', /* adminMiddleware, */ updateUser);

export default router;