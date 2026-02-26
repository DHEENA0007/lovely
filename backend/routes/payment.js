const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// PhonePe Configuration
const getPhonePeConfig = () => {
    const env = process.env.PHONEPE_ENV || 'UAT';
    return {
        clientId: process.env.PHONEPE_CLIENT_ID,
        apiKey: process.env.PHONEPE_API_KEY,
        apiUrl: env === 'PRODUCTION'
            ? 'https://api.phonepe.com/apis/hermes'
            : 'https://api-preprod.phonepe.com/apis/pg-sandbox',
        redirectBase: process.env.FRONTEND_URL || 'http://localhost:5173'
    };
};

// Generate SHA256 checksum
const generateChecksum = (payload, apiKey, endpoint) => {
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToSign = base64Payload + endpoint + apiKey;
    const sha256Hash = crypto.createHash('sha256').update(stringToSign).digest('hex');
    return {
        base64Payload,
        checksum: sha256Hash + '###1'
    };
};

// @route   POST /api/payment/initiate
// @desc    Create order and initiate PhonePe payment
// @access  Private
router.post('/initiate', protect, async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
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

        // Create order with payment status pending
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod: 'phonepe',
            itemsPrice,
            customizationPrice: customizationPrice || 0,
            shippingPrice,
            taxPrice,
            discountAmount: discountAmount || 0,
            totalPrice,
            couponCode: couponCode || '',
            giftMessage: giftMessage || '',
            isGiftWrapped: isGiftWrapped || false,
            giftWrapPrice: giftWrapPrice || 0,
            isPaid: false,
            status: 'pending'
        });

        // Prepare PhonePe payment request
        const config = getPhonePeConfig();
        const merchantTransactionId = `LOVELY_${order._id}_${Date.now()}`;

        // Store merchant transaction ID on order
        order.paymentResult = {
            id: merchantTransactionId,
            status: 'INITIATED',
            update_time: new Date().toISOString()
        };
        await order.save();

        const payload = {
            merchantId: config.clientId,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: `USER_${req.user._id}`,
            amount: Math.round(totalPrice * 100), // Amount in paisa
            redirectUrl: `${config.redirectBase}/payment/callback?orderId=${order._id}&txnId=${merchantTransactionId}`,
            redirectMode: 'REDIRECT',
            callbackUrl: `${config.redirectBase}/api/payment/webhook`,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const endpoint = '/pg/v1/pay';
        const { base64Payload, checksum } = generateChecksum(payload, config.apiKey, endpoint);

        // Make request to PhonePe
        const phonePeResponse = await axios.post(
            `${config.apiUrl}${endpoint}`,
            { request: base64Payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'X-MERCHANT-ID': config.clientId
                }
            }
        );

        if (phonePeResponse.data.success) {
            const redirectUrl = phonePeResponse.data.data.instrumentResponse.redirectInfo.url;
            res.json({
                success: true,
                orderId: order._id,
                redirectUrl,
                merchantTransactionId
            });
        } else {
            // If PhonePe initialization failed, still return order for COD fallback
            res.status(400).json({
                success: false,
                message: 'Payment initialization failed',
                orderId: order._id,
                error: phonePeResponse.data.message
            });
        }

    } catch (error) {
        console.error('Payment initiation error:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Payment initialization failed',
            error: error.response?.data?.message || error.message
        });
    }
});

