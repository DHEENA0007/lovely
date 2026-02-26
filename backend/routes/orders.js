const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { protect, admin } = require('../middleware/auth');
const { uploadCustomization } = require('../middleware/upload');

// @route   GET /api/orders
// @desc    Get logged in user orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Order.countDocuments({ user: req.user._id });
        const orders = await Order.find({ user: req.user._id })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.json({
            orders,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/orders/admin
// @desc    Get all orders (admin)
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.search) {
            filter.$or = [
                { orderNumber: { $regex: req.query.search, $options: 'i' } },
                { 'shippingAddress.name': { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.json({
            orders,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/orders/stats
// @desc    Get order statistics (admin)
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const processingOrders = await Order.countDocuments({ status: 'processing' });
        const shippedOrders = await Order.countDocuments({ status: 'shipped' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

        const revenueResult = await Order.aggregate([
            { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Monthly revenue for chart
        const monthlyRevenue = await Order.aggregate([
            { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                    revenue: { $sum: '$totalPrice' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        res.json({
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalRevenue,
            monthlyRevenue
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            // Check if user owns the order or is admin
            if (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
                res.json(order);
            } else {
                res.status(403).json({ message: 'Not authorized to view this order' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            customizationPrice,
            shippingPrice,
            taxPrice,
            discountAmount,
            totalPrice,
            couponCode,
            giftMessage,
            isGiftWrapped,
            giftWrapPrice
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Create order items with product details
        const orderItems = await Promise.all(items.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new Error(`Product not found: ${item.product}`);
            }

            // Calculate item total including customization
            let basePrice = product.price;
            if (item.customization?.variant?.price !== undefined) {
                basePrice = item.customization.variant.price;
            }
            let itemTotal = basePrice * item.quantity;
            let textPrice = 0;
            let photoPrice = 0;

            if (item.customization?.text?.enabled && product.allowTextCustomization) {
                textPrice = product.textCustomizationPrice;
                itemTotal += textPrice * item.quantity;
            }

            if (item.customization?.photo?.enabled && product.allowPhotoCustomization) {
                photoPrice = product.photoCustomizationPrice;
                itemTotal += photoPrice * item.quantity;
            }

            return {
                product: product._id,
                name: product.name,
                image: (product.hasVariants && item.customization?.variant && product.variants?.find(v => v.value === item.customization.variant.value)?.image) || product.images[0] || '',
                price: basePrice,
                quantity: item.quantity,
                customization: {
                    variant: item.customization?.variant ? {
                        type: item.customization.variant.type,
                        value: item.customization.variant.value,
                        price: item.customization.variant.price
                    } : undefined,
                    text: {
                        enabled: item.customization?.text?.enabled || false,
                        content: item.customization?.text?.content || '',
                        price: textPrice
                    },
                    photo: {
                        enabled: item.customization?.photo?.enabled || false,
                        images: item.customization?.photo?.images || [],
                        price: photoPrice
                    }
                },
                itemTotal
            };
        }));

        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            customizationPrice: customizationPrice || 0,
            shippingPrice,
            taxPrice,
            discountAmount: discountAmount || 0,
            totalPrice,
            couponCode: couponCode || '',
            giftMessage: giftMessage || '',
            isGiftWrapped: isGiftWrapped || false,
            giftWrapPrice: giftWrapPrice || 0
        });

        // Update product stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear user's cart
        await Cart.findOneAndDelete({ user: req.user._id });

        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = req.body.status;

        if (req.body.trackingNumber) {
            order.trackingNumber = req.body.trackingNumber;
        }

        if (req.body.status === 'delivered') {
            order.deliveredAt = new Date();
        }

        if (req.body.notes) {
            order.notes = req.body.notes;
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            updateTime: req.body.updateTime,
            email: req.body.email
        };

        if (order.status === 'pending') {
            order.status = 'confirmed';
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns the order or is admin
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Can only cancel pending or confirmed orders
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
        }

        order.status = 'cancelled';

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/orders/upload-customization
// @desc    Upload customization images
// @access  Private
router.post('/upload-customization', protect, uploadCustomization.array('images', 5), async (req, res) => {
    try {
        const images = req.files.map(file => `/uploads/customizations/${file.filename}`);
        res.json({ images });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
