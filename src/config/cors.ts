import { CorsOptions } from 'cors';

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5001',
  'http://127.0.0.1:5001',
  'https://shivenenterprises.com',
  'https://www.shivenenterprises.com',
  'http://31.97.206.200:5001',
  
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`✅ Allowed CORS for: ${origin}`);
      return callback(null, true);
    } else {
      console.log(`❌ CORS blocked: ${origin}. Allowed:`, allowedOrigins);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-HTTP-Method-Override',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Set-Cookie'
  ],
  maxAge: 600,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

export { corsOptions, allowedOrigins };