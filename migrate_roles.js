const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'resin_art_system'
        });

        console.log('Connected to database. Modifying users table...');

        await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'admin', 'sales_rep') DEFAULT 'customer'");

        console.log('Successfully updated users table role ENUM.');

        await db.end();
        process.exit(0);
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

migrate();
