const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedData() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'resin_art_system'
        });

        console.log('Connected. Seeding data...');

        // Check if categories already exist
        const [existingCats] = await db.query('SELECT COUNT(*) as count FROM categories');
        if (existingCats[0].count > 0) {
            console.log('Data already seeded. Skipping.');
            await db.end();
            return;
        }

        // Seed Categories
        const categories = [
            ['Resin Trays', 'Elegant handcrafted resin serving trays and decorative trays'],
            ['Resin Jewelry', 'Beautiful resin earrings, pendants, bracelets and rings'],
            ['Wall Decor', 'Stunning resin wall art, clocks and decorative panels'],
            ['Keyholders', 'Functional and decorative resin key holders and organizers'],
            ['Custom Gifts', 'Personalized resin gifts for all occasions'],
            ['Coasters', 'Stylish resin coasters and coaster sets']
        ];

        for (const [name, description] of categories) {
            await db.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
        }
        console.log('Categories seeded.');

        // Seed Products
        const products = [
            ['Ocean Blue Resin Tray', 'A stunning ocean-inspired resin tray with deep blue waves and gold leaf accents. Perfect for serving or as a decorative centerpiece.', 15000, 25, 1, 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Marble Effect Serving Tray', 'Luxurious marble-effect resin tray with white and grey swirls. Handles for easy carrying.', 18500, 15, 1, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Rose Gold Geode Tray', 'Geode-inspired tray with pink, rose gold, and crystal accents.', 22000, 10, 1, 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Flower Resin Pendant', 'Real dried flowers preserved in crystal-clear resin pendant with silver chain.', 5500, 50, 2, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Galaxy Resin Earrings', 'Swirling galaxy-themed resin earrings with holographic glitter.', 4000, 40, 2, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Botanical Resin Ring', 'Delicate ring with real tiny flowers encased in resin.', 3500, 35, 2, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Abstract Ocean Wall Art', 'Large resin wall art piece depicting abstract ocean waves in blues and whites.', 45000, 5, 3, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Resin Geode Wall Clock', 'Functional wall clock with stunning geode resin design.', 35000, 8, 3, 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Crystal Resin Keyholder', 'Wall-mounted key holder with crystal-clear resin and embedded dried flowers.', 8000, 30, 4, 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Wooden Resin Keyholder', 'Live-edge wood and blue resin combination key holder.', 12000, 20, 4, 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Custom Name Resin Art', 'Personalized resin art with your name or message in beautiful calligraphy.', 25000, 15, 5, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Couple Portrait Resin Frame', 'Custom couple portrait preserved in elegant resin frame.', 30000, 10, 5, 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Ocean Wave Coaster Set', 'Set of 4 ocean-inspired resin coasters with cork backing.', 12000, 25, 6, 'https://images.unsplash.com/photo-1558171813-4c088753af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Agate Slice Coasters', 'Natural agate-inspired resin coasters in various colors.', 10000, 30, 6, 'https://images.unsplash.com/photo-1595526051245-4506e0005bd0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Galaxy Purple Tray', 'Deep purple galaxy-themed resin tray with silver star accents.', 16500, 18, 1, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            ['Sunset Resin Wall Panel', 'Breathtaking sunset colors captured in a large resin wall panel.', 55000, 3, 3, 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']
        ];

        for (const [name, description, price, stock, category_id, image_url] of products) {
            await db.query(
                'INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
                [name, description, price, stock, category_id, image_url]
            );
        }
        console.log('Products seeded (' + products.length + ' items).');

        await db.end();
        console.log('Seed complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData();


// password123