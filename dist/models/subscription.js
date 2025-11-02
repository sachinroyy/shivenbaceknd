"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/models/Subscription.ts
const mongoose_1 = __importStar(require("mongoose"));
const subscriptionSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    interval: { type: String, enum: ['month', 'year'], required: true },
    status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'expired'],
        default: 'inactive',
    },
    startDate: { type: Date },
    endDate: { type: Date },
    razorpaySubscriptionId: { type: String },
    razorpayPlanId: { type: String },
    razorpayCustomerId: { type: String },
    paymentMethod: { type: String, default: 'razorpay' },
    lastPaymentDate: { type: Date },
    nextBillingDate: { type: Date },
    isActive: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Subscription', subscriptionSchema);
