const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId, isApproved: true })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });
        res.json({ reviews });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a review
router.post('/', protect, async (req, res) => {
    try {
        const { productId, rating, title, comment } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const existingReview = await Review.findOne({ user: req.user._id, product: productId });
        if (existingReview) return res.status(400).json({ message: 'Already reviewed' });

        const review = await Review.create({
            user: req.user._id,
            product: productId,
            rating,
            title,
            comment
        });

        // Update product rating
        const reviews = await Review.find({ product: productId, isApproved: true });
        const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        await Product.findByIdAndUpdate(productId, { rating: avgRating.toFixed(1), numReviews: reviews.length });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a review
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const productId = review.product;
        await review.deleteOne();
        const reviews = await Review.find({ product: productId, isApproved: true });
        const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
        await Product.findByIdAndUpdate(productId, { rating: avgRating.toFixed(1), numReviews: reviews.length });
        res.json({ message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
