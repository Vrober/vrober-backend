import express from 'express';
import {
    sendOtp,
    logoutUser,
    authUser,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/authenticate', authUser);
router.post('/logout', logoutUser);

export default router;
