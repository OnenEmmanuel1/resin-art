const db = require('../config/db');

const User = {
    async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    async findBySocialId(provider, id) {
        const [rows] = await db.query(`SELECT * FROM users WHERE ${provider} = ?`, [id]);
        return rows[0];
    },

    async findById(id) {
        const [rows] = await db.query('SELECT id, first_name, last_name, email, phone, address, profile_image, role, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    async create({ first_name, last_name, email, password, phone }) {
        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, email, password, phone) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, password, phone || null]
        );
        return result.insertId;
    },

    async createSocialUser({ first_name, last_name, email, google_id, facebook_id }) {
        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, email, google_id, facebook_id) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, google_id || null, facebook_id || null]
        );
        return result.insertId;
    },

    async updateSocialId(userId, provider, id) {
        await db.query(`UPDATE users SET ${provider} = ? WHERE id = ?`, [id, userId]);
    },

    async update(id, { first_name, last_name, phone, address }) {
        await db.query(
            'UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ? WHERE id = ?',
            [first_name, last_name, phone || null, address || null, id]
        );
    },

    async updatePassword(id, hashedPassword) {
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    },

    async updateProfileImage(id, imageUrl) {
        await db.query('UPDATE users SET profile_image = ? WHERE id = ?', [imageUrl, id]);
    },

    async getAll() {
        const [rows] = await db.query('SELECT id, first_name, last_name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
        return rows;
    },

    async count() {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
        return rows[0].count;
    },

    async delete(id) {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
    }
};

module.exports = User;
