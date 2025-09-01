# Vrober API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All protected routes require Clerk authentication. Include the authorization header:
```
Authorization: Bearer <clerk_token>
```

---

## 🔐 Authentication Routes

### Health Check
- **GET** `/health`
- **Description**: Check if server is running
- **Auth**: None
- **Request**: None
- **Response**:
```json
{
  "message": "Server is running!"
}
```

---

## 👤 User Routes (`/users`)

### Create User Profile
- **POST** `/users`
- **Description**: Register a new user
- **Auth**: None
- **Request Body**:
```json
{
  "name": "John Doe",
  "mobileNo": "9876543210",
  "email": "john@example.com",
  "address": "123 Main St",
  "pinCode": "12345",
  "dob": "1990-01-01",
  "gender": "male",
  "liveLocation": {
    "lat": 28.6139,
    "lng": 77.2090
  },
  "profileImg": "https://example.com/image.jpg"
}
```
- **Response**:
```json
{
  "message": "User profile created successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update User Details
- **PUT** `/users`
- **Description**: Update user profile information
- **Auth**: Required
- **Request Body**:
```json
{
  "name": "John Smith",
  "address": "456 New St",
  "pinCode": "54321"
}
```
- **Response**:
```json
{
  "message": "User details updated successfully",
  "user": {
    "_id": "user_id",
    "name": "John Smith",
    "email": "john@example.com",
    "address": "456 New St"
  }
}
```

---

## 🏪 Vendor Routes (`/vendors`)

### Create Vendor Profile
- **POST** `/vendors`
- **Description**: Register a new vendor
- **Auth**: None
- **Request Body**:
```json
{
  "name": "ABC Services",
  "mobileNo": "9876543210",
  "email": "vendor@example.com",
  "address": "789 Service St",
  "pinCode": "12345",
  "dob": "1985-01-01",
  "gender": "male",
  "liveLocation": {
    "lat": 28.6139,
    "lng": 77.2090
  },
  "toolsAvailable": ["Hammer", "Drill", "Screwdriver"],
  "experience": 5,
  "aadhar": "123456789012",
  "paymentInfo": {
    "accountNo": "1234567890",
    "ifsc": "SBIN0001234",
    "upiId": "vendor@paytm"
  },
  "imageUri": "https://example.com/vendor.jpg"
}
```
- **Response**:
```json
{
  "message": "Vendor profile created successfully",
  "vendor": {
    "_id": "vendor_id",
    "name": "ABC Services",
    "email": "vendor@example.com",
    "role": "vendor",
    "isVerify": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Vendor Details
- **PUT** `/vendors`
- **Description**: Update vendor profile information
- **Auth**: Required
- **Request Body**:
```json
{
  "name": "ABC Services Ltd",
  "address": "999 Updated St",
  "experience": 7,
  "toolsAvailable": ["Hammer", "Drill", "Screwdriver", "Wrench"]
}
```
- **Response**:
```json
{
  "message": "Vendor details updated successfully",
  "vendor": {
    "_id": "vendor_id",
    "name": "ABC Services Ltd",
    "address": "999 Updated St",
    "experience": 7
  }
}
```

---

## 🛠️ Service Routes (`/services`)

### Get All Services
- **GET** `/services`
- **Description**: Get all available services
- **Auth**: None
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `serviceType` (optional): Filter by service type
  - `vendorId` (optional): Filter by vendor ID
- **Response**:
```json
{
  "services": [
    {
      "_id": "service_id",
      "serviceName": "Plumbing Repair",
      "serviceType": "Plumbing",
      "rating": 4.5,
      "imageUrl": "https://example.com/service.jpg",
      "description": "Professional plumbing services",
      "vendorId": {
        "_id": "vendor_id",
        "name": "ABC Services",
        "rating": 4.2,
        "isVerify": true,
        "experience": 5
      }
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}
```

### Search Services
- **GET** `/services/search`
- **Description**: Search services by name or description
- **Auth**: None
- **Query Parameters**:
  - `q` (optional): Search query
  - `serviceType` (optional): Filter by service type
  - `minRating` (optional): Minimum rating filter
  - `page` (optional): Page number
  - `limit` (optional): Items per page
- **Response**: Same as Get All Services

### Get Service by ID
- **GET** `/services/:id`
- **Description**: Get detailed service information
- **Auth**: None
- **Response**:
```json
{
  "service": {
    "_id": "service_id",
    "serviceName": "Plumbing Repair",
    "serviceType": "Plumbing",
    "toolsRequired": ["Wrench", "Pipe"],
    "rating": 4.5,
    "reviews": [
      {
        "userId": {
          "name": "John Doe"
        },
        "comment": "Great service!",
        "rating": 5,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "imageUrl": "https://example.com/service.jpg",
    "description": "Professional plumbing services",
    "location": {
      "lat": 28.6139,
      "lng": 77.2090
    },
    "vendorId": {
      "_id": "vendor_id",
      "name": "ABC Services",
      "email": "vendor@example.com",
      "mobileNo": "9876543210",
      "imageUri": "https://example.com/vendor.jpg",
      "rating": 4.2,
      "isVerify": true,
      "experience": 5,
      "toolsAvailable": ["Hammer", "Drill"]
    }
  }
}
```

### Get Services by Vendor
- **GET** `/services/vendor/:vendorId`
- **Description**: Get all services offered by a specific vendor
- **Auth**: None
- **Query Parameters**:
  - `page` (optional): Page number
  - `limit` (optional): Items per page
- **Response**:
```json
{
  "services": [
    {
      "_id": "service_id",
      "serviceName": "Plumbing Repair",
      "serviceType": "Plumbing",
      "rating": 4.5
    }
  ],
  "vendor": {
    "name": "ABC Services",
    "rating": 4.2,
    "isVerify": true,
    "experience": 5
  },
  "totalPages": 2,
  "currentPage": 1,
  "total": 15
}
```

---

## 📅 Booking Routes (`/bookings`)

### Create Booking
- **POST** `/bookings`
- **Description**: Create a new service booking
- **Auth**: Required (User)
- **Request Body**:
```json
{
  "vendorId": "vendor_id",
  "serviceId": "service_id",
  "serviceDate": "2024-01-15",
  "serviceTime": "10:00 AM",
  "address": "123 Customer St",
  "location": {
    "lat": 28.6139,
    "lng": 77.2090
  },
  "price": 500,
  "description": "Fix leaking pipe",
  "specialInstructions": "Please call before coming",
  "paymentMethod": "cash"
}
```
- **Response**:
```json
{
  "message": "Booking created successfully",
  "booking": {
    "_id": "booking_id",
    "userId": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "mobileNo": "9876543210"
    },
    "vendorId": {
      "_id": "vendor_id",
      "name": "ABC Services",
      "email": "vendor@example.com",
      "mobileNo": "9876543210"
    },
    "serviceId": {
      "_id": "service_id",
      "serviceName": "Plumbing Repair",
      "serviceType": "Plumbing"
    },
    "bookingDate": "2024-01-01T00:00:00.000Z",
    "serviceDate": "2024-01-15T00:00:00.000Z",
    "serviceTime": "10:00 AM",
    "address": "123 Customer St",
    "status": "pending",
    "price": 500,
    "paymentMethod": "cash"
  }
}
```

### Get User Bookings
- **GET** `/bookings/user`
- **Description**: Get all bookings for the authenticated user
- **Auth**: Required (User)
- **Query Parameters**:
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `status` (optional): Filter by status (pending, accepted, rejected, completed, cancelled)
- **Response**:
```json
{
  "bookings": [
    {
      "_id": "booking_id",
      "vendorId": {
        "_id": "vendor_id",
        "name": "ABC Services",
        "email": "vendor@example.com",
        "mobileNo": "9876543210",
        "imageUri": "https://example.com/vendor.jpg",
        "rating": 4.2
      },
      "serviceId": {
        "_id": "service_id",
        "serviceName": "Plumbing Repair",
        "serviceType": "Plumbing",
        "imageUrl": "https://example.com/service.jpg"
      },
      "serviceDate": "2024-01-15T00:00:00.000Z",
      "serviceTime": "10:00 AM",
      "status": "pending",
      "price": 500,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 3,
  "currentPage": 1,
  "total": 25
}
```

### Get Vendor Bookings
- **GET** `/bookings/vendor`
- **Description**: Get all bookings/orders for the authenticated vendor
- **Auth**: Required (Vendor)
- **Query Parameters**:
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `status` (optional): Filter by status
- **Response**:
```json
{
  "bookings": [
    {
      "_id": "booking_id",
      "userId": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "mobileNo": "9876543210"
      },
      "serviceId": {
        "_id": "service_id",
        "serviceName": "Plumbing Repair",
        "serviceType": "Plumbing",
        "imageUrl": "https://example.com/service.jpg"
      },
      "serviceDate": "2024-01-15T00:00:00.000Z",
      "serviceTime": "10:00 AM",
      "status": "pending",
      "price": 500,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "total": 15
}
```

### Accept Booking
- **PUT** `/bookings/:id/accept`
- **Description**: Accept a pending booking (Vendor)
- **Auth**: Required (Vendor)
- **Request Body**:
```json
{
  "vendorNotes": "Will arrive on time with all tools"
}
```
- **Response**:
```json
{
  "message": "Booking accepted successfully",
  "booking": {
    "_id": "booking_id",
    "status": "accepted",
    "vendorNotes": "Will arrive on time with all tools"
  }
}
```

### Reject Booking
- **PUT** `/bookings/:id/reject`
- **Description**: Reject a pending booking (Vendor)
- **Auth**: Required (Vendor)
- **Request Body**:
```json
{
  "cancellationReason": "Not available on requested date"
}
```
- **Response**:
```json
{
  "message": "Booking rejected successfully",
  "booking": {
    "_id": "booking_id",
    "status": "rejected",
    "cancellationReason": "Not available on requested date",
    "cancelledBy": "vendor"
  }
}
```

### Complete Booking
- **PUT** `/bookings/:id/complete`
- **Description**: Mark booking as completed (Vendor)
- **Auth**: Required (Vendor)
- **Request Body**: None
- **Response**:
```json
{
  "message": "Booking completed successfully",
  "booking": {
    "_id": "booking_id",
    "status": "completed",
    "completionDate": "2024-01-15T12:00:00.000Z"
  }
}
```

### Cancel Booking
- **PUT** `/bookings/:id/cancel`
- **Description**: Cancel a booking (User)
- **Auth**: Required (User)
- **Request Body**:
```json
{
  "cancellationReason": "Change of plans"
}
```
- **Response**:
```json
{
  "message": "Booking cancelled successfully",
  "booking": {
    "_id": "booking_id",
    "status": "cancelled",
    "cancellationReason": "Change of plans",
    "cancelledBy": "user"
  }
}
```

### Rate and Review
- **PUT** `/bookings/:id/rate`
- **Description**: Add rating and review for completed booking (User)
- **Auth**: Required (User)
- **Request Body**:
```json
{
  "rating": 5,
  "review": "Excellent service! Very professional."
}
```
- **Response**:
```json
{
  "message": "Rating and review added successfully",
  "booking": {
    "_id": "booking_id",
    "rating": 5,
    "review": "Excellent service! Very professional."
  }
}
```

---

## 👨‍💼 Admin Routes (`/admin`)

### Dashboard Statistics
- **GET** `/admin/dashboard`
- **Description**: Get admin dashboard statistics
- **Auth**: Required (Admin)
- **Response**:
```json
{
  "stats": {
    "totalUsers": 150,
    "totalVendors": 25,
    "totalServices": 100,
    "totalBookings": 500,
    "pendingBookings": 15,
    "completedBookings": 400,
    "verifiedVendors": 20
  },
  "recentBookings": [
    {
      "_id": "booking_id",
      "userId": {
        "name": "John Doe"
      },
      "vendorId": {
        "name": "ABC Services"
      },
      "serviceId": {
        "serviceName": "Plumbing Repair"
      },
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### User Management

#### Get All Users
- **GET** `/admin/users`
- **Description**: Get all users with pagination
- **Auth**: Required (Admin)
- **Query Parameters**:
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `role` (optional): Filter by role
- **Response**:
```json
{
  "users": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "mobileNo": "9876543210",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 10,
  "currentPage": 1,
  "total": 100
}
```

#### Create User
- **POST** `/admin/users`
- **Description**: Create a new user (Admin)
- **Auth**: Required (Admin)
- **Request Body**: Same as user registration + optional `role` field
- **Response**: Same as user registration

#### Delete User
- **DELETE** `/admin/users/:id`
- **Description**: Delete a user
- **Auth**: Required (Admin)
- **Response**:
```json
{
  "message": "User deleted successfully"
}
```

### Vendor Management

#### Get All Vendors
- **GET** `/admin/vendors`
- **Description**: Get all vendors with pagination
- **Auth**: Required (Admin)
- **Query Parameters**:
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `isVerify` (optional): Filter by verification status
- **Response**:
```json
{
  "vendors": [
    {
      "_id": "vendor_id",
      "name": "ABC Services",
      "email": "vendor@example.com",
      "mobileNo": "9876543210",
      "isVerify": true,
      "rating": 4.2,
      "experience": 5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}
```

#### Create Vendor
- **POST** `/admin/vendors`
- **Description**: Create a new vendor (Admin)
- **Auth**: Required (Admin)
- **Request Body**: Same as vendor registration + optional `isVerify` field
- **Response**: Same as vendor registration

#### Delete Vendor
- **DELETE** `/admin/vendors/:id`
- **Description**: Delete a vendor
- **Auth**: Required (Admin)
- **Response**:
```json
{
  "message": "Vendor deleted successfully"
}
```

### Service Management

#### Get All Services
- **GET** `/admin/services`
- **Description**: Get all services with pagination
- **Auth**: Required (Admin)
- **Query Parameters**:
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `serviceType` (optional): Filter by service type
- **Response**:
```json
{
  "services": [
    {
      "_id": "service_id",
      "serviceName": "Plumbing Repair",
      "serviceType": "Plumbing",
      "rating": 4.5,
      "vendorId": {
        "_id": "vendor_id",
        "name": "ABC Services",
        "email": "vendor@example.com",
        "mobileNo": "9876543210"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 10,
  "currentPage": 1,
  "total": 100
}
```

#### Create Service
- **POST** `/admin/services`
- **Description**: Create a new service
- **Auth**: Required (Admin)
- **Request Body**:
```json
{
  "serviceName": "Electrical Repair",
  "vendorId": "vendor_id",
  "serviceType": "Electrical",
  "toolsRequired": ["Multimeter", "Wire Stripper"],
  "imageUrl": "https://example.com/service.jpg",
  "description": "Professional electrical services",
  "location": {
    "lat": 28.6139,
    "lng": 77.2090
  }
}
```
- **Response**:
```json
{
  "message": "Service created successfully",
  "service": {
    "_id": "service_id",
    "serviceName": "Electrical Repair",
    "serviceType": "Electrical",
    "vendorId": "vendor_id"
  }
}
```

#### Update Service
- **PUT** `/admin/services/:id`
- **Description**: Update service details
- **Auth**: Required (Admin)
- **Request Body**: Any service fields to update
- **Response**:
```json
{
  "message": "Service updated successfully",
  "service": {
    "_id": "service_id",
    "serviceName": "Updated Service Name"
  }
}
```

#### Delete Service
- **DELETE** `/admin/services/:id`
- **Description**: Delete a service
- **Auth**: Required (Admin)
- **Response**:
```json
{
  "message": "Service deleted successfully"
}
```

### Booking Management

#### Get All Bookings
- **GET** `/admin/bookings`
- **Description**: Get all bookings with pagination
- **Auth**: Required (Admin)
- **Query Parameters**:
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `status` (optional): Filter by status
  - `vendorId` (optional): Filter by vendor
  - `userId` (optional): Filter by user
- **Response**:
```json
{
  "bookings": [
    {
      "_id": "booking_id",
      "userId": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "mobileNo": "9876543210"
      },
      "vendorId": {
        "_id": "vendor_id",
        "name": "ABC Services",
        "email": "vendor@example.com",
        "mobileNo": "9876543210"
      },
      "serviceId": {
        "_id": "service_id",
        "serviceName": "Plumbing Repair",
        "serviceType": "Plumbing"
      },
      "status": "completed",
      "price": 500,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 20,
  "currentPage": 1,
  "total": 200
}
```

#### Update Booking Status
- **PUT** `/admin/bookings/:id/status`
- **Description**: Update booking status
- **Auth**: Required (Admin)
- **Request Body**:
```json
{
  "status": "completed",
  "cancellationReason": "Optional reason if cancelling"
}
```
- **Response**:
```json
{
  "message": "Booking status updated successfully",
  "booking": {
    "_id": "booking_id",
    "status": "completed"
  }
}
```

#### Delete Booking
- **DELETE** `/admin/bookings/:id`
- **Description**: Delete a booking
- **Auth**: Required (Admin)
- **Response**:
```json
{
  "message": "Booking deleted successfully"
}
```

---

## 📊 Common Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Pagination Response
```json
{
  "data": [...],
  "totalPages": 10,
  "currentPage": 1,
  "total": 100
}
```

---

## 🔒 Authentication Headers

For all protected routes, include:
```
Authorization: Bearer <clerk_jwt_token>
```

---

## 📝 Notes for Frontend Engineers

1. **Date Format**: Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
2. **Pagination**: All list endpoints support pagination with `page` and `limit` parameters
3. **Filtering**: Most list endpoints support filtering via query parameters
4. **Error Handling**: Always check for error responses and handle them appropriately
5. **Loading States**: Implement loading states for all API calls
6. **Validation**: Client-side validation should match server-side requirements
7. **File Uploads**: For image uploads, use multipart/form-data format
8. **Real-time Updates**: Consider implementing WebSocket connections for real-time booking updates

---

## 🚀 Getting Started

1. Set up Clerk authentication in your frontend
2. Configure the base API URL
3. Implement error handling and loading states
4. Test all endpoints with proper authentication
5. Implement proper form validation
6. Add proper TypeScript interfaces for all API responses
