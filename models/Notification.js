const db = require('../config/db');

const Notification = {
    async create({ user_id, message }) {
        await db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [user_id, message]);
    },

    async getByUser(userId, limit = 20) {
        const [rows] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
            [userId, limit]
        );
        return rows;
    },

    async markRead(id) {
        await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    },

    async markAllRead(userId) {
        await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    },

    async unreadCount(userId) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE', [userId]
        );
        return rows[0].count;
    }
};

module.exports = Notification;
