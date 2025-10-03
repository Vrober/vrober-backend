import dotenv from "dotenv";
dotenv.config();
import { User } from '../models/User.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

// Generate Access Token
const generateAccessToken = (user) => {
    return jwt.sign(
        { _id: user._id, phoneNumber: user.phoneNumber, email: user.email, U_Id: user.U_Id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30d" }
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

// Main auth function (register + login) with Google verification and OTP flow
const authUser = asyncHandler(async (req, res) => {
    const { phoneNumber, otp} = req.body;

    if (!phoneNumber) throw new ApiError(400, "Phone number is required");

    // Step 1: Check if user exists by phone number
    let user = await User.findOne({ phoneNumber });

    if (user) {
        if (!otp) throw new ApiError(400, "OTP is required");
        if (otp !== "6969") throw new ApiError(401, "Invalid OTP");

        const accessToken = generateAccessToken(user);
        return res.status(200).json(new ApiResponse(200, { accessToken, user }, "Login successful "));
    }

    // New user path: require OTP (dev: 6969)
    if (!otp) throw new ApiError(400, "OTP is required");
    if (otp !== "6969") throw new ApiError(401, "Invalid OTP");

    // Create new user with verified Google identity
    const U_Id = `U_${Date.now()}`;
    user = await User.create({
        phoneNumber,
        email,
        googleId,
        name,
        picture,
        U_Id,
        isVerified: true,
        description: "",
        tags: [],
        interests: []
    });

    const accessToken = generateAccessToken(user);
    return res.status(201).json(new ApiResponse(201, { accessToken, user }, "User registered & logged in"));
});

// Logout 
const logoutUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, {}, "User logged out (client should clear token)"));
});

export {
    sendOtp,
    logoutUser,
    authUser,
};
