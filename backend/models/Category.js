const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: 'gift'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        enum: ['category', 'occasion', 'recipient'],
        default: 'category'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
