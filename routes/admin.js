const express = require('express');
const router = express.Router();
const { isAdmin, isStaff } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');
const Review = require('../models/Review');

// Admin Dashboard
router.get('/dashboard', isStaff, async (req, res) => {
    try {
        const usersCount = await User.count();
        const ordersCount = await Order.count();
        const pendingOrders = await Order.countByStatus('pending');
        const revenue = await Order.totalRevenue();
        const productsCount = await Product.count();
        const monthlySales = await Order.monthlySales();
        const recentOrders = await Order.getAll();

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            layout: 'layouts/admin',
            usersCount,
            ordersCount,
            pendingOrders,
            revenue,
            productsCount,
            monthlySales,
            recentOrders: recentOrders.slice(0, 10)
        });
    } catch (error) {
        console.error(error);
        req.session.error = 'Error loading dashboard.';
        res.redirect('/');
    }
});

// ===================== PRODUCTS =====================

// GET All Products
router.get('/products', isStaff, async (req, res) => {
    try {
        const products = await Product.getAll({ limit: 100 });
        const categories = await Category.getAll();
        res.render('admin/products', {
            title: 'Manage Products',
            layout: 'layouts/admin',
            products,
            categories
        });
    } catch (error) {
        console.error(error);
        req.session.error = 'Error loading products.';
        res.redirect('/admin/dashboard');
    }
});

// GET Add Product Form
router.get('/products/add', isStaff, async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.render('admin/product-form', {
            title: 'Add Product',
            layout: 'layouts/admin',
            product: null,
            categories
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/products');
    }
});

// POST Add Product
router.post('/products/add', isStaff, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'ar_model', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, description, price, stock, category_id, status } = req.body;
        const image_url = req.files['image'] ? '/uploads/' + req.files['image'][0].filename : null;

        const productId = await Product.create({
            name, description, price, stock, category_id, image_url, status
        });

        if (req.files['ar_model']) {
            const model_url = '/uploads/' + req.files['ar_model'][0].filename;
            await Product.setARModel(productId, model_url);
        }

        req.session.success = 'Product added successfully!';
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error adding product.';
        res.redirect('/admin/products/add');
    }
});

// GET Edit Product Form
router.get('/products/edit/:id', isStaff, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const categories = await Category.getAll();
        if (!product) {
            req.session.error = 'Product not found.';
            return res.redirect('/admin/products');
        }
        const arModel = await Product.getARModel(product.id);
        res.render('admin/product-form', {
            title: 'Edit Product',
            layout: 'layouts/admin',
            product,
            categories,
            arModel
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/products');
    }
});

// POST Edit Product
router.post('/products/edit/:id', isStaff, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'ar_model', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, description, price, stock, category_id, status } = req.body;
        const image_url = req.files['image'] ? '/uploads/' + req.files['image'][0].filename : null;

        await Product.update(req.params.id, {
            name, description, price, stock, category_id, image_url, status
        });

        if (req.files['ar_model']) {
            const model_url = '/uploads/' + req.files['ar_model'][0].filename;
            await Product.setARModel(req.params.id, model_url);
        }

        req.session.success = 'Product updated successfully!';
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error updating product.';
        res.redirect('/admin/products');
    }
});

// POST Delete Product
router.post('/products/delete/:id', isStaff, async (req, res) => {
    try {
        await Product.delete(req.params.id);
        req.session.success = 'Product deleted.';
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error deleting product.';
        res.redirect('/admin/products');
    }
});

// ===================== CATEGORIES =====================

router.get('/categories', isStaff, async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.render('admin/categories', {
            title: 'Manage Categories',
            layout: 'layouts/admin',
            categories
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/dashboard');
    }
});

router.post('/categories/add', isStaff, async (req, res) => {
    try {
        const { name, description } = req.body;
        await Category.create({ name, description });
        req.session.success = 'Category added!';
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error adding category.';
        res.redirect('/admin/categories');
    }
});

router.post('/categories/edit/:id', isStaff, async (req, res) => {
    try {
        const { name, description } = req.body;
        await Category.update(req.params.id, { name, description });
        req.session.success = 'Category updated!';
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error updating category.';
        res.redirect('/admin/categories');
    }
});

