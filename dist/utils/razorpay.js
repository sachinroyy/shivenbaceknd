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
exports.verifyPayment = exports.createOrder = void 0;
// backend/src/utils/razorpay.ts
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const createOrder = (amount, currency = 'INR') => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const options = {
            amount: amount * 100,
            currency,
            receipt: `order_${Date.now()}`,
            payment_capture: 1,
        };
        const order = yield razorpay.orders.create(options);
        return order;
    }
    catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw error;
    }
});
exports.createOrder = createOrder;
const verifyPayment = (orderId, paymentId, signature) => {
    try {
        const generatedSignature = crypto_1.default
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(`${orderId}|${paymentId}`)
            .digest('hex');
        return generatedSignature === signature;
    }
    catch (error) {
        console.error('Error verifying payment:', error);
        return false;
    }
};
exports.verifyPayment = verifyPayment;
exports.default = razorpay;
