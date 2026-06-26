const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { isGuest, isLoggedIn } = require('../middlewares/auth');
const Cart = require('../models/Cart');
const passport = require('passport');

// GET Login page
router.get('/login', isGuest, (req, res) => {
    res.render('auth/login', { title: 'Login' });
});

// POST Login
router.post('/login', isGuest, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            req.session.error = 'Invalid email or password.';
            return res.redirect('/auth/login');
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.session.error = 'Invalid email or password.';
            return res.redirect('/auth/login');
        }

        req.session.user = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            profile_image: user.profile_image,
            role: user.role
        };

        // Update cart count in session
        const cartCount = await Cart.count(user.id);
        req.session.cartCount = cartCount;

        req.session.success = `Welcome back, ${user.first_name}!`;

        if (user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.session.error = 'Something went wrong. Please try again.';
        res.redirect('/auth/login');
    }
});

// GET Signup page
router.get('/signup', isGuest, (req, res) => {
    res.render('auth/signup', { title: 'Sign Up' });
});

// POST Signup
router.post('/signup', isGuest, async (req, res) => {
    try {
        const { first_name, last_name, email, password, confirm_password, phone } = req.body;

        if (password !== confirm_password) {
            req.session.error = 'Passwords do not match.';
            return res.redirect('/auth/signup');
        }

        if (password.length < 6) {
            req.session.error = 'Password must be at least 6 characters.';
            return res.redirect('/auth/signup');
        }

        const existing = await User.findByEmail(email);
        if (existing) {
            req.session.error = 'Email already registered.';
            return res.redirect('/auth/signup');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await User.create({ first_name, last_name, email, password: hashedPassword, phone });

        req.session.user = {
            id: userId,
            first_name,
            last_name,
            email,
            role: 'customer'
        };

        req.session.success = 'Account created successfully! Welcome!';
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.session.error = 'Something went wrong. Please try again.';
        res.redirect('/auth/signup');
    }
});

// GET Logout
router.get('/logout', isLoggedIn, (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// ===================== SOCIAL LOGIN =====================

// Google Auth
router.get('/google', isGuest, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', isGuest, passport.authenticate('google', { failureRedirect: '/auth/login' }), async (req, res) => {
    try {
        const user = req.user;
        req.session.user = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            profile_image: user.profile_image,
            role: user.role
        };

        const cartCount = await Cart.count(user.id);
        req.session.cartCount = cartCount;

        req.session.success = `Successfully logged in with Google! Welcome, ${user.first_name}.`;
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.redirect('/auth/login');
    }
});

// Facebook Auth
router.get('/facebook', isGuest, passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', isGuest, passport.authenticate('facebook', { failureRedirect: '/auth/login' }), async (req, res) => {
    try {
        const user = req.user;
        req.session.user = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            profile_image: user.profile_image,
            role: user.role
        };

        const cartCount = await Cart.count(user.id);
        req.session.cartCount = cartCount;

        req.session.success = `Successfully logged in with Facebook! Welcome, ${user.first_name}.`;
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.redirect('/auth/login');
    }
});

module.exports = router;
