import vendor from '../models/vendor.js'

// Add a new vendor (Admin only)
export async function addVendor(req, res) {
    try {
        const newVendor = new vendor(req.body);
        await newVendor.save();
        res.status(201).json({ message: 'Vendor added successfully', vendor: newVendor });
    } catch (error) {
        res.status(400).json({ message: 'Failed to add vendor', error: error.message });
    }
}

// Delete a vendor by ID (Admin only)
export async function deleteVendor(req, res) {
    try {
        const deletedVendor = await vendor.findByIdAndDelete(req.params.id);
        if (!deletedVendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.status(200).json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete vendor', error: error.message });
    }
}

// Update a vendor by ID (Admin only)
export async function updateVendor(req, res) {
    try {
        const updatedVendor = await vendor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedVendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.status(200).json({ message: 'Vendor updated successfully', vendor: updatedVendor });
    } catch (error) {
        res.status(400).json({ message: 'Failed to update vendor', error: error.message });
    }
}