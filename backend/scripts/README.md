# Backend Scripts

This directory contains utility scripts for managing the clothing store backend.

## Available Scripts

### 1. Database Seeding
```bash
npm run seed
```
Seeds the database with sample data including categories and products.

### 2. Admin Management

#### Create Admin
```bash
npm run create-admin
```
Converts the user with email `admin@example.com` to an admin role.

#### Verify All Admins
```bash
npm run verify-admin
```
Sets `isVerified: true` for all admin users and clears their verification tokens.

#### Verify Specific User
```bash
npm run verify-user <email>
```
Verifies a specific user by email address.

Example:
```bash
npm run verify-user john@example.com
```

## Manual Script Execution

You can also run scripts directly with Node.js:

```bash
# Seed database
node scripts/seedDatabase.js --seed

# Create admin
node scripts/createAdmin.js

# Verify all admins
node scripts/verifyAdmin.js

# Verify specific user
node scripts/verifyUser.js user@example.com
```

## Environment Variables

Make sure you have the following environment variables set in your `.env` file:

- `MONGODB_URI` - MongoDB connection string
- `EMAIL_USER` - Email service username
- `EMAIL_PASSWORD` - Email service password
- `FRONTEND_URL` - Frontend URL for password reset emails (default: http://localhost:5173)
- `BACKEND_URL` - Backend URL for verification emails (default: https://demak-ventures.onrender.com)

## Notes

- All scripts will automatically connect to the database using the `MONGODB_URI` environment variable
- Scripts will exit with code 0 on success and code 1 on error
- Admin verification scripts are useful for development and testing
- The verify-user script requires an email address as a command line argument
