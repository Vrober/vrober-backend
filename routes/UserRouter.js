import express from 'express';
import { editData } from '../controllers/userController.js';
// import your authentication middleware if needed

const router = express.Router();

// Route for a logged-in user to edit their data
router.put('/edit', /* authMiddleware, */ editData);

export default router;