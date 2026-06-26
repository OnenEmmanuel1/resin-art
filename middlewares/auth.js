// Authentication Middleware

function isLoggedIn(req, res, next) {
    if (req.session.user) {
        return next();
    }
    req.session.error = 'Please log in to access this page.';
    res.redirect('/auth/login');
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.session.error = 'Access denied. Admin only.';
    res.redirect('/');
}

function isStaff(req, res, next) {
    if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'sales_rep')) {
        return next();
    }
    req.session.error = 'Access denied. Staff only.';
    res.redirect('/');
}

function isGuest(req, res, next) {
    if (!req.session.user) {
        return next();
    }
    res.redirect('/');
}

module.exports = { isLoggedIn, isAdmin, isStaff, isGuest };
