"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = void 0;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const user = req.user;
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Convert _id to string if it's an ObjectId
        const userId = user._id ? (user._id.toString ? user._id.toString() : user._id) : null;
        // Return user data (exclude sensitive information)
        const userData = Object.assign(Object.assign(Object.assign({ id: userId, name: user.name || '', email: user.email, role: user.role || 'user', provider: user.provider || 'local' }, (user.picture && { picture: user.picture })), (user.createdAt && { createdAt: user.createdAt })), (user.updatedAt && { updatedAt: user.updatedAt }));
        return res.status(200).json({
            success: true,
            data: userData
        });
    }
    catch (error) {
        console.error('Error in getCurrentUser:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.getCurrentUser = getCurrentUser;
exports.default = { getCurrentUser: exports.getCurrentUser };
