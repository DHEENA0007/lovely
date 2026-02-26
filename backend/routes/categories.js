const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/upload');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/categories/all
// @desc    Get all categories including inactive (admin)
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ displayOrder: 1 });
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Private/Admin
router.post('/', protect, admin, uploadProduct.single('image'), async (req, res) => {
    try {
        const { name, description, icon, isActive, displayOrder, type } = req.body;

        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const imageUrl = req.body.image || (req.file ? `/uploads/products/${req.file.filename}` : '');

        const category = await Category.create({
            name,
            description,
            icon,
            isActive: isActive !== undefined ? isActive : true,
            displayOrder: displayOrder || 0,
            type: type || 'category',
            image: imageUrl
        });

        res.status(201).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put('/:id', protect, admin, uploadProduct.single('image'), async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            category.name = req.body.name || category.name;
            category.description = req.body.description || category.description;
            category.icon = req.body.icon || category.icon;
            category.isActive = req.body.isActive !== undefined ? req.body.isActive : category.isActive;
            category.displayOrder = req.body.displayOrder !== undefined ? req.body.displayOrder : category.displayOrder;
            category.type = req.body.type || category.type;

            if (req.body.image !== undefined) {
                category.image = req.body.image;
            }

            if (req.file) {
                category.image = `/uploads/products/${req.file.filename}`;
            }

            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            await category.deleteOne();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
