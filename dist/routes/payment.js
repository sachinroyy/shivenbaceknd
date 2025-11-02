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
const express_1 = __importDefault(require("express"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const Payment_1 = __importDefault(require("../models/Payment"));
const User_1 = __importDefault(require("../models/User"));
const subscription_1 = __importDefault(require("../models/subscription"));
const router = express_1.default.Router();
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// ✅ Create order API
router.post("/create-order", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, currency, receipt } = req.body;
        const options = {
            amount: amount * 100,
            currency: currency || "INR",
            receipt: receipt || "receipt#1",
        };
        const order = yield razorpay.orders.create(options);
        res.json({ success: true, order });
    }
    catch (err) {
        console.error("Error creating Razorpay order:", err);
        res.status(500).json({ success: false, error: "Failed to create order" });
    }
}));
// Plan configuration - map plan IDs to their respective amounts (in paise)
const PLANS = {
    'pro': 29900,
    'premium': 59900,
    'enterprise': 99900 // ₹999.00
};
// ✅ Verify payment signature and update database
router.post("/verify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, email, phone, amount, currency = 'INR' } = req.body;
        // Validate required fields
        const missingFields = [];
        if (!razorpay_order_id)
            missingFields.push('razorpay_order_id');
        if (!razorpay_payment_id)
            missingFields.push('razorpay_payment_id');
        if (!razorpay_signature)
            missingFields.push('razorpay_signature');
        if (!planId)
            missingFields.push('planId');
        if (!email)
            missingFields.push('email');
        if (missingFields.length > 0) {
            yield session.abortTransaction();
            session.endSession();
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`,
                missingFields
            });
        }
        // Determine amount from plan if not provided
        let paymentAmount = Number(amount);
        if (!paymentAmount || isNaN(paymentAmount)) {
            if (PLANS[planId]) {
                paymentAmount = PLANS[planId];
            }
            else {
                yield session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    error: 'Amount is required for this plan',
                    validPlans: Object.keys(PLANS)
                });
            }
        }
        // Validate amount is a positive number
        if (paymentAmount <= 0) {
            yield session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                error: 'Amount must be greater than 0'
            });
        }
        // Verify signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");
        if (razorpay_signature !== expectedSign) {
            yield session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                error: "Invalid payment signature"
            });
        }
        // Check if payment already exists
        const existingPayment = yield Payment_1.default.findOne({
            $or: [
                { orderId: razorpay_order_id },
                { paymentId: razorpay_payment_id }
            ]
        }).session(session);
        if (existingPayment) {
            yield session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                error: "Payment already processed"
            });
        }
        // Create payment record
        const payment = new Payment_1.default({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            amount: paymentAmount,
            currency,
            status: 'completed',
            planId,
            email,
            phone: phone || '',
            paymentDate: new Date()
        });
        // Find or create user
        let user = yield User_1.default.findOne({ email }).session(session);
        if (!user) {
            user = new User_1.default({
                email,
                name: email.split('@')[0],
                authId: `razorpay_${razorpay_payment_id}`,
                provider: 'razorpay',
                role: 'user',
                phone: phone || ''
            });
            yield user.save({ session });
        }
        // Create or update subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription
        const subscription = yield subscription_1.default.findOneAndUpdate({ user: user._id }, {
            user: user._id,
            plan: planId,
            amount: payment.amount,
            currency: payment.currency,
            status: 'active',
            isActive: true,
            startDate,
            endDate,
            paymentMethod: 'razorpay',
            lastPaymentDate: new Date(),
            nextBillingDate: endDate,
            razorpaySubscriptionId: `sub_${razorpay_payment_id}`,
            razorpayPlanId: planId,
            razorpayCustomerId: user._id.toString()
        }, {
            upsert: true,
            new: true,
            session
        });
        // Save payment with subscription reference
        payment.subscription = subscription._id;
        yield payment.save({ session });
        yield session.commitTransaction();
        session.endSession();
        // Log successful payment
        console.log('✅ Payment and subscription processed successfully', {
            paymentId: payment._id,
            subscriptionId: subscription._id,
            userId: user._id,
            amount: payment.amount,
            currency: payment.currency
        });
        res.json({
            success: true,
            message: "Payment verified and subscription activated successfully",
            data: {
                paymentId: payment._id,
                subscriptionId: subscription._id,
                planId: subscription.plan,
                status: subscription.status,
                endDate: subscription.endDate
            }
        });
    }
    catch (err) {
        yield session.abortTransaction();
        session.endSession();
        console.error('❌ Payment verification failed:', err);
        res.status(500).json({
            success: false,
            error: "Payment verification failed",
            details: process.env.NODE_ENV === 'development'
                ? err instanceof Error
                    ? err.message
                    : String(err)
                : undefined
        });
    }
}));
// Get all payments (Admin only)
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Build search query
        const searchQuery = {};
        if (search) {
            searchQuery.$or = [
                { email: { $regex: search, $options: 'i' } },
                { orderId: { $regex: search, $options: 'i' } },
                { paymentId: { $regex: search, $options: 'i' } },
                { 'planId': { $regex: search, $options: 'i' } }
            ];
        }
        // Get paginated payments
        const [payments, total] = yield Promise.all([
            Payment_1.default.find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Payment_1.default.countDocuments(searchQuery)
        ]);
        res.status(200).json({
            success: true,
            data: payments,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                limit: Number(limit)
            }
        });
    }
    catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payment history'
        });
    }
}));
exports.default = router;
