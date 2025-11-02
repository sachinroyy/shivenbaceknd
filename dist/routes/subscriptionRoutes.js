"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/subscriptionRoutes.ts
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const subscriptionController_1 = require("../controllers/subscriptionController");
const router = express_1.default.Router();
// Public routes
router.get('/plans', subscriptionController_1.getPlans);
// Protected routes
router.use(auth_middleware_1.default);
router.post('/subscribe', subscriptionController_1.createSubscription);
router.post('/verify', subscriptionController_1.verifySubscription);
exports.default = router;
