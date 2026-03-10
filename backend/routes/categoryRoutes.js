const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Knowledge = require('../models/Knowledge');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// @route   GET /categories
// @desc    Get all categories with article counts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        // Calculate article counts for each category
        const categoriesWithCounts = await Promise.all(categories.map(async (cat) => {
            const count = await Knowledge.countDocuments({ category: cat.name });
            return {
                _id: cat._id,
                name: cat.name,
                description: cat.description,
                createdAt: cat.createdAt,
                articleCount: count
            };
        }));

        res.json(categoriesWithCounts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /categories
// @desc    Create a new category
// @access  Admin only
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const existingCat = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingCat) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const newCategory = new Category({ name, description });
        await newCategory.save();

        res.status(201).json(newCategory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /categories/:id
// @desc    Update a category
// @access  Admin only
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;
        const categoryId = req.params.id;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // If name changes, we theoretically should update all articles with this old name
        const oldName = category.name;

        category.name = name || category.name;
        category.description = description !== undefined ? description : category.description;

        await category.save();

        if (name && oldName !== name) {
            await Knowledge.updateMany({ category: oldName }, { $set: { category: name } });
        }

        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   DELETE /categories/:id
// @desc    Delete a category
// @access  Admin only
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await Category.findByIdAndDelete(categoryId);

        // Optionally, reset category for articles using this category
        // await Knowledge.updateMany({ category: category.name }, { $set: { category: 'Uncategorized' } });

        res.json({ message: 'Category removed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
