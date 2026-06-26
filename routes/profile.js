const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { isLoggedIn } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// GET Profile page
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render('profile', { title: 'My Profile', profile: user });
    } catch (error) {
        console.error(error);
        req.session.error = 'Error loading profile.';
        res.redirect('/');
    }
});

// POST Update profile
router.post('/update', isLoggedIn, async (req, res) => {
    try {
        const { first_name, last_name, phone, address } = req.body;
        await User.update(req.session.user.id, { first_name, last_name, phone, address });

        req.session.user.first_name = first_name;
        req.session.user.last_name = last_name;
        req.session.success = 'Profile updated successfully!';
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error updating profile.';
        res.redirect('/profile');
    }
});

// POST Change password
router.post('/change-password', isLoggedIn, async (req, res) => {
    try {
        const { current_password, new_password, confirm_password } = req.body;

        if (new_password !== confirm_password) {
            req.session.error = 'New passwords do not match.';
            return res.redirect('/profile');
        }

        const user = await User.findByEmail(req.session.user.email);
        const match = await bcrypt.compare(current_password, user.password);
        if (!match) {
            req.session.error = 'Current password is incorrect.';
            return res.redirect('/profile');
        }

        const hashed = await bcrypt.hash(new_password, 10);
        await User.updatePassword(req.session.user.id, hashed);

        req.session.success = 'Password changed successfully!';
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error changing password.';
        res.redirect('/profile');
    }
});

// POST Update profile image
router.post('/upload-image', isLoggedIn, upload.single('profile_image'), async (req, res) => {
    try {
        if (!req.file) {
            req.session.error = 'No file uploaded.';
            return res.redirect('/profile');
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        await User.updateProfileImage(req.session.user.id, imageUrl);

        // Update session user object if it contains profile image
        // (Note: Currently it doesn't, but we might add it later)
        
        req.session.success = 'Profile picture updated successfully!';
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error uploading image.';
        res.redirect('/profile');
    }
});

module.exports = router;
