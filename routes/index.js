const express = require('express');
const router = express.Router();
const db = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Home Route
router.get('/', async (req, res) => {
    try {
        const featuredProducts = await Product.getAll({ sort: 'latest', limit: 8 });
        const categories = await Category.getAll();
        res.render('index', {
            title: 'Home - Resin Art E-Commerce AR',
            featuredProducts,
            categories
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// About Route
router.get('/about', (req, res) => {
    res.render('about', { title: 'About Us' });
});

// Contact Route
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us' });
});

// Contact form POST
router.post('/contact', (req, res) => {
    // In production, send email via nodemailer
    req.session.success = 'Thank you for your message! We will get back to you soon.';
    res.redirect('/contact');
});

module.exports = router;
