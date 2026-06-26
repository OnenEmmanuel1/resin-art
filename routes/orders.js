const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { isLoggedIn } = require('../middlewares/auth');

// GET Order history
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const orders = await Order.getByUser(req.session.user.id);
        res.render('orders', { title: 'My Orders', orders });
    } catch (error) {
        console.error(error);
        req.session.error = 'Error loading orders.';
        res.redirect('/');
    }
});

// GET Order details
router.get('/:id', isLoggedIn, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || order.user_id !== req.session.user.id) {
            req.session.error = 'Order not found.';
            return res.redirect('/orders');
        }
        const items = await Order.getItems(order.id);
        const payment = await Payment.getByOrder(order.id);

        res.render('order-details', { title: `Order #${order.id}`, order, items, payment });
    } catch (error) {
        console.error(error);
        req.session.error = 'Error loading order.';
        res.redirect('/orders');
    }
});

// POST Place order
router.post('/place', isLoggedIn, async (req, res) => {
    try {
        const { shipping_address, payment_reference } = req.body;
        const userId = req.session.user.id;

        const cartItems = await Cart.getByUser(userId);
        if (cartItems.length === 0) {
            req.session.error = 'Your cart is empty.';
            return res.redirect('/cart');
        }

        const cartTotal = await Cart.getTotal(userId);
        const tax = cartTotal * 0.075;
        const shipping = cartTotal > 50000 ? 0 : 2500;
        const grandTotal = cartTotal + tax + shipping;

        // Create order
        const orderId = await Order.create({
            user_id: userId,
            total_amount: grandTotal,
            shipping_address
        });

        // Add order items and update stock
        for (const item of cartItems) {
            await Order.addItem({
                order_id: orderId,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            });
            await Product.updateStock(item.product_id, item.quantity);
        }

        // Create payment record
        await Payment.create({
            order_id: orderId,
            user_id: userId,
            amount: grandTotal,
            reference: payment_reference || `REF-${Date.now()}`
        });

        // Update payment and order status
        if (payment_reference) {
            await Payment.updateStatus(payment_reference, 'success');
            await Order.updateStatus(orderId, 'paid');
        }

        // Clear cart
        await Cart.clear(userId);
        req.session.cartCount = 0;

        // Notification
        await Notification.create({
            user_id: userId,
            message: `Your order #${orderId} has been placed successfully!`
        });

        req.session.success = 'Order placed successfully!';
        res.redirect(`/orders/${orderId}`);
    } catch (error) {
        console.error(error);
        req.session.error = 'Error placing order. Please try again.';
        res.redirect('/cart/checkout');
    }
});

// POST Paystack Webhook
const crypto = require('crypto');
router.post('/webhook', async (req, res) => {
    try {
        const secret = process.env.PAYSTACK_SECRET_KEY || 'pk_test_xxxxx';
        const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
        
        if (hash == req.headers['x-paystack-signature']) {
            const event = req.body;
            
            if (event.event === 'charge.success') {
                const reference = event.data.reference;
                
                // Retrieve payment from db
                const [payments] = await require('../config/db').query('SELECT * FROM payments WHERE reference = ?', [reference]);
                
                if (payments.length > 0) {
                    const payment = payments[0];
                    await Payment.updateStatus(reference, 'success');
                    await Order.updateStatus(payment.order_id, 'paid');
                    
                    // Notify user via Socket.IO if configured
                    const io = req.app.get('io');
                    if (io) {
                        io.emit('new_notification', { message: `Payment for Order #${payment.order_id} was successful!` });
                    }
                }
            }
        }
        res.status(200).send('Webhook Received');
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Webhook Error');
    }
});

module.exports = router;
