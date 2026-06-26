const db = require('../config/db');

const Payment = {
    async create({ order_id, user_id, amount, reference }) {
        const [result] = await db.query(
            'INSERT INTO payments (order_id, user_id, amount, reference) VALUES (?, ?, ?, ?)',
            [order_id, user_id, amount, reference]
        );
        return result.insertId;
    },

    async findByReference(reference) {
        const [rows] = await db.query('SELECT * FROM payments WHERE reference = ?', [reference]);
        return rows[0];
    },

    async updateStatus(reference, status) {
        await db.query('UPDATE payments SET status = ? WHERE reference = ?', [status, reference]);
    },

    async getByOrder(orderId) {
        const [rows] = await db.query('SELECT * FROM payments WHERE order_id = ?', [orderId]);
        return rows[0];
    }
};

module.exports = Payment;
