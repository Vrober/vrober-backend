import express from 'express';
import { createCallback, listCallbacks, updateCallbackStatus } from '../controllers/callbackController.js';

const router = express.Router();

// Public create endpoint
router.post('/', createCallback);

// For future: could protect with admin/vendor when panel exists
router.get('/', listCallbacks);
router.put('/:id/status', updateCallbackStatus);

export default router;
