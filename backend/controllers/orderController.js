import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { calculateVendorPayouts } from '../utils/commissionCalculator.js';

// @desc    Create new master order with multi-vendor split fulfillment & payout structure
// @route   POST /api/orders
// @access  Private (Customer, Admin)
export const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items provided');
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      res.status(400);
      throw new Error('Shipping address is incomplete');
    }

    // Verify products exist and attach verified prices & vendor IDs from DB to prevent client tampering
    const populatedOrderItems = [];
    let itemsPrice = 0;

    for (const item of orderItems) {
      const productDoc = await Product.findById(item.product);
      if (!productDoc) {
        res.status(404);
        throw new Error(`Product ${item.product} not found`);
      }

      if (productDoc.stock < item.qty) {
        res.status(400);
        throw new Error(`Product "${productDoc.title}" is out of stock (Available: ${productDoc.stock})`);
      }

      const activePrice = productDoc.discountPrice > 0 ? productDoc.discountPrice : productDoc.price;
      itemsPrice += activePrice * item.qty;

      populatedOrderItems.push({
        product: productDoc._id,
        title: productDoc.title,
        image: productDoc.images?.[0]?.url || item.image || '',
        price: activePrice,
        qty: item.qty,
        vendor: productDoc.vendor,
        fulfillmentStatus: 'Pending',
      });
    }

    // Calculate tax (e.g. 5%) and shipping ($10 flat, or free over $100)
    const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
    const shippingPrice = itemsPrice > 100 ? 0.0 : 10.0;
    const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    // Calculate per-vendor split payouts
    const vendorPayouts = await calculateVendorPayouts(populatedOrderItems);

    const order = new Order({
      customer: req.user._id,
      orderItems: populatedOrderItems,
      vendorPayouts,
      shippingAddress,
      paymentMethod: paymentMethod || 'Stripe',
      itemsPrice: Number(itemsPrice.toFixed(2)),
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: false,
      overallFulfillmentStatus: 'Unfulfilled',
    });

    const createdOrder = await order.save();

    // Decrement product inventory
    for (const item of populatedOrderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: createdOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private (Owner Customer, Vendor in order, or Admin)
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone avatar')
      .populate('orderItems.vendor', 'name email vendorDetails avatar')
      .populate('vendorPayouts.vendor', 'name email vendorDetails');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Access check: Customer owner, Admin, or Vendor who owns any item in this order
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';
    const isVendorInOrder = order.orderItems.some(
      (item) => item.vendor._id.toString() === req.user._id.toString()
    );

    if (!isCustomer && !isAdmin && !isVendorInOrder) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('orderItems.vendor', 'name vendorDetails')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor's incoming orders (Filter only items relevant to this vendor)
// @route   GET /api/orders/vendor-orders
// @access  Private (Vendor)
export const getVendorOrders = async (req, res, next) => {
  try {
    const vendorId = req.user._id;

    // Find all orders that contain at least one item from this vendor
    const orders = await Order.find({ 'orderItems.vendor': vendorId })
      .populate('customer', 'name email phone address')
      .sort({ createdAt: -1 });

    // Format orders for vendor view: isolate vendor's items & vendor payout summary
    const formattedOrders = orders.map((order) => {
      const vendorItems = order.orderItems.filter(
        (item) => item.vendor.toString() === vendorId.toString()
      );

      const payout = order.vendorPayouts.find(
        (p) => p.vendor.toString() === vendorId.toString()
      );

      return {
        _id: order._id,
        createdAt: order.createdAt,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        shippingAddress: order.shippingAddress,
        customer: order.customer,
        vendorItems,
        vendorPayout: payout || null,
        overallStatus: order.overallFulfillmentStatus,
      };
    });

    res.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fulfillment status for a specific item in an order by its Vendor
// @route   PATCH /api/orders/:orderId/items/:itemId/fulfillment
// @access  Private (Vendor, Admin)
export const updateVendorItemFulfillment = async (req, res, next) => {
  try {
    const { orderId, itemId } = req.params;
    const { status, trackingNumber, carrier } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const item = order.orderItems.id(itemId);
    if (!item) {
      res.status(404);
      throw new Error('Order item not found');
    }

    // Ownership check: Caller must be the vendor for this item or an Admin
    const isItemVendor = item.vendor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isItemVendor && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to update fulfillment for an item you do not own');
    }

    // Update status
    if (status) {
      item.fulfillmentStatus = status;
      if (status === 'Shipped') {
        item.shippedAt = new Date();
      } else if (status === 'Delivered') {
        item.deliveredAt = new Date();
      }
    }

    if (trackingNumber !== undefined) item.trackingNumber = trackingNumber;
    if (carrier !== undefined) item.carrier = carrier;

    // Recalculate master order fulfillment state
    order.recalculateOverallStatus();
    await order.save();

    res.json({
      success: true,
      message: `Item fulfillment status updated to ${item.fulfillmentStatus}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('customer', 'name email')
      .populate('orderItems.vendor', 'name vendorDetails')
      .populate('vendorPayouts.vendor', 'name vendorDetails')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};