// @route   GET /api/payment/status/:merchantTransactionId
// @desc    Check payment status
// @access  Private
router.get('/status/:merchantTransactionId', protect, async (req, res) => {
    try {
        const { merchantTransactionId } = req.params;
        const config = getPhonePeConfig();

        const endpoint = `/pg/v1/status/${config.clientId}/${merchantTransactionId}`;
        const stringToSign = endpoint + config.apiKey;
        const sha256Hash = crypto.createHash('sha256').update(stringToSign).digest('hex');
        const checksum = sha256Hash + '###1';

        const statusResponse = await axios.get(
            `${config.apiUrl}${endpoint}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'X-MERCHANT-ID': config.clientId
                }
            }
        );

        const paymentData = statusResponse.data;

        res.json({
            success: paymentData.success,
            code: paymentData.code,
            message: paymentData.message,
            data: paymentData.data
        });

    } catch (error) {
        console.error('Payment status check error:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Failed to check payment status',
            error: error.response?.data?.message || error.message
        });
    }
});

// @route   POST /api/payment/verify
// @desc    Verify payment after redirect and update order
// @access  Private
router.post('/verify', protect, async (req, res) => {
    try {
        const { orderId, merchantTransactionId } = req.body;

        // Find order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Make sure this order belongs to the user
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check payment status with PhonePe
        const config = getPhonePeConfig();
        const endpoint = `/pg/v1/status/${config.clientId}/${merchantTransactionId}`;
        const stringToSign = endpoint + config.apiKey;
        const sha256Hash = crypto.createHash('sha256').update(stringToSign).digest('hex');
        const checksum = sha256Hash + '###1';

        const statusResponse = await axios.get(
            `${config.apiUrl}${endpoint}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'X-MERCHANT-ID': config.clientId
                }
            }
        );

        const paymentData = statusResponse.data;

        if (paymentData.success && paymentData.code === 'PAYMENT_SUCCESS') {
            // Payment successful - update order
            order.isPaid = true;
            order.paidAt = new Date();
            order.status = 'confirmed';
            order.paymentResult = {
                id: merchantTransactionId,
                status: 'COMPLETED',
                update_time: new Date().toISOString(),
                phonepe_transaction_id: paymentData.data?.transactionId || '',
                payment_instrument: paymentData.data?.paymentInstrument?.type || ''
            };
            await order.save();

            // Update product stock
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }

            // Clear user's cart
            await Cart.findOneAndDelete({ user: req.user._id });

            res.json({
                success: true,
                message: 'Payment verified successfully',
                order
            });
        } else if (paymentData.code === 'PAYMENT_PENDING') {
            res.json({
                success: false,
                message: 'Payment is still pending',
                status: 'PENDING',
                order
            });
        } else {
            // Payment failed
            order.paymentResult = {
                id: merchantTransactionId,
                status: 'FAILED',
                update_time: new Date().toISOString(),
                error: paymentData.message
            };
            order.status = 'cancelled';
            await order.save();

            res.json({
                success: false,
                message: 'Payment failed',
                status: 'FAILED',
                order
            });
        }

    } catch (error) {
        console.error('Payment verification error:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Payment verification failed',
            error: error.response?.data?.message || error.message
        });
    }
});

// @route   POST /api/payment/webhook
// @desc    PhonePe webhook callback
// @access  Public
router.post('/webhook', async (req, res) => {
    try {
        const { response } = req.body;

        if (!response) {
            return res.status(400).json({ message: 'Invalid webhook data' });
        }

        // Decode the response
        const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString());
        console.log('PhonePe Webhook:', decodedResponse);

        // Verify checksum
        const config = getPhonePeConfig();
        const stringToSign = response + config.apiKey;
        const expectedChecksum = crypto.createHash('sha256').update(stringToSign).digest('hex') + '###1';

        // Extract merchant transaction ID
        const merchantTransactionId = decodedResponse.data?.merchantTransactionId;
        if (!merchantTransactionId) {
            return res.status(400).json({ message: 'Missing transaction ID' });
        }

        // Extract orderId from merchantTransactionId (format: LOVELY_{orderId}_{timestamp})
        const parts = merchantTransactionId.split('_');
        const orderId = parts[1];

        const order = await Order.findById(orderId);
        if (!order) {
            console.error('Order not found for webhook:', orderId);
            return res.status(200).json({ message: 'OK' }); // Return 200 to prevent retries
        }

        if (decodedResponse.code === 'PAYMENT_SUCCESS') {
            order.isPaid = true;
            order.paidAt = new Date();
            order.status = 'confirmed';
            order.paymentResult = {
                id: merchantTransactionId,
                status: 'COMPLETED',
                update_time: new Date().toISOString(),
                phonepe_transaction_id: decodedResponse.data?.transactionId || ''
            };
            await order.save();

            // Update stock
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }

            // Clear cart
            await Cart.findOneAndDelete({ user: order.user });
        }

        res.status(200).json({ message: 'Webhook processed' });

    } catch (error) {
        console.error('Webhook error:', error.message);
        res.status(200).json({ message: 'OK' }); // Always return 200 for webhooks
    }
});

module.exports = router;
