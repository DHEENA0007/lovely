const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    shortDescription: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: 0
    },
    deliveryCharge: {
        type: Number,
        default: 50
    },
    comparePrice: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    images: [{
        type: String
    }],
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    // Variants: size or frame
    hasVariants: {
        type: Boolean,
        default: false
    },
    variantType: {
        type: String,
        enum: ['None', 'Size', 'Frame'],
        default: 'None'
    },
    variants: [{
        value: String,
        price: Number,
        image: String
    }],
    // Customization options
    allowTextCustomization: {
        type: Boolean,
        default: false
    },
    textCustomizationLabel: {
        type: String,
        default: 'Add your message'
    },
    textCustomizationMaxLength: {
        type: Number,
        default: 100
    },
    textCustomizationPrice: {
        type: Number,
        default: 0
    },
    allowPhotoCustomization: {
        type: Boolean,
        default: false
    },
    photoCustomizationLabel: {
        type: String,
        default: 'Upload your photo'
    },
    photoCustomizationPrice: {
        type: Number,
        default: 0
    },
    maxPhotos: {
        type: Number,
        default: 1
    },
    // Product attributes
    tags: [{
        type: String
    }],
    occasion: [{
        type: String
    }],
    recipientType: [{
        type: String
    }],
    // Ratings
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isNewArrival: {
        type: Boolean,
        default: false
    },
    isBestSeller: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Add text index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
