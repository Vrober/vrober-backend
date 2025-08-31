import user from '../models/user.js'


export async function editData(req, res) {
    try {
        // Assuming user ID is available in req.user.id (set by authentication middleware)
        const userId = req.user.id;

        // Get the fields to update from the request body
        const updates = req.body;

        // Update the user document
        const updatedUser = await user.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User data updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

