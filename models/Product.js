const db = require('../config/db');

const Product = {
    async getAll({ category_id, search, sort, limit, offset }) {
        let query = `SELECT p.*, c.name as category_name FROM products p 
                     LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = 'active'`;
        const params = [];

        if (category_id) {
            query += ' AND p.category_id = ?';
            params.push(category_id);
        }

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        switch (sort) {
            case 'price_asc': query += ' ORDER BY p.price ASC'; break;
            case 'price_desc': query += ' ORDER BY p.price DESC'; break;
            case 'latest': query += ' ORDER BY p.created_at DESC'; break;
            case 'popular': query += ' ORDER BY p.id DESC'; break;
            default: query += ' ORDER BY p.created_at DESC';
        }

        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
            if (offset) {
                query += ' OFFSET ?';
                params.push(parseInt(offset));
            }
        }

        const [rows] = await db.query(query, params);
        return rows;
    },

    async findById(id) {
        const [rows] = await db.query(
            `SELECT p.*, c.name as category_name FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`, [id]
        );
        return rows[0];
    },

    async create({ name, description, price, stock, category_id, image_url, status }) {
        const [result] = await db.query(
            'INSERT INTO products (name, description, price, stock, category_id, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, stock, category_id || null, image_url || null, status || 'active']
        );
        return result.insertId;
    },

    async update(id, { name, description, price, stock, category_id, image_url, status }) {
        let query = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, status = ?';
        const params = [name, description, price, stock, category_id || null, status || 'active'];

        if (image_url) {
            query += ', image_url = ?';
            params.push(image_url);
        }
        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);
    },

    async delete(id) {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
    },

    async count() {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM products');
        return rows[0].count;
    },

    async countAll() {
        const [rows] = await db.query("SELECT COUNT(*) as count FROM products WHERE status = 'active'");
        return rows[0].count;
    },

    async getRelated(categoryId, excludeId, limit = 4) {
        const [rows] = await db.query(
            `SELECT * FROM products WHERE category_id = ? AND id != ? AND status = 'active' ORDER BY RAND() LIMIT ?`,
            [categoryId, excludeId, limit]
        );
        return rows;
    },

    async updateStock(id, quantity) {
        await db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, id]);
    },

    async getARModel(productId) {
        const [rows] = await db.query('SELECT * FROM ar_models WHERE product_id = ?', [productId]);
        return rows[0];
    },

    async setARModel(productId, modelUrl) {
        const [existing] = await db.query('SELECT id FROM ar_models WHERE product_id = ?', [productId]);
        if (existing.length > 0) {
            await db.query('UPDATE ar_models SET model_url = ? WHERE product_id = ?', [modelUrl, productId]);
        } else {
            await db.query('INSERT INTO ar_models (product_id, model_url) VALUES (?, ?)', [productId, modelUrl]);
        }
    }
};

module.exports = Product;
