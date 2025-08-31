import user from '../models/user.js'

// Add a new user (Admin only)
export async function addUser(req, res) {
    try {
        const newUser = new user(req.body);
        await newUser.save();
        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (error) {
        res.status(400).json({ message: 'Failed to add user', error: error.message });
    }
}

// Delete a user by ID (Admin only)
export async function deleteUser(req, res) {
    try {
        const deletedUser = await user.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
}

// Update a user by ID (Admin only)
export async function updateUser(req, res) {
    try {
        const updatedUser = await user.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(400).json({ message: 'Failed to update user', error: error.message });
    }
}