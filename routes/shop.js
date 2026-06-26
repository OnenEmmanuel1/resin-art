const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');

// GET Shop page
router.get('/', async (req, res) => {
    try {
        const { category, search, sort, page } = req.query;
        const limit = 12;
        const currentPage = parseInt(page) || 1;
        const offset = (currentPage - 1) * limit;

        const products = await Product.getAll({
            category_id: category || null,
            search: search || null,
            sort: sort || 'latest',
            limit,
            offset
        });

        const totalProducts = await Product.countAll();
        const totalPages = Math.ceil(totalProducts / limit);
        const categories = await Category.getAll();

        res.render('shop', {
            title: 'Shop',
            products,
            categories,
            currentCategory: category || '',
            currentSearch: search || '',
            currentSort: sort || 'latest',
            currentPage,
            totalPages
        });
    } catch (error) {
        console.error(error);
        req.session.error = 'Error loading shop.';
        res.redirect('/');
    }
});

// GET Product detail page
router.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.session.error = 'Product not found.';
            return res.redirect('/shop');
        }

        const reviews = await Review.getByProduct(product.id);
        const ratingData = await Review.getAverageRating(product.id);
        const relatedProducts = await Product.getRelated(product.category_id, product.id);
        const arModel = await Product.getARModel(product.id);

        res.render('product-details', {
            title: product.name,
            product,
            reviews,
            avgRating: ratingData.avg_rating,
            reviewCount: ratingData.count,
            relatedProducts,
            arModel
        });
    } catch (error) {
        console.error(error);
        req.session.error = 'Error loading product.';
        res.redirect('/shop');
    }
});

// POST Review
const { isLoggedIn } = require('../middlewares/auth');

router.post('/product/:id/review', isLoggedIn, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        await Review.create({
            product_id: req.params.id,
            user_id: req.session.user.id,
            rating: parseInt(rating),
            comment
        });
        req.session.success = 'Review submitted! It will appear after approval.';
        res.redirect(`/shop/product/${req.params.id}`);
    } catch (error) {
        console.error(error);
        req.session.error = 'Error submitting review.';
        res.redirect(`/shop/product/${req.params.id}`);
    }
});

module.exports = router;