router.post('/categories/delete/:id', isStaff, async (req, res) => {
    try {
        await Category.delete(req.params.id);
        req.session.success = 'Category deleted.';
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error deleting category.';
        res.redirect('/admin/categories');
    }
});

// ===================== ORDERS =====================

router.get('/orders', isStaff, async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.render('admin/orders', {
            title: 'Manage Orders',
            layout: 'layouts/admin',
            orders
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/dashboard');
    }
});

router.get('/orders/:id', isStaff, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        const items = await Order.getItems(order.id);
        res.render('admin/order-detail', {
            title: `Order #${order.id}`,
            layout: 'layouts/admin',
            order,
            items
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/orders');
    }
});

router.post('/orders/status/:id', isStaff, async (req, res) => {
    try {
        const { status, tracking_number } = req.body;
        await Order.updateStatus(req.params.id, status);
        if (tracking_number) {
            await Order.updateTracking(req.params.id, tracking_number);
        }
        req.session.success = 'Order status updated!';
        res.redirect(`/admin/orders/${req.params.id}`);
    } catch (error) {
        console.error(error);
        req.session.error = 'Error updating order.';
        res.redirect('/admin/orders');
    }
});

// ===================== USERS =====================

router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.getAll();
        res.render('admin/users', {
            title: 'Manage Users',
            layout: 'layouts/admin',
            users
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/dashboard');
    }
});

router.post('/users/delete/:id', isAdmin, async (req, res) => {
    try {
        await User.delete(req.params.id);
        req.session.success = 'User deleted.';
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error deleting user.';
        res.redirect('/admin/users');
    }
});

// ===================== REVIEWS =====================

router.get('/reviews', isStaff, async (req, res) => {
    try {
        const reviews = await Review.getAll();
        res.render('admin/reviews', {
            title: 'Manage Reviews',
            layout: 'layouts/admin',
            reviews
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/dashboard');
    }
});

router.post('/reviews/approve/:id', isStaff, async (req, res) => {
    try {
        await Review.updateStatus(req.params.id, 'approved');
        req.session.success = 'Review approved.';
        res.redirect('/admin/reviews');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/reviews');
    }
});

router.post('/reviews/reject/:id', isStaff, async (req, res) => {
    try {
        await Review.updateStatus(req.params.id, 'rejected');
        req.session.success = 'Review rejected.';
        res.redirect('/admin/reviews');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/reviews');
    }
});

router.post('/reviews/delete/:id', isStaff, async (req, res) => {
    try {
        await Review.delete(req.params.id);
        req.session.success = 'Review deleted.';
        res.redirect('/admin/reviews');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/reviews');
    }
});

// ===================== SALES REPS =====================

router.get('/sales-reps', isAdmin, async (req, res) => {
    try {
        const [salesReps] = await require('../config/db').query("SELECT * FROM users WHERE role = 'sales_rep' ORDER BY created_at DESC");
        res.render('admin/sales-reps', {
            title: 'Manage Sales Reps',
            layout: 'layouts/admin',
            salesReps
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/dashboard');
    }
});

const bcrypt = require('bcrypt');

router.post('/sales-reps/add', isAdmin, async (req, res) => {
    try {
        const { first_name, last_name, email, phone, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await require('../config/db').query(
            "INSERT INTO users (first_name, last_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, 'sales_rep')",
            [first_name, last_name, email, hashedPassword, phone]
        );
        req.session.success = 'Sales Rep added successfully.';
        res.redirect('/admin/sales-reps');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error adding sales rep. Email may already exist.';
        res.redirect('/admin/sales-reps');
    }
});

router.post('/sales-reps/delete/:id', isAdmin, async (req, res) => {
    try {
        await require('../config/db').query("DELETE FROM users WHERE id = ? AND role = 'sales_rep'", [req.params.id]);
        req.session.success = 'Sales Rep deleted.';
        res.redirect('/admin/sales-reps');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error deleting sales rep.';
        res.redirect('/admin/sales-reps');
    }
});

module.exports = router;
