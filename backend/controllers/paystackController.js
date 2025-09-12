import Paystack from 'paystack';
import crypto from 'crypto';
import Order from '../models/Order.js';

// Initialize Paystack with secret key
const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

// @desc    Initialize Paystack payment
// @route   POST /api/paystack/initialize
// @access  Private
export const initializePayment = async (req, res) => {
    try {
        const { orderId, amount, email } = req.body;

        // Verify order exists and belongs to user
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Initialize payment with Paystack
        const paymentData = {
            amount: Math.round(amount * 100), // Paystack expects amount in kobo (smallest currency unit)
            email: email,
            reference: `order_${orderId}_${Date.now()}`,
            callback_url: `${process.env.CLIENT_URL}/checkout/success`,
            metadata: {
                orderId: orderId,
                userId: req.user._id.toString(),
                custom_fields: [
                    {
                        display_name: "Order ID",
                        variable_name: "order_id",
                        value: orderId
                    }
                ]
            }
        };

        const response = await paystack.transaction.initialize(paymentData);

        if (response.status) {
            // Store payment reference in order for later verification
            order.paymentResult = {
                id: response.data.reference,
                status: 'pending',
                update_time: new Date().toISOString(),
                email_address: email
            };
            await order.save();

            res.json({
                success: true,
                data: {
                    authorization_url: response.data.authorization_url,
                    access_code: response.data.access_code,
                    reference: response.data.reference
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to initialize payment',
                error: response.message
            });
        }
    } catch (error) {
        console.error('Paystack initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment initialization failed',
            error: error.message
        });
    }
};

// @desc    Verify Paystack payment
// @route   POST /api/paystack/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.body;

        if (!reference) {
            return res.status(400).json({
                success: false,
                message: 'Payment reference is required'
            });
        }

        // Verify payment with Paystack
        const response = await paystack.transaction.verify(reference);

        if (response.status && response.data.status === 'success') {
            const { metadata } = response.data;
            const orderId = metadata.orderId;

            // Find and update the order
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            // Verify the order belongs to the user
            if (order.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized'
                });
            }

            // Mark order as paid
            order.markAsPaid({
                id: response.data.reference,
                status: 'success',
                update_time: response.data.paid_at,
                email_address: response.data.customer.email,
                transaction_id: response.data.id,
                amount: response.data.amount / 100, // Convert from kobo back to main currency
                currency: response.data.currency,
                channel: response.data.channel,
                gateway_response: response.data.gateway_response
            });

            await order.save();

            res.json({
                success: true,
                message: 'Payment verified successfully',
                data: {
                    orderId: order._id,
                    paymentStatus: 'success',
                    transactionId: response.data.id,
                    amount: response.data.amount / 100,
                    currency: response.data.currency
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                data: {
                    status: response.data?.status || 'failed',
                    gateway_response: response.data?.gateway_response || 'Payment not successful'
                }
            });
        }
    } catch (error) {
        console.error('Paystack verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
};

// @desc    Handle Paystack webhook
// @route   POST /api/paystack/webhook
// @access  Public (but verified with Paystack signature)
export const handleWebhook = async (req, res) => {
    try {
        const hash = req.headers['x-paystack-signature'];
        const body = JSON.stringify(req.body);
        const expectedHash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
            .update(body)
            .digest('hex');

        if (hash !== expectedHash) {
            return res.status(400).json({ message: 'Invalid signature' });
        }

        const event = req.body;

        if (event.event === 'charge.success') {
            const { reference, metadata } = event.data;
            const orderId = metadata?.orderId;

            if (orderId) {
                const order = await Order.findById(orderId);
                if (order && !order.isPaid) {
                    order.markAsPaid({
                        id: reference,
                        status: 'success',
                        update_time: event.data.paid_at,
                        email_address: event.data.customer.email,
                        transaction_id: event.data.id,
                        amount: event.data.amount / 100,
                        currency: event.data.currency,
                        channel: event.data.channel,
                        gateway_response: event.data.gateway_response
                    });
                    await order.save();
                }
            }
        }

        res.status(200).json({ message: 'Webhook processed' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};
