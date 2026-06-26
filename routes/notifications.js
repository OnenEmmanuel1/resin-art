const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { isLoggedIn } = require('../middlewares/auth');

// GET Notifications page
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const notifications = await Notification.getByUser(req.session.user.id);
        
        // Mark all as read when viewed
        await Notification.markAllAsRead(req.session.user.id);

        res.render('notifications', {
            title: 'Notifications',
            notifications
        });
    } catch (error) {
        console.error(error);
        req.session.error = 'Error loading notifications.';
        res.redirect('back');
    }
});

// GET unread count for navbar badge
router.get('/unread-count', isLoggedIn, async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.session.user.id);
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
