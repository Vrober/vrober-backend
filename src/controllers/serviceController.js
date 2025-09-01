import Service from '../models/services.js';
import Vendor from '../models/vendor.js';

// Get all services (Public)
export async function getAllServices(req, res) {
    try {
        const { page = 1, limit = 10, serviceType, vendorId, location } = req.query;
        
        const filter = {};
        
        if (serviceType) {
            filter.serviceType = serviceType;
        }
        
        if (vendorId) {
            filter.vendorId = vendorId;
        }
        
        // If location is provided, you can add geospatial queries here
        // For now, we'll just return all services
        
        const services = await Service.find(filter)
            .populate('vendorId', 'name email mobileNo imageUri rating isVerify experience')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ rating: -1, createdAt: -1 });
            
        const total = await Service.countDocuments(filter);
        
        res.status(200).json({
            services,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch services', 
            error: error.message 
        });
    }
}

// Get service by ID (Public)
export async function getServiceById(req, res) {
    try {
        const { id } = req.params;
        
        const service = await Service.findById(id)
            .populate('vendorId', 'name email mobileNo imageUri rating isVerify experience toolsAvailable')
            .populate('reviews.userId', 'name');
            
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        
        res.status(200).json({ service });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch service', 
            error: error.message 
        });
    }
}

// Get services by vendor (Public)
export async function getServicesByVendor(req, res) {
    try {
        const { vendorId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        // Verify vendor exists
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        
        const services = await Service.find({ vendorId })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ rating: -1, createdAt: -1 });
            
        const total = await Service.countDocuments({ vendorId });
        
        res.status(200).json({
            services,
            vendor: {
                name: vendor.name,
                rating: vendor.rating,
                isVerify: vendor.isVerify,
                experience: vendor.experience
            },
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch vendor services', 
            error: error.message 
        });
    }
}

// Search services (Public)
export async function searchServices(req, res) {
    try {
        const { q, serviceType, minRating, maxPrice } = req.query;
        const { page = 1, limit = 10 } = req.query;
        
        const filter = {};
        
        if (q) {
            filter.$or = [
                { serviceName: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }
        
        if (serviceType) {
            filter.serviceType = serviceType;
        }
        
        if (minRating) {
            filter.rating = { $gte: parseFloat(minRating) };
        }
        
        const services = await Service.find(filter)
            .populate('vendorId', 'name email mobileNo imageUri rating isVerify experience')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ rating: -1, createdAt: -1 });
            
        const total = await Service.countDocuments(filter);
        
        res.status(200).json({
            services,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to search services', 
            error: error.message 
        });
    }
}
