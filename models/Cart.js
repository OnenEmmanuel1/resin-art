const db = require('../config/db');

const Cart = {
    async getByUser(userId) {
        const [rows] = await db.query(
            `SELECT c.*, p.name, p.price, p.image_url, p.stock FROM cart c 
             JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`, [userId]
        );
        return rows;
    },

    async addItem(userId, productId, quantity = 1) {
        const [existing] = await db.query(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]
        );
        if (existing.length > 0) {
            await db.query(
                'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [quantity, userId, productId]
            );
        } else {
            await db.query(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, productId, quantity]
            );
        }
    },

    async updateQuantity(userId, productId, quantity) {
        await db.query(
            'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [quantity, userId, productId]
        );
    },

    async removeItem(userId, productId) {
        await db.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId]);
    },

    async clear(userId) {
        await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);
    },

    async count(userId) {
        const [rows] = await db.query('SELECT COALESCE(SUM(quantity), 0) as count FROM cart WHERE user_id = ?', [userId]);
        return rows[0].count;
    },

    async getTotal(userId) {
        const [rows] = await db.query(
            `SELECT COALESCE(SUM(c.quantity * p.price), 0) as total FROM cart c 
             JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`, [userId]
        );
        return parseFloat(rows[0].total) || 0;
    }
};

module.exports = Cart;
