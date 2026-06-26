const db = require('../config/db');

const Order = {
    async create({ user_id, total_amount, shipping_address }) {
        const [result] = await db.query(
            'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)',
            [user_id, total_amount, shipping_address]
        );
        return result.insertId;
    },

    async addItem({ order_id, product_id, quantity, price }) {
        await db.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [order_id, product_id, quantity, price]
        );
    },

    async findById(id) {
        const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        return rows[0];
    },

    async getItems(orderId) {
        const [rows] = await db.query(
            `SELECT oi.*, p.name, p.image_url FROM order_items oi 
             JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`, [orderId]
        );
        return rows;
    },

    async getByUser(userId) {
        const [rows] = await db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]
        );
        return rows;
    },

    async getAll() {
        const [rows] = await db.query(
            `SELECT o.*, u.first_name, u.last_name, u.email FROM orders o 
             JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC`
        );
        return rows;
    },

    async updateStatus(id, status) {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    },

    async updateTracking(id, trackingNumber) {
        await db.query('UPDATE orders SET delivery_tracking_number = ? WHERE id = ?', [trackingNumber, id]);
    },

    async count() {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM orders');
        return rows[0].count;
    },

    async countByStatus(status) {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM orders WHERE status = ?', [status]);
        return rows[0].count;
    },

    async totalRevenue() {
        const [rows] = await db.query("SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE status IN ('paid', 'shipped', 'delivered')");
        return parseFloat(rows[0].revenue) || 0;
    },

    async monthlySales() {
        const [rows] = await db.query(
            `SELECT MONTH(created_at) as month, YEAR(created_at) as year, 
             SUM(total_amount) as total FROM orders 
             WHERE status IN ('paid', 'shipped', 'delivered') 
             GROUP BY YEAR(created_at), MONTH(created_at) 
             ORDER BY year DESC, month DESC LIMIT 12`
        );
        return rows.map(row => ({
            ...row,
            total: parseFloat(row.total) || 0
        }));
    }
};

module.exports = Order;
