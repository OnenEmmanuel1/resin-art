const db = require('../config/db');

const Inventory = {
    // Log stock movement
    async logMovement({ product_id, quantity, type, reason }) {
        const [result] = await db.query(
            'INSERT INTO inventory (product_id, quantity, type, reason) VALUES (?, ?, ?, ?)',
            [product_id, quantity, type, reason || null]
        );
        return result.insertId;
    },

    // Adjust product stock and record movement
    async adjustStock({ product_id, quantity, type, reason }) {
        const qtyNum = parseInt(quantity, 10);
        if (isNaN(qtyNum) || qtyNum <= 0) {
            throw new Error('Quantity must be a positive number');
        }

        if (type === 'in') {
            await db.query('UPDATE products SET stock = stock + ? WHERE id = ?', [qtyNum, product_id]);
        } else if (type === 'out') {
            await db.query('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [qtyNum, product_id]);
        } else {
            throw new Error('Invalid movement type: must be "in" or "out"');
        }

        await this.logMovement({
            product_id,
            quantity: qtyNum,
            type,
            reason: reason || (type === 'in' ? 'Manual stock restock' : 'Manual stock deduction')
        });
    },

    // Get recent stock movements
    async getRecentMovements(limit = 15) {
        const [rows] = await db.query(
            `SELECT i.*, p.name as product_name, p.image_url, c.name as category_name 
             FROM inventory i 
             JOIN products p ON i.product_id = p.id 
             LEFT JOIN categories c ON p.category_id = c.id 
             ORDER BY i.created_at DESC 
             LIMIT ?`,
            [parseInt(limit, 10)]
        );
        return rows;
    },

    // Get inventory overall KPIs
    async getInventorySummary() {
        const [productStats] = await db.query(`
            SELECT 
                COUNT(*) as total_products,
                COALESCE(SUM(stock), 0) as total_stock_units,
                COALESCE(SUM(stock * price), 0) as stock_valuation,
                SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
                SUM(CASE WHEN stock > 0 AND stock <= 5 THEN 1 ELSE 0 END) as low_stock_count,
                SUM(CASE WHEN stock > 5 THEN 1 ELSE 0 END) as healthy_stock_count
            FROM products
        `);

        return {
            total_products: parseInt(productStats[0].total_products, 10) || 0,
            total_stock_units: parseInt(productStats[0].total_stock_units, 10) || 0,
            stock_valuation: parseFloat(productStats[0].stock_valuation) || 0,
            out_of_stock_count: parseInt(productStats[0].out_of_stock_count, 10) || 0,
            low_stock_count: parseInt(productStats[0].low_stock_count, 10) || 0,
            healthy_stock_count: parseInt(productStats[0].healthy_stock_count, 10) || 0
        };
    },

    // Stock distribution by category
    async getStockByCategory() {
        const [rows] = await db.query(`
            SELECT 
                c.id, 
                c.name as category_name, 
                COUNT(p.id) as product_count, 
                COALESCE(SUM(p.stock), 0) as total_units, 
                COALESCE(SUM(p.stock * p.price), 0) as total_value 
            FROM categories c 
            LEFT JOIN products p ON c.id = p.category_id 
            GROUP BY c.id, c.name 
            ORDER BY total_value DESC
        `);
        return rows.map(r => ({
            ...r,
            product_count: parseInt(r.product_count, 10) || 0,
            total_units: parseInt(r.total_units, 10) || 0,
            total_value: parseFloat(r.total_value) || 0
        }));
    },

    // Detailed inventory table with units sold
    async getDetailedInventory({ search, category_id, stock_status } = {}) {
        let query = `
            SELECT 
                p.id, 
                p.name, 
                p.price, 
                p.stock, 
                p.image_url, 
                p.status,
                c.name as category_name,
                c.id as category_id,
                (p.price * p.stock) as inventory_value,
                COALESCE(sales.units_sold, 0) as units_sold,
                COALESCE(sales.revenue_generated, 0) as revenue_generated
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN (
                SELECT 
                    oi.product_id, 
                    SUM(oi.quantity) as units_sold, 
                    SUM(oi.quantity * oi.price) as revenue_generated
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE o.status IN ('paid', 'shipped', 'delivered')
                GROUP BY oi.product_id
            ) sales ON p.id = sales.product_id
            WHERE 1=1
        `;

        const params = [];

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (category_id) {
            query += ' AND p.category_id = ?';
            params.push(parseInt(category_id, 10));
        }

        if (stock_status === 'out') {
            query += ' AND p.stock = 0';
        } else if (stock_status === 'low') {
            query += ' AND p.stock > 0 AND p.stock <= 5';
        } else if (stock_status === 'healthy') {
            query += ' AND p.stock > 5';
        }

        query += ' ORDER BY p.stock ASC, p.name ASC';

        const [rows] = await db.query(query, params);
        return rows.map(r => ({
            ...r,
            price: parseFloat(r.price) || 0,
            stock: parseInt(r.stock, 10) || 0,
            inventory_value: parseFloat(r.inventory_value) || 0,
            units_sold: parseInt(r.units_sold, 10) || 0,
            revenue_generated: parseFloat(r.revenue_generated) || 0
        }));
    },

    // Sales summary metrics
    async getSalesSummary() {
        const [salesStats] = await db.query(`
            SELECT 
                COALESCE(SUM(o.total_amount), 0) as total_revenue,
                COUNT(DISTINCT o.id) as total_orders,
                COALESCE(AVG(o.total_amount), 0) as average_order_value
            FROM orders o
            WHERE o.status IN ('paid', 'shipped', 'delivered')
        `);

        const [unitsStats] = await db.query(`
            SELECT COALESCE(SUM(oi.quantity), 0) as total_units_sold
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status IN ('paid', 'shipped', 'delivered')
        `);

        return {
            total_revenue: parseFloat(salesStats[0].total_revenue) || 0,
            total_orders: parseInt(salesStats[0].total_orders, 10) || 0,
            average_order_value: parseFloat(salesStats[0].average_order_value) || 0,
            total_units_sold: parseInt(unitsStats[0].total_units_sold, 10) || 0
        };
    },

    // Top selling products
    async getTopSellingProducts(limit = 5) {
        const [rows] = await db.query(`
            SELECT 
                p.id, 
                p.name, 
                p.image_url, 
                p.price,
                p.stock,
                c.name as category_name,
                SUM(oi.quantity) as units_sold,
                SUM(oi.quantity * oi.price) as revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE o.status IN ('paid', 'shipped', 'delivered')
            GROUP BY p.id, c.name
            ORDER BY units_sold DESC, revenue DESC
            LIMIT ?
        `, [parseInt(limit, 10)]);

        return rows.map(r => ({
            ...r,
            price: parseFloat(r.price) || 0,
            stock: parseInt(r.stock, 10) || 0,
            units_sold: parseInt(r.units_sold, 10) || 0,
            revenue: parseFloat(r.revenue) || 0
        }));
    },

    // Daily sales trend for the last 14 days
    async getDailySalesTrend(days = 14) {
        const [rows] = await db.query(`
            SELECT 
                DATE(created_at) as date,
                DATE_FORMAT(created_at, '%b %d') as formatted_date,
                COALESCE(SUM(total_amount), 0) as revenue,
                COUNT(*) as orders_count
            FROM orders
            WHERE status IN ('paid', 'shipped', 'delivered')
              AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%b %d')
            ORDER BY date ASC
        `, [parseInt(days, 10)]);

        return rows.map(r => ({
            date: r.date,
            formatted_date: r.formatted_date,
            revenue: parseFloat(r.revenue) || 0,
            orders_count: parseInt(r.orders_count, 10) || 0
        }));
    }
};

module.exports = Inventory;
