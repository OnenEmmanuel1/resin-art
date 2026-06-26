const db = require('../config/db');

const Category = {
    async getAll() {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
        return rows;
    },

    async findById(id) {
        const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0];
    },

    async create({ name, description }) {
        const [result] = await db.query(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [name, description || null]
        );
        return result.insertId;
    },

    async update(id, { name, description }) {
        await db.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description || null, id]);
    },

    async delete(id) {
        await db.query('DELETE FROM categories WHERE id = ?', [id]);
    },

    async count() {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM categories');
        return rows[0].count;
    }
};

module.exports = Category;
