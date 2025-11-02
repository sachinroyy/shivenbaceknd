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
const mongoose_1 = __importStar(require("mongoose"));
const PaymentSchema = new mongoose_1.Schema({
    orderId: {
        type: String,
        required: [true, 'Order ID is required'],
        unique: true
    },
    paymentId: {
        type: String,
        required: [true, 'Payment ID is required'],
        unique: true
    },
    signature: {
        type: String,
        required: [true, 'Signature is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [1, 'Amount must be at least 1'],
        set: function (val) { return Math.round(val * 100) / 100; }
    },
    currency: {
        type: String,
        default: 'INR',
        uppercase: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    planId: {
        type: String,
        required: [true, 'Plan ID is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        index: true
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        trim: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    subscription: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: false
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
exports.default = mongoose_1.default.model('Payment', PaymentSchema);
