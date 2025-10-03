import express from 'express';
import {
    sendOtp,
    logoutUser,
    authUser,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/authintication', authUser);
router.post('/logout', logoutUser);

export default router;
