"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const router = (0, express_1.Router)();
// Google OAuth routes
router.get('/google', (req, res, next) => {
    // Store the redirect URL in session if provided
    if (req.query.redirect) {
        req.session.redirectAfterLogin = req.query.redirect;
    }
    next();
}, passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    accessType: 'offline',
    session: true
}));
// Google OAuth callback
router.get('/google/callback', (req, res, next) => {
    console.log('🔍 Google OAuth callback received');
    next();
}, passport_1.default.authenticate('google', {
    failureRedirect: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/login?error=auth_failed`
        : 'http://localhost:5173/login?error=auth_failed',
    failureMessage: true,
    session: true
}), (req, res) => {
    try {
        // Successful authentication, redirect to the frontend
        const redirectTo = req.session.redirectAfterLogin || '/';
        delete req.session.redirectAfterLogin;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const redirectUrl = new URL(frontendUrl);
        redirectUrl.pathname = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`;
        redirectUrl.searchParams.set('login', 'success');
        console.log('🔗 Redirecting to:', redirectUrl.toString());
        res.redirect(redirectUrl.toString());
    }
    catch (error) {
        console.error('Error in Google callback:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?error=server_error`);
    }
});
// Logout route
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
    });
});
// Test endpoint to verify session
router.get('/test-session', (req, res) => {
    // Initialize or increment view count
    if (!req.session.views) {
        req.session.views = 1;
    }
    else {
        req.session.views++;
    }
    // Get session info
    const sessionInfo = {
        sessionId: req.sessionID,
        views: req.session.views,
        user: req.user || 'No user in session',
        session: {
            cookie: req.session.cookie,
            passport: req.session.passport
        },
        headers: {
            'user-agent': req.headers['user-agent'],
            'x-forwarded-for': req.headers['x-forwarded-for'],
            'x-real-ip': req.headers['x-real-ip']
        }
    };
    console.log('Session test:', sessionInfo);
    res.json(sessionInfo);
});
// Get current user with detailed logging
router.get('/me', (req, res) => {
    console.log('🔍 /me endpoint hit', {
        sessionId: req.sessionID,
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        cookies: req.cookies,
        headers: {
            cookie: req.headers.cookie,
            'user-agent': req.headers['user-agent']
        }
    });
    if (!req.isAuthenticated() || !req.user) {
        console.log('❌ Not authenticated');
        return res.status(401).json({
            success: false,
            message: 'Not authenticated',
            isAuthenticated: false,
            sessionId: req.sessionID
        });
    }
    try {
        const user = req.user;
        console.log('✅ User found:', {
            id: user._id || user.id,
            email: user.email,
            role: user.role
        });
        res.json({
            success: true,
            data: {
                id: user._id || user.id,
                email: user.email,
                name: user.name,
                role: user.role || 'user',
                provider: user.provider,
                picture: user.picture,
                given_name: user.given_name,
                family_name: user.family_name,
                sessionId: req.sessionID
            }
        });
    }
    catch (error) {
        console.error('❌ Error in /me endpoint:', {
            error: error.message,
            stack: error.stack,
            sessionId: req.sessionID,
            cookies: req.cookies
        });
        // More detailed error response
        const errorResponse = {
            success: false,
            message: 'Internal server error',
            isAuthenticated: false,
            sessionId: req.sessionID,
            timestamp: new Date().toISOString()
        };
        // Add more details in development
        if (process.env.NODE_ENV !== 'production') {
            errorResponse.error = error.message;
            errorResponse.stack = error.stack;
        }
        res.status(500).json(errorResponse);
    }
});
// Debug endpoint to check session
router.get('/debug-session', (req, res) => {
    const sessionInfo = {
        sessionId: req.sessionID,
        session: req.session,
        cookies: req.cookies,
        headers: {
            cookie: req.headers.cookie,
            'user-agent': req.headers['user-agent']
        },
        isAuthenticated: req.isAuthenticated(),
        user: req.user || null
    };
    console.log('🔍 Debug session:', JSON.stringify(sessionInfo, null, 2));
    res.json(sessionInfo);
});
exports.default = router;
