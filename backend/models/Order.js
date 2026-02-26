const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    image: String,
    price: Number,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    // Customization details
    customization: {
        variant: {
            type: { type: String },
            value: { type: String },
            price: { type: Number }
        },
        text: {
            enabled: { type: Boolean, default: false },
            content: { type: String, default: '' },
            price: { type: Number, default: 0 }
        },
        photo: {
            enabled: { type: Boolean, default: false },
            images: [{ type: String }],
            price: { type: Number, default: 0 }
        }
    },
    itemTotal: Number
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cod', 'card', 'upi', 'netbanking', 'phonepe']
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email: String,
        phonepe_transaction_id: String,
        payment_instrument: String
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0
    },
    customizationPrice: {
        type: Number,
        default: 0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    couponCode: {
        type: String,
        default: ''
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: Date,
    status: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    trackingNumber: String,
    deliveredAt: Date,
    giftMessage: {
        type: String,
        default: ''
    },
    isGiftWrapped: {
        type: Boolean,
        default: false
    },
    giftWrapPrice: {
        type: Number,
        default: 0
    },
    notes: String
}, {
    timestamps: true
});

// Generate order number
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `LG${year}${month}${random}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
