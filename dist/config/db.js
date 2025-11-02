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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('\n🔍 Attempting to connect to MongoDB...');
        if (!process.env.MONGO_URI) {
            throw new Error('❌ MongoDB connection string is not defined in environment variables');
        }
        // Log connection details (with password hidden for security)
        const mongoUri = new URL(process.env.MONGO_URI);
        const safeUri = process.env.MONGO_URI.replace(/:[^:]*@/, ':***@');
        console.log('🌐 MongoDB Connection String:', safeUri);
        console.log(`🌐 Connecting to: ${mongoUri.protocol}//${mongoUri.hostname}${mongoUri.pathname.split('?')[0]}`);
        // Set up event listeners for connection status
        mongoose_1.default.connection.on('connecting', () => console.log('🔄 Connecting to MongoDB...'));
        mongoose_1.default.connection.on('connected', () => console.log('✅ Successfully connected to MongoDB'));
        mongoose_1.default.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err));
        const conn = yield mongoose_1.default.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
        });
        console.log(`✅ MongoDB Connected Successfully!`);
        console.log(`   Host: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.name}`);
    }
    catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        console.error('Full error details:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
});
exports.default = connectDB;
