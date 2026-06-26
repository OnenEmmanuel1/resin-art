const db = require('../config/db');

const Review = {
    async getByProduct(productId) {
        const [rows] = await db.query(
            `SELECT r.*, u.first_name, u.last_name FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.product_id = ? AND r.status = 'approved' 
             ORDER BY r.created_at DESC`, [productId]
        );
        return rows;
    },

    async create({ product_id, user_id, rating, comment, image_url }) {
        const [result] = await db.query(
            'INSERT INTO reviews (product_id, user_id, rating, comment, image_url) VALUES (?, ?, ?, ?, ?)',
            [product_id, user_id, rating, comment || null, image_url || null]
        );
        return result.insertId;
    },

    async getAll() {
        const [rows] = await db.query(
            `SELECT r.*, u.first_name, u.last_name, p.name as product_name FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             JOIN products p ON r.product_id = p.id 
             ORDER BY r.created_at DESC`
        );
        return rows;
    },

    async updateStatus(id, status) {
        await db.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
    },

    async delete(id) {
        await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    },

    async getAverageRating(productId) {
        const [rows] = await db.query(
            "SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ? AND status = 'approved'",
            [productId]
        );
        return rows[0];
    }
};

module.exports = Review;
