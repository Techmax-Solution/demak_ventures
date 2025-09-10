import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        maxlength: 500
    }
}, {
    timestamps: true
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true,
        maxlength: [100, 'Product name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a product description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: {
            values: ['men', 'women', 'kids', 'accessories', 'shoes', 'bags'],
            message: 'Category must be one of: men, women, kids, accessories, shoes, bags'
        }
    },
    subcategory: {
        type: String,
        required: [true, 'Please add a subcategory'],
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Please add a brand'],
        trim: true
    },
    sizes: [{
        size: {
            type: String,
            required: true,
            enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', 'One Size']
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    colors: [{
        color: {
            type: String,
            required: true
        },
        hexCode: {
            type: String,
            match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code']
        }
    }],
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: ''
        }
    }],
    tags: [String],
    material: String,
    careInstructions: [String],
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviews: [reviewSchema],
    featured: {
        type: Boolean,
        default: false
    },
    onSale: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalStock: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate total stock from sizes
productSchema.pre('save', function(next) {
    this.totalStock = this.sizes.reduce((total, size) => total + size.quantity, 0);
    next();
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
    if (this.reviews.length === 0) {
        this.averageRating = 0;
        this.numReviews = 0;
    } else {
        const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
        this.averageRating = Math.round((totalRating / this.reviews.length) * 10) / 10;
        this.numReviews = this.reviews.length;
    }
};

export default mongoose.model('Product', productSchema);
