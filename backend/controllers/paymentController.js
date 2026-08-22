import stripe from '../config/stripe.js';
import Order from '../models/Order.js';

// @desc    Create Stripe Checkout Session for an existing Order
// @route   POST /api/payments/create-checkout-session
// @access  Private (Customer, Admin)
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400);
      throw new Error('Order ID is required');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Ownership check
    if (
      order.customer.toString() !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      res.status(403);
      throw new Error('Not authorized to pay for this order');
    }

    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'This order is already paid',
      });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Build Stripe Line Items from Order Items
    const lineItems = order.orderItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // In cents
      },
      quantity: item.qty,
    }));

    // Add Shipping if applicable
    if (order.shippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Standard Flat Shipping Fee',
          },
          unit_amount: Math.round(order.shippingPrice * 100),
        },
        quantity: 1,
      });
    }

    // Add Tax if applicable
    if (order.taxPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Estimated Sales Tax',
          },
          unit_amount: Math.round(order.taxPrice * 100),
        },
        quantity: 1,
      });
    }

    // Check if live/test Stripe Secret Key is provided or placeholder
    const isMockKey =
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY.includes('mock') ||
      process.env.STRIPE_SECRET_KEY.includes('placeholder');

    if (isMockKey) {
      // Return simulated session response for testing/dev environments
      const mockSessionId = `cs_test_mock_${Date.now()}`;
      order.stripeSessionId = mockSessionId;
      await order.save();

      return res.json({
        success: true,
        sessionId: mockSessionId,
        url: `${clientUrl}/order-success/${mockSessionId}?order_id=${order._id}`,
        isSimulated: true,
      });
    }

    // Create real Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: req.user.email,
      client_reference_id: order._id.toString(),
      metadata: {
        orderId: order._id.toString(),
        customerName: req.user.name,
      },
      success_url: `${clientUrl}/order-success/{CHECKOUT_SESSION_ID}?order_id=${order._id}`,
      cancel_url: `${clientUrl}/orders/${order._id}`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      isSimulated: false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Explicit Stripe Webhook Listener for asynchronous checkout fulfillment
// @route   POST /api/payments/webhook
// @access  Public (Secured via Stripe Signature)
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret && !endpointSecret.includes('placeholder')) {
      // req.body MUST be raw Buffer as provided by express.raw()
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // Fallback for dev / unconfigured secret
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (err) {
    console.error(`[Stripe Webhook Error] Verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle 'checkout.session.completed'
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.client_reference_id || session.metadata?.orderId;

    if (orderId) {
      try {
        const order = await Order.findById(orderId);
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentResult = {
            id: session.payment_intent || session.id,
            status: session.payment_status || 'paid',
            update_time: new Date().toISOString(),
            email_address: session.customer_details?.email || session.customer_email || '',
          };

          // Mark vendor payouts as active pending distribution
          order.vendorPayouts.forEach((payout) => {
            payout.payoutStatus = 'Pending';
          });

          await order.save();
          console.log(`[Stripe Webhook] Order ${orderId} successfully marked as PAID`);
        }
      } catch (err) {
        console.error(`[Stripe Webhook] Error updating order ${orderId}:`, err);
        return res.status(500).json({ error: 'Database update failed' });
      }
    }
  }

  res.status(200).json({ received: true });
};

// @desc    Simulate payment success (for development testing)
// @route   POST /api/payments/simulate-success
// @access  Private (Customer, Admin)
export const simulatePaymentSuccess = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: `sim_pi_${Date.now()}`,
      status: 'paid',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };

    order.vendorPayouts.forEach((payout) => {
      payout.payoutStatus = 'Pending';
    });

    await order.save();

    res.json({
      success: true,
      message: 'Payment simulation verified and order marked as paid',
      order,
    });
  } catch (error) {
    next(error);
  }
};
