const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/upload');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = { isActive: true };

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.occasion) {
            filter.occasion = { $in: [req.query.occasion] };
        }

        if (req.query.recipientType) {
            filter.recipientType = { $in: [req.query.recipientType] };
        }

        if (req.query.featured === 'true') {
            filter.isFeatured = true;
        }

        if (req.query.newArrival === 'true') {
            filter.isNewArrival = true;
        }

        if (req.query.bestSeller === 'true') {
            filter.isBestSeller = true;
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
        }

        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }

        // Build sort
        let sort = {};
        switch (req.query.sort) {
            case 'price-asc':
                sort = { price: 1 };
                break;
            case 'price-desc':
                sort = { price: -1 };
                break;
            case 'rating':
                sort = { rating: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('category', 'name')
            .skip(skip)
            .limit(limit)
            .sort(sort);

        res.json({
            products,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/products/admin
// @desc    Get all products for admin
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { sku: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        if (req.query.category) {
            filter.category = req.query.category;
        }

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('category', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.json({
            products,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/products/filters
// @desc    Get distinct filter values (occasions, recipients)
// @access  Public
router.get('/filters', async (req, res) => {
    try {
        const occasions = await Product.distinct('occasion', { isActive: true });
        const recipients = await Product.distinct('recipientType', { isActive: true });
        res.json({
            occasions: occasions.filter(Boolean).sort(),
            recipients: recipients.filter(Boolean).sort()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true, isFeatured: true })
            .populate('category', 'name')
            .limit(8)
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/products/new-arrivals
// @desc    Get new arrival products
// @access  Public
router.get('/new-arrivals', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true, isNewArrival: true })
            .populate('category', 'name')
            .limit(8)
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/products/best-sellers
// @desc    Get best seller products
// @access  Public
router.get('/best-sellers', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true, isBestSeller: true })
            .populate('category', 'name')
            .limit(8)
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', protect, admin, uploadProduct.fields([{ name: 'images', maxCount: 5 }, { name: 'variantImages', maxCount: 20 }]), async (req, res) => {
    try {
        const {
            name,
            description,
            shortDescription,
            price,
            comparePrice,
            category,
            stock,
            sku,
            allowTextCustomization,
            textCustomizationLabel,
            textCustomizationMaxLength,
            textCustomizationPrice,
            allowPhotoCustomization,
            photoCustomizationLabel,
            photoCustomizationPrice,
            maxPhotos,
            tags,
            occasion,
            recipientType,
            isActive,
            isFeatured,
            isNewArrival,
            isBestSeller,
            hasVariants,
            variantType,
            variants
        } = req.body;

        const images = req.files && req.files.images ? req.files.images.map(file => `/uploads/products/${file.filename}`) : [];

        let parsedVariants = [];
        if (variants) {
            try {
                parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
                if (req.files && req.files.variantImages) {
                    parsedVariants = parsedVariants.map(v => {
                        if (v.imageIndex !== undefined && req.files.variantImages[v.imageIndex]) {
                            v.image = `/uploads/products/${req.files.variantImages[v.imageIndex].filename}`;
                        } else if (v.existingImage) {
                            v.image = v.existingImage;
                        }
                        return v;
                    });
                } else {
                    parsedVariants = parsedVariants.map(v => {
                        if (v.existingImage) v.image = v.existingImage;
                        return v;
                    });
                }
            } catch (e) {
                console.error("Error parsing variants", e);
            }
        }

        const product = await Product.create({
            name,
            description,
            shortDescription,
            price: parseFloat(price),
            comparePrice: parseFloat(comparePrice) || 0,
            category,
            images,
            stock: parseInt(stock) || 0,
            sku,
            hasVariants: hasVariants === 'true',
            variantType: variantType || 'None',
            variants: parsedVariants,
            allowTextCustomization: allowTextCustomization === 'true',
            textCustomizationLabel: textCustomizationLabel || 'Add your message',
            textCustomizationMaxLength: parseInt(textCustomizationMaxLength) || 100,
            textCustomizationPrice: parseFloat(textCustomizationPrice) || 0,
            allowPhotoCustomization: allowPhotoCustomization === 'true',
            photoCustomizationLabel: photoCustomizationLabel || 'Upload your photo',
            photoCustomizationPrice: parseFloat(photoCustomizationPrice) || 0,
            maxPhotos: parseInt(maxPhotos) || 1,
            tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [],
            occasion: occasion ? (typeof occasion === 'string' ? occasion.split(',').map(o => o.trim()) : occasion) : [],
            recipientType: recipientType ? (typeof recipientType === 'string' ? recipientType.split(',').map(r => r.trim()) : recipientType) : [],
            isActive: isActive !== 'false',
            isFeatured: isFeatured === 'true',
            isNewArrival: isNewArrival === 'true',
            isBestSeller: isBestSeller === 'true'
        });

        const populatedProduct = await Product.findById(product._id).populate('category', 'name');
        res.status(201).json(populatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, admin, uploadProduct.fields([{ name: 'images', maxCount: 5 }, { name: 'variantImages', maxCount: 20 }]), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const {
            name,
            description,
            shortDescription,
            price,
            comparePrice,
            category,
            stock,
            sku,
            allowTextCustomization,
            textCustomizationLabel,
            textCustomizationMaxLength,
            textCustomizationPrice,
            allowPhotoCustomization,
            photoCustomizationLabel,
            photoCustomizationPrice,
            maxPhotos,
            tags,
            occasion,
            recipientType,
            isActive,
            isFeatured,
            isNewArrival,
            isBestSeller,
            existingImages,
            hasVariants,
            variantType,
            variants
        } = req.body;

        // Handle images
        let images = [];
        if (existingImages) {
            images = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
        }
        if (req.files && req.files.images && req.files.images.length > 0) {
            const newImages = req.files.images.map(file => `/uploads/products/${file.filename}`);
            images = [...images, ...newImages];
        }

        let parsedVariants = undefined;
        if (variants) {
            try {
                parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
                if (req.files && req.files.variantImages) {
                    parsedVariants = parsedVariants.map(v => {
                        if (v.imageIndex !== undefined && req.files.variantImages[v.imageIndex]) {
                            v.image = `/uploads/products/${req.files.variantImages[v.imageIndex].filename}`;
                        } else if (v.existingImage) {
                            v.image = v.existingImage;
                        }
                        return v;
                    });
                } else {
                    parsedVariants = parsedVariants.map(v => {
                        if (v.existingImage) v.image = v.existingImage;
                        return v;
                    });
                }
            } catch (e) {
                console.error("Error parsing variants", e);
            }
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.shortDescription = shortDescription !== undefined ? shortDescription : product.shortDescription;
        product.price = price ? parseFloat(price) : product.price;
        product.comparePrice = comparePrice !== undefined ? parseFloat(comparePrice) : product.comparePrice;
        product.category = category || product.category;
        product.stock = stock !== undefined ? parseInt(stock) : product.stock;
        product.sku = sku !== undefined ? sku : product.sku;
        product.images = images.length > 0 ? images : product.images;

        if (hasVariants !== undefined) product.hasVariants = hasVariants === 'true';
        if (variantType !== undefined) product.variantType = variantType;
        if (parsedVariants !== undefined) product.variants = parsedVariants;

        // Customization options
        product.allowTextCustomization = allowTextCustomization !== undefined ? allowTextCustomization === 'true' : product.allowTextCustomization;
        product.textCustomizationLabel = textCustomizationLabel || product.textCustomizationLabel;
        product.textCustomizationMaxLength = textCustomizationMaxLength ? parseInt(textCustomizationMaxLength) : product.textCustomizationMaxLength;
        product.textCustomizationPrice = textCustomizationPrice !== undefined ? parseFloat(textCustomizationPrice) : product.textCustomizationPrice;
        product.allowPhotoCustomization = allowPhotoCustomization !== undefined ? allowPhotoCustomization === 'true' : product.allowPhotoCustomization;
        product.photoCustomizationLabel = photoCustomizationLabel || product.photoCustomizationLabel;
        product.photoCustomizationPrice = photoCustomizationPrice !== undefined ? parseFloat(photoCustomizationPrice) : product.photoCustomizationPrice;
        product.maxPhotos = maxPhotos ? parseInt(maxPhotos) : product.maxPhotos;

        // Attributes
        if (tags) {
            product.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
        }
        if (occasion) {
            product.occasion = typeof occasion === 'string' ? occasion.split(',').map(o => o.trim()) : occasion;
        }
        if (recipientType) {
            product.recipientType = typeof recipientType === 'string' ? recipientType.split(',').map(r => r.trim()) : recipientType;
        }

        // Status flags
        product.isActive = isActive !== undefined ? isActive === 'true' : product.isActive;
        product.isFeatured = isFeatured !== undefined ? isFeatured === 'true' : product.isFeatured;
        product.isNewArrival = isNewArrival !== undefined ? isNewArrival === 'true' : product.isNewArrival;
        product.isBestSeller = isBestSeller !== undefined ? isBestSeller === 'true' : product.isBestSeller;

        const updatedProduct = await product.save();
        const populatedProduct = await Product.findById(updatedProduct._id).populate('category', 'name');

        res.json(populatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
