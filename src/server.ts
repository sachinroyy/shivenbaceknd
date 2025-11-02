import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables first
const envPath = path.resolve(process.cwd(), 'local.env');
console.log('Current working directory:', process.cwd());
console.log('Loading environment variables from:', envPath);

// Verify .env file exists and load it
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Environment variables loaded successfully');
  console.log('MONGO_URI:', process.env.MONGO_URI ? '*** Loaded ***' : 'Not found!');
} else {
  console.error('❌ Error: local.env file not found at:', envPath);
  console.log('Current directory contents:', fs.readdirSync(process.cwd()));
  process.exit(1);
}

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import connectDB from './config/db';
import './config/passport.config'; // Import Passport configuration
import blogRoutes from './routes/blog.routes';
import contactRoutes from './routes/contact.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { IUser } from './models/User';
import paymentRoutes from "./routes/payment";


// Extend Express types
declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      user?: User;
    }
  }
}

// Initialize Express
const app: Application = express();

// Connect to MongoDB
connectDB().catch(err => {
  console.error('❌ Failed to connect to MongoDB');
  console.error('Please check your MongoDB connection string in local.env');
  console.error('Make sure your MongoDB Atlas user has the correct permissions and your IP is whitelisted');
  process.exit(1);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
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

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Session configuration
const sessionConfig: session.SessionOptions = {
  name: 'connect.sid',
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset the cookie max-age on every request
  proxy: true, // Trust the reverse proxy for HTTPS
  store: undefined as any, // Will be set below
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    domain: process.env.NODE_ENV === 'production' ? '.shivenenterprises.com' : 'localhost',
    path: '/',
  }
};

// In development, use MemoryStore for simplicity
if (process.env.NODE_ENV !== 'production') {
  const MemoryStore = require('memorystore')(session);
  sessionConfig.store = new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  });
  
  // Log session store events
  if (sessionConfig.store) {
    sessionConfig.store.on('create', (sid: string) => {
      console.log(`🆕 Session created: ${sid}`);
    });
    
    sessionConfig.store.on('destroy', (sid: string) => {
      console.log(`🗑️  Session destroyed: ${sid}`);
    });
  }
}

app.use(session(sessionConfig));

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
app.use(passport.initialize());
app.use(passport.session());

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// API Routes - Auth routes must come before other routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);
app.use("/api/payments", paymentRoutes);



// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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

export default app;
