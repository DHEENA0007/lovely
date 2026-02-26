const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart) {
            cart = { items: [], couponCode: '' };
        }

        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { productId, quantity, customization } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [{
                    product: productId,
                    quantity,
                    customization: customization || {}
                }]
            });
        } else {
            // Check if product already in cart
            const existingItem = cart.items.find(
                item => item.product.toString() === productId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
                if (customization) {
                    existingItem.customization = customization;
                }
            } else {
                cart.items.push({
                    product: productId,
                    quantity,
                    customization: customization || {}
                });
            }

            await cart.save();
        }

        cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/cart/:itemId
// @desc    Update cart item
// @access  Private
router.put('/:itemId', protect, async (req, res) => {
    try {
        const { quantity, customization } = req.body;

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.id(req.params.itemId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (quantity !== undefined) {
            if (quantity <= 0) {
                cart.items.pull(req.params.itemId);
            } else {
                item.quantity = quantity;
            }
        }

        if (customization) {
            item.customization = customization;
        }

        await cart.save();

        const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        res.json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items.pull(req.params.itemId);
        await cart.save();

        const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        res.json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', protect, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user._id });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/cart/coupon
// @desc    Apply coupon to cart
// @access  Private
router.put('/coupon', protect, async (req, res) => {
    try {
        const { couponCode } = req.body;

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.couponCode = couponCode;
        await cart.save();

        const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        res.json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
