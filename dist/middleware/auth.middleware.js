"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.authMiddleware = void 0;
const authMiddleware = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    next();
};
exports.authMiddleware = authMiddleware;
const adminOnly = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const user = req.user;
    const isAdmin = user === null || user === void 0 ? void 0 : user.isAdmin;
    if (!isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};
exports.adminOnly = adminOnly;
exports.default = exports.authMiddleware;
