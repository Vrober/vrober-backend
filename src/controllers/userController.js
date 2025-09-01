import User from '../models/user.js';

// Create user profile
export async function createUser(req, res) {
    try {
        const { name, mobileNo, email, address, pinCode, dob, gender, liveLocation, profileImg } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { mobileNo }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email or mobile number already exists' 
            });
        }

        const newUser = new User({
            name,
            mobileNo,
            email,
            address,
            pinCode,
            dob,
            gender,
            liveLocation,
            profileImg,
            role: 'user'
        });

        await newUser.save();
        
        res.status(201).json({ 
            message: 'User profile created successfully', 
            user: newUser 
        });
    } catch (error) {
        res.status(400).json({ 
            message: 'Failed to create user profile', 
            error: error.message 
        });
    }
}

// Update user details
export async function updateUser(req, res) {
    try {
        const userId = req.auth.userId; // From Clerk authentication
        
        const updates = req.body;
        
        // Remove sensitive fields that shouldn't be updated directly
        delete updates.password;
        delete updates.role;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ 
            message: 'User details updated successfully', 
            user: updatedUser 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
}

