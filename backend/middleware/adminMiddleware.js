// adminMiddleware.js
const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

module.exports = { adminMiddleware };
