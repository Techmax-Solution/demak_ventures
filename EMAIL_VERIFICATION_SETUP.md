# Email Verification Setup Guide

## Backend Setup

### 1. Install Dependencies
The following packages have been added to support email verification:
- `nodemailer` - For sending emails
- `crypto` - For generating secure tokens

### 2. Environment Variables
Add the following variables to your `backend/.env` file:

```env
# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Alternative Email Services (for production)
# SendGrid
# SENDGRID_API_KEY=your-sendgrid-api-key

# Mailgun
# MAILGUN_API_KEY=your-mailgun-api-key
# MAILGUN_DOMAIN=your-mailgun-domain

# AWS SES
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# AWS_REGION=us-east-1
```

### 3. Gmail Setup (for development)
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `EMAIL_PASSWORD`

## Features Implemented

### 1. User Model Updates
- Added `isVerified` field (Boolean, default: false)
- Added `verificationToken` field (String)
- Added `verificationTokenExpiry` field (Date)

### 2. Email Service (`backend/utils/emailService.js`)
- Generates secure verification tokens using crypto.randomBytes()
- Sends HTML email templates with verification links
- Supports multiple email providers (Gmail, SendGrid, Mailgun, AWS SES)
- Includes password reset functionality (bonus feature)

### 3. Backend Routes
- `POST /api/auth/signup` - Modified to generate verification tokens and send emails
- `GET /api/auth/verify?token=xyz` - Verifies email tokens
- `POST /api/auth/resend-verification` - Resends verification emails
- `POST /api/auth/login` - Updated to check email verification
- All protected routes now require email verification

### 4. Frontend Updates
- `EmailVerification.jsx` - New page for handling email verification
- Updated `Register.jsx` to show verification message instead of auto-login
- Updated `Login.jsx` to handle verification errors
- Updated `UserContext.jsx` to not authenticate users until email is verified
- Added verification routes to `App.jsx`

## How It Works

### 1. User Registration Flow
1. User fills out registration form
2. Backend creates user with `isVerified: false`
3. Generates verification token and expiry (24 hours)
4. Sends verification email with link
5. Frontend shows "Check your email" message
6. User must verify email before logging in

### 2. Email Verification Flow
1. User clicks link in email: `http://localhost:3000/verify?token=xyz`
2. Frontend sends token to backend
3. Backend validates token and expiry
4. Sets `isVerified: true` and clears token fields
5. User can now log in

### 3. Login Protection
1. User tries to log in
2. Backend checks `isVerified` field
3. If not verified, returns error message
4. User must verify email first

### 4. Token Security
- Tokens are 64-character hex strings (32 bytes)
- Expire after 24 hours
- Single-use (cleared after verification)
- Cryptographically secure

## Testing the Implementation

### 1. Start the Backend
```bash
cd backend
npm run dev
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Registration
1. Go to `http://localhost:3000/register`
2. Fill out the form
3. Check your email for verification link
4. Try to log in without verifying (should fail)
5. Click verification link
6. Try to log in again (should succeed)

### 4. Test Resend Verification
1. If verification email is lost, go to `http://localhost:3000/verify`
2. Enter email address
3. Click "Resend Verification Email"

## Production Considerations

### 1. Email Provider
- For production, consider using SendGrid, Mailgun, or AWS SES
- Update `backend/utils/emailService.js` to use your preferred provider
- Set appropriate environment variables

### 2. Frontend URL
- Update `FRONTEND_URL` environment variable for production
- Ensure HTTPS is used in production

### 3. Token Expiry
- Current expiry is 24 hours
- Can be adjusted in `authController.js` (line 21)

### 4. Email Templates
- Current templates are basic HTML
- Consider using professional email templates for production
- Update templates in `backend/utils/emailService.js`

## Troubleshooting

### 1. Email Not Sending
- Check Gmail app password is correct
- Verify 2FA is enabled on Gmail account
- Check backend logs for email errors

### 2. Verification Link Not Working
- Ensure `FRONTEND_URL` is set correctly
- Check token hasn't expired (24 hours)
- Verify token is being passed correctly in URL

### 3. Login Still Works Without Verification
- Check that `isVerified` field is being checked in login route
- Verify middleware is checking verification status
- Ensure database has been updated with new schema

## Security Features

1. **Secure Token Generation**: Uses crypto.randomBytes() for cryptographically secure tokens
2. **Token Expiry**: Tokens expire after 24 hours
3. **Single-Use Tokens**: Tokens are cleared after successful verification
4. **Email Validation**: Ensures email format is valid before sending
5. **Rate Limiting**: Consider adding rate limiting for resend functionality
6. **HTTPS**: Ensure all communication uses HTTPS in production

The email verification system is now fully implemented and ready for use!
