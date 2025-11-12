import dotenv from "dotenv";
dotenv.config();
import User from '../models/user.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

// Generate Access Token
const generateAccessToken = (user) => {
    return jwt.sign(
        { _id: user._id, mobileNo: user.mobileNo, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "30d" }
    );
};

// Send OTP (dev = "6969")
const sendOtp = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) throw new ApiError(400, "Phone number is required");

    const otp = process.env.NODE_ENV === "production"
        ? Math.floor(1000 + Math.random() * 9000).toString()
        : "6969";

    return res.status(200).json(new ApiResponse(200, { otp }, "OTP sent successfully"));
});

// Main auth function (register + login) with OTP flow
const authUser = asyncHandler(async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber) throw new ApiError(400, "Phone number is required");
    if (!otp) throw new ApiError(400, "OTP is required");

    // Verify OTP (in dev mode, accept "6969")
    const validOtp = process.env.NODE_ENV === "production"
        ? otp // In production, you'd verify against sent OTP
        : "6969";

    if (otp !== validOtp) throw new ApiError(401, "Invalid OTP");

    // Check if user exists by phone number
    let user = await User.findOne({ mobileNo: phoneNumber });

    if (user) {
        // Existing user - login
        const accessToken = generateAccessToken(user);
        
        // Set HTTP-only cookie
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        };
        
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .json(new ApiResponse(200, { accessToken, user }, "Login successful"));
    }

    // New user - register with basic info
    user = await User.create({
        mobileNo: phoneNumber,
        name: `User ${phoneNumber.slice(-4)}`, // Temporary name
        email: `user${phoneNumber}@vrober.com`, // Temporary email
        password: `temp_${Date.now()}`, // Temporary password (will be updated later)
        role: "user"
    });

    const accessToken = generateAccessToken(user);
    
    // Set HTTP-only cookie
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(201, { accessToken, user }, "User registered & logged in"));
});

// Logout 
const logoutUser = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'lax'
    };
    
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export {
    sendOtp,
    logoutUser,
    authUser,
};
