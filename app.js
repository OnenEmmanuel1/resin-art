const express = require('express');
const path = require('path');
const http = require('http');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const { Server } = require('socket.io');
require('dotenv').config();
const passport = require('./config/passport');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Middleware
app.use('/orders/webhook', express.raw({ type: 'application/json' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// EJS & Layouts Setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

// Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global Variables Middleware
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.error = req.session.error || null;
    res.locals.success = req.session.success || null;
    res.locals.cartCount = req.session.cartCount || 0;
    delete req.session.error;
    delete req.session.success;
    next();
});

// Make io accessible to routes
app.set('io', io);

// Routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/shop', shopRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/profile', profileRoutes);

const notificationRoutes = require('./routes/notifications');
app.use('/notifications', notificationRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { title: 'Server Error' });
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
