// backend/src/controllers/subscriptionController.ts
import { Request, Response } from 'express';
import Subscription from '../models/subscription';
import { createOrder, verifyPayment } from '../utils/razorpay';

export const getPlans = async (req: Request, res: Response) => {
  try {
    // In a real app, you might fetch this from a database
    const plans = [
      {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Perfect for individuals getting started',
        price: 299,
        interval: 'month',
        features: [
          'Access to basic features',
          'Email support',
          'Basic analytics',
          '1 GB storage',
          'Up to 10 projects'
        ]
      },
      {
        id: 'pro',
        name: 'Pro Plan',
        description: 'For professionals and small teams',
        price: 799,
        interval: 'month',
        features: [
          'Everything in Basic',
          'Priority support',
          'Advanced analytics',
          '10 GB storage',
          'Unlimited projects',
          'Team collaboration',
          'API access'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        price: 2499,
        interval: 'month',
        features: [
          'Everything in Pro',
          '24/7 dedicated support',
          'Custom integrations',
          'Unlimited storage',
          'SAML SSO',
          'Dedicated account manager',
          'Custom SLAs'
        ]
      }
    ];

    res.status(200).json({ success: true, plans });
  } catch (error) {
    console.error('Error getting plans:', error);
    res.status(500).json({ success: false, message: 'Error fetching plans' });
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { planId, interval } = req.body;
    const userId = (req as any).user._id;

    // In a real app, you would fetch the plan details from your database
    const plans: { [key: string]: { amount: number; currency: string } } = {
      basic: { amount: 29900, currency: 'INR' },
      pro: { amount: 79900, currency: 'INR' },
      enterprise: { amount: 249900, currency: 'INR' }
    };

    const plan = plans[planId];
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid plan ID' });
    }

    // Create a new subscription record
    const subscription = new Subscription({
      user: userId,
      plan: planId,
      amount: plan.amount / 100, // Convert back to rupees
      currency: plan.currency,
      interval: interval || 'month',
      status: 'inactive',
      paymentMethod: 'razorpay',
    });

    await subscription.save();

    // Create Razorpay order
    const order = await createOrder(plan.amount, plan.currency);

    res.status(200).json({
      success: true,
      order,
      subscriptionId: subscription._id,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ success: false, message: 'Error creating subscription' });
  }
};

export const verifySubscription = async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, signature, subscriptionId } = req.body;
    const userId = (req as any).user._id;

    // Verify the payment
    const isVerified = verifyPayment(orderId, paymentId, signature);
    if (!isVerified) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update subscription status
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

    subscription.status = 'active';
    subscription.isActive = true;
    subscription.startDate = now;
    subscription.endDate = endDate;
    subscription.lastPaymentDate = now;
    subscription.nextBillingDate = endDate;
    subscription.razorpaySubscriptionId = `sub_${Date.now()}`;
    subscription.razorpayPlanId = `plan_${subscription.plan}`;

    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully',
      subscription,
    });
  } catch (error) {
    console.error('Error verifying subscription:', error);
    res.status(500).json({ success: false, message: 'Error verifying subscription' });
  }
};