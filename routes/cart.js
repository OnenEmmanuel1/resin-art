const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { isLoggedIn } = require('../middlewares/auth');

// GET Cart page
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const cartItems = await Cart.getByUser(req.session.user.id);
        const cartTotal = await Cart.getTotal(req.session.user.id);

        res.render('cart', {
            title: 'Shopping Cart',
            cartItems,
            cartTotal
        });
    } catch (error) {
        console.error(error);
        req.session.error = 'Error loading cart.';
        res.redirect('/');
    }
});

// POST Add to cart
router.post('/add', isLoggedIn, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        await Cart.addItem(req.session.user.id, product_id, parseInt(quantity) || 1);

        const cartCount = await Cart.count(req.session.user.id);
        req.session.cartCount = cartCount;

        req.session.success = 'Item added to cart!';
        res.redirect('back');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error adding to cart.';
        res.redirect('back');
    }
});

// POST Update quantity
router.post('/update', isLoggedIn, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        if (parseInt(quantity) <= 0) {
            await Cart.removeItem(req.session.user.id, product_id);
        } else {
            await Cart.updateQuantity(req.session.user.id, product_id, parseInt(quantity));
        }

        const cartCount = await Cart.count(req.session.user.id);
        req.session.cartCount = cartCount;

        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error updating cart.';
        res.redirect('/cart');
    }
});

// POST Remove from cart
router.post('/remove', isLoggedIn, async (req, res) => {
    try {
        const { product_id } = req.body;
        await Cart.removeItem(req.session.user.id, product_id);

        const cartCount = await Cart.count(req.session.user.id);
        req.session.cartCount = cartCount;

        req.session.success = 'Item removed from cart.';
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error removing item.';
        res.redirect('/cart');
    }
});

// GET Checkout page
router.get('/checkout', isLoggedIn, async (req, res) => {
    try {
        const cartItems = await Cart.getByUser(req.session.user.id);
        if (cartItems.length === 0) {
            req.session.error = 'Your cart is empty.';
            return res.redirect('/cart');
        }
        const cartTotal = await Cart.getTotal(req.session.user.id);
        const tax = cartTotal * 0.075; // 7.5% VAT
        const shipping = cartTotal > 50000 ? 0 : 2500;
        const grandTotal = cartTotal + tax + shipping;

        res.render('checkout', {
            title: 'Checkout',
            cartItems,
            cartTotal,
            tax,
            shipping,
            grandTotal,
            paystackKey: process.env.PAYSTACK_SECRET_KEY || 'pk_test_xxxxx'
        });
    } catch (error) {
        console.error(error);
        req.session.error = 'Error loading checkout.';
        res.redirect('/cart');
    }
});

module.exports = router;
