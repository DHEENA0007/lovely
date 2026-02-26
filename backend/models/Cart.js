const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    customization: {
        variant: {
            type: { type: String },
            value: { type: String },
            price: { type: Number }
        },
        text: {
            enabled: { type: Boolean, default: false },
            content: { type: String, default: '' }
        },
        photo: {
            enabled: { type: Boolean, default: false },
            images: [{ type: String }]
        }
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    couponCode: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
