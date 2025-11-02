"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables first
const envPath = path_1.default.resolve(process.cwd(), 'local.env');
console.log('Current working directory:', process.cwd());
console.log('Loading environment variables from:', envPath);
// Verify .env file exists and load it
if (fs_1.default.existsSync(envPath)) {
    dotenv_1.default.config({ path: envPath });
    console.log('✅ Environment variables loaded successfully');
    console.log('MONGO_URI:', process.env.MONGO_URI ? '*** Loaded ***' : 'Not found!');
}
else {
    console.error('❌ Error: local.env file not found at:', envPath);
    console.log('Current directory contents:', fs_1.default.readdirSync(process.cwd()));
    process.exit(1);
}
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const db_1 = __importDefault(require("./config/db"));
require("./config/passport.config"); // Import Passport configuration
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const payment_1 = __importDefault(require("./routes/payment"));
// Initialize Express
const app = (0, express_1.default)();
// Connect to MongoDB
(0, db_1.default)().catch(err => {
    console.error('❌ Failed to connect to MongoDB');
    console.error('Please check your MongoDB connection string in local.env');
    console.error('Make sure your MongoDB Atlas user has the correct permissions and your IP is whitelisted');
    process.exit(1);
});
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5001',
    'http://127.0.0.1:5001',
    'https://shivenenterprises.com',
    'https://www.shivenenterprises.com',
    process.env.FRONTEND_URL
].filter(Boolean);
console.log('🌐 Allowed CORS origins:', allowedOrigins);
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // Allow all subdomains of shivenenterprises.com
        if (origin.endsWith('shivenenterprises.com')) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.log('🚫 CORS blocked for origin:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-Auth-Token'
    ],
    exposedHeaders: [
        'Content-Length',
        'Content-Type',
        'Authorization',
        'X-Requested-With'
    ],
    maxAge: 86400 // 24 hours
};
app.use((0, cors_1.default)(corsOptions));
// Handle preflight requests
app.options('*', (0, cors_1.default)(corsOptions));
// Session configuration
const sessionConfig = {
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
    store: undefined,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === 'production' ? '.shivenenterprises.com' : 'localhost',
        path: '/',
    }
};
// In development, use MemoryStore for simplicity
if (process.env.NODE_ENV !== 'production') {
    const MemoryStore = require('memorystore')(express_session_1.default);
    sessionConfig.store = new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
    });
    // Log session store events
    if (sessionConfig.store) {
        sessionConfig.store.on('create', (sid) => {
            console.log(`🆕 Session created: ${sid}`);
        });
        sessionConfig.store.on('destroy', (sid) => {
            console.log(`🗑️  Session destroyed: ${sid}`);
        });
    }
}
app.use((0, express_session_1.default)(sessionConfig));
// Trust first proxy (needed for secure cookies in production)
app.set('trust proxy', 1);
// Add request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Session ID:', req.sessionID);
    console.log('Cookies:', req.cookies);
    next();
});
// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    next();
});
// Initialize Passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Make uploads folder static
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../public/uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// API Routes - Auth routes must come before other routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/blogs', blog_routes_1.default);
app.use('/api/contact', contact_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use("/api/payments", payment_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
    });
});
// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
