import mongoose from 'mongoose';

const heroImageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  subtitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  tagline: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  imageUrl: {
    type: String,
    required: true
  },
  bgColor: {
    type: String,
    required: true,
    default: 'from-orange-200 via-orange-300 to-orange-400'
  },
  linkUrl: {
    type: String,
    default: '/shop'
  },
  linkText: {
    type: String,
    default: 'Shop Collection'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for sorting and filtering
heroImageSchema.index({ sortOrder: 1, isActive: 1 });

const HeroImage = mongoose.model('HeroImage', heroImageSchema);

export default HeroImage;
