# Paystack Payment Integration Setup

This guide will help you set up Paystack payment integration for your clothing store application.

## Prerequisites

1. A Paystack account (sign up at https://paystack.com)
2. Your Paystack API keys (public and secret)

## Backend Setup

### 1. Environment Variables

Add the following environment variables to your `backend/.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# Client URL for callbacks
CLIENT_URL=http://localhost:5173
```

### 2. Install Dependencies

The Paystack Node.js SDK should already be installed. If not, run:

```bash
cd backend
npm install paystack
```

## Frontend Setup

### 1. Environment Variables

Create a `frontend/.env` file with:

```env
# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# Backend API URL
VITE_API_URL=http://localhost:5000/api/v1
```

### 2. Paystack JavaScript SDK

The Paystack JavaScript SDK is loaded via CDN in the `index.html` file. No additional npm packages are needed for the frontend integration.

## Getting Your Paystack Keys

1. Log in to your Paystack Dashboard
2. Go to Settings > API Keys & Webhooks
3. Copy your Public Key and Secret Key
4. For testing, use the test keys (they start with `pk_test_` and `sk_test_`)
5. For production, use the live keys (they start with `pk_live_` and `sk_live_`)

## How the Payment Flow Works

1. **Order Creation**: User fills out checkout form and submits
2. **Order Storage**: Order is created in database with `paymentMethod: 'Paystack'` and `isPaid: false`
3. **Payment Initialization**: Paystack payment popup is displayed
4. **Payment Processing**: User completes payment in Paystack popup
5. **Payment Verification**: Backend verifies payment with Paystack API
6. **Order Update**: Order is marked as paid and stock is updated
7. **Success**: User sees success page and receives confirmation

## Testing the Integration

### Test Cards for Ghana (GHS)

Use these test card numbers for testing:

- **Successful payments**: 4084084084084081
- **Insufficient funds**: 4084084084084081 (use CVV 408)
- **Card declined**: 4084084084084081 (use CVV 111)

### Test Details:
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: 123 (or specific codes for different scenarios)
- **PIN**: 1234

## Currency Configuration

The integration is currently set to Ghana Cedis (GHS). To change the currency:

1. Update the `currency` field in `frontend/src/pages/Checkout.jsx`:
```javascript
currency: 'NGN', // For Nigerian Naira
// or
currency: 'USD', // For US Dollars
```

2. Update the currency symbol in the display components from `₵` to the appropriate symbol.

## Webhook Setup (Optional but Recommended)

1. In your Paystack Dashboard, go to Settings > API Keys & Webhooks
2. Add your webhook URL: `https://yourdomain.com/api/v1/paystack/webhook`
3. Select the events you want to receive (recommended: `charge.success`)
4. The webhook will automatically update orders when payments are confirmed

## Security Notes

1. **Never expose your secret key** in frontend code
2. **Always verify payments** on the backend before fulfilling orders
3. **Use HTTPS** in production
4. **Validate webhook signatures** to ensure requests are from Paystack

## Troubleshooting

### Common Issues:

1. **"Invalid public key"**: Check that your public key is correctly set in the environment variables
2. **Payment popup not appearing**: Ensure react-paystack is properly imported and configured
3. **Payment verification fails**: Check that your secret key is correct and the backend can reach Paystack API
4. **Webhook not working**: Verify the webhook URL is correct and accessible from the internet

### Debugging:

1. Check browser console for frontend errors
2. Check backend logs for API errors
3. Use Paystack Dashboard to view transaction details
4. Enable debug logging in your application

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Set up webhook endpoint with HTTPS
- [ ] Test with real payment methods
- [ ] Set up proper error handling and logging
- [ ] Configure proper CORS settings
- [ ] Set up monitoring for failed payments

## Support

- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com
- Paystack JavaScript SDK: https://paystack.com/docs/payments/accept-payments/
