import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    size: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    }
});

const shippingAddressSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        default: 'United States'
    }
});

const paymentResultSchema = new mongoose.Schema({
    id: String,
    status: String,
    update_time: String,
    email_address: String
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
        type: shippingAddressSchema,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['PayPal', 'Stripe', 'Credit Card', 'Cash on Delivery', 'Paystack']
    },
    paymentResult: paymentResultSchema,
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: 0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: 0
    },
    discountAmount: {
        type: Number,
        default: 0.0,
        min: 0
    },
    couponCode: {
        type: String,
        trim: true
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    trackingNumber: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true
});

// Calculate order totals before saving
orderSchema.pre('save', function(next) {
    // Calculate items price
    this.itemsPrice = this.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    
    // Calculate shipping (free shipping over ₵100, otherwise ₵10)
    this.shippingPrice = this.itemsPrice > 100 ? 0 : 10;
    
    // Calculate total price
    this.totalPrice = this.itemsPrice + this.shippingPrice - this.discountAmount;
    
    next();
});

// Update payment status
orderSchema.methods.markAsPaid = async function(paymentResult) {
    this.isPaid = true;
    this.paidAt = Date.now();
    this.paymentResult = paymentResult;
    this.status = 'processing';
    
    // If this is a Paystack payment, update product stock now
    if (this.paymentMethod === 'Paystack') {
        const Product = mongoose.model('Product');
        for (let item of this.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
                if (sizeIndex !== -1) {
                    product.sizes[sizeIndex].quantity -= item.quantity;
                    await product.save();
                }
            }
        }
    }
};

// Update delivery status
orderSchema.methods.markAsDelivered = function(trackingNumber) {
    this.isDelivered = true;
    this.deliveredAt = Date.now();
    this.status = 'delivered';
    if (trackingNumber) {
        this.trackingNumber = trackingNumber;
    }
};

export default mongoose.model('Order', orderSchema);
