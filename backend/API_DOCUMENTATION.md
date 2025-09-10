# Clothing Store API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true/false,
  "data": {...},
  "message": "Success/Error message"
}
```

---

## Authentication Endpoints (`/api/v1/auth`)

### POST `/api/v1/auth/signup`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

### POST `/api/v1/auth/login`
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### GET `/api/v1/auth/profile`
Get user profile (Protected)

### PUT `/api/v1/auth/profile`
Update user profile (Protected)
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "phone": "+1234567890",
  "address": {...},
  "avatar": "https://example.com/avatar.jpg"
}
```

### PUT `/api/v1/auth/change-password`
Change user password (Protected)
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## User Management Endpoints (`/api/v1/users`) - Admin Only

### GET `/api/v1/users`
Get all users with pagination and filtering
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `isActive`: Filter by active status (true/false)
- `role`: Filter by role (user/admin)
- `search`: Search by name or email

### GET `/api/v1/users/stats`
Get user statistics

### GET `/api/v1/users/:id`
Get user by ID

### PUT `/api/v1/users/:id`
Update user by ID
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin",
  "isActive": false
}
```

### DELETE `/api/v1/users/:id`
Deactivate user (soft delete)

---

## Product Endpoints (`/api/v1/products`)

### GET `/api/v1/products`
Get all products with filtering and pagination
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)
- `category`: Filter by category
- `subcategory`: Filter by subcategory
- `brand`: Filter by brand
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `size`: Filter by size
- `color`: Filter by color
- `search`: Search in name, description, tags
- `featured`: Show only featured products (true)
- `onSale`: Show only sale products (true)
- `inStock`: Show only in-stock products (true)
- `sortBy`: Sort options (price_asc, price_desc, rating, newest, name)

### GET `/api/v1/products/top`
Get top-rated products
Query Parameters:
- `limit`: Number of products (default: 5)

### GET `/api/v1/products/filters`
Get available filter options (categories, brands, colors, sizes, price range)

### GET `/api/v1/products/:id`
Get single product by ID

### POST `/api/v1/products` (Admin Only)
Create new product
```json
{
  "name": "Cotton T-Shirt",
  "description": "Comfortable cotton t-shirt",
  "price": 29.99,
  "originalPrice": 39.99,
  "category": "men",
  "subcategory": "t-shirts",
  "brand": "BrandName",
  "sizes": [
    {"size": "S", "quantity": 10},
    {"size": "M", "quantity": 15},
    {"size": "L", "quantity": 8}
  ],
  "colors": [
    {"color": "Red", "hexCode": "#FF0000"},
    {"color": "Blue", "hexCode": "#0000FF"}
  ],
  "images": [
    {"url": "https://example.com/image1.jpg", "alt": "Front view"},
    {"url": "https://example.com/image2.jpg", "alt": "Back view"}
  ],
  "tags": ["casual", "cotton", "comfortable"],
  "material": "100% Cotton",
  "careInstructions": ["Machine wash cold", "Tumble dry low"],
  "featured": true,
  "onSale": true
}
```

### PUT `/api/v1/products/:id` (Admin Only)
Update product

### DELETE `/api/v1/products/:id` (Admin Only)
Delete product (soft delete)

### PUT `/api/v1/products/:id/stock` (Admin Only)
Update product stock
```json
{
  "sizes": [
    {"size": "S", "quantity": 5},
    {"size": "M", "quantity": 10}
  ]
}
```

### POST `/api/v1/products/:id/reviews` (Protected)
Add product review
```json
{
  "rating": 5,
  "comment": "Great product!"
}
```

---

## Order Endpoints (`/api/v1/orders`)

### POST `/api/v1/orders` (Protected)
Create new order
```json
{
  "orderItems": [
    {
      "product": "product_id",
      "name": "Cotton T-Shirt",
      "image": "https://example.com/image.jpg",
      "price": 29.99,
      "quantity": 2,
      "size": "M",
      "color": "Red"
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "PayPal",
  "couponCode": "SAVE10"
}
```

### GET `/api/v1/orders/myorders` (Protected)
Get user's orders with pagination
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by order status

### GET `/api/v1/orders/:id` (Protected)
Get order by ID (user can only access their own orders)

### PUT `/api/v1/orders/:id/pay` (Protected)
Mark order as paid
```json
{
  "id": "payment_id",
  "status": "COMPLETED",
  "update_time": "2023-01-01T00:00:00Z",
  "email_address": "payer@example.com"
}
```

### PUT `/api/v1/orders/:id/cancel` (Protected)
Cancel order (only pending/processing orders)

### GET `/api/v1/orders` (Admin Only)
Get all orders with filtering and pagination
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `isPaid`: Filter by payment status (true/false)
- `isDelivered`: Filter by delivery status (true/false)
- `startDate`: Filter orders from date
- `endDate`: Filter orders to date

### GET `/api/v1/orders/stats` (Admin Only)
Get order statistics

### PUT `/api/v1/orders/:id/deliver` (Admin Only)
Mark order as delivered
```json
{
  "trackingNumber": "TRK123456789"
}
```

### PUT `/api/v1/orders/:id/status` (Admin Only)
Update order status
```json
{
  "status": "shipped",
  "trackingNumber": "TRK123456789",
  "notes": "Order shipped via FedEx"
}
```

---

## Order Status Flow
1. `pending` - Order placed, awaiting payment
2. `processing` - Payment received, preparing for shipment
3. `shipped` - Order shipped, tracking available
4. `delivered` - Order delivered to customer
5. `cancelled` - Order cancelled
6. `refunded` - Order refunded

---

## Error Codes
- `400` - Bad Request (Invalid data)
- `401` - Unauthorized (Invalid/missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource doesn't exist)
- `500` - Internal Server Error

---

## Environment Variables Required
Create a `.env` file in the backend directory:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/clothing-store
JWT_SECRET=your_jwt_secret_key_here
```

---

## Getting Started
1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Start MongoDB service
4. Run the server: `npm run dev`
5. API will be available at `http://localhost:5000`
