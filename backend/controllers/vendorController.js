import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get Vendor Dashboard Summary Analytics
// @route   GET /api/vendors/stats
// @access  Private (Vendor)
export const getVendorStats = async (req, res, next) => {
  try {
    const vendorId = req.user._id;

    // Total products
    const totalProducts = await Product.countDocuments({ vendor: vendorId });

    // Orders containing vendor's items
    const orders = await Order.find({ 'orderItems.vendor': vendorId });

    let totalEarnings = 0;
    let pendingPayouts = 0;
    let completedOrders = 0;
    let pendingOrders = 0;

    orders.forEach((order) => {
      const payout = order.vendorPayouts.find(
        (p) => p.vendor.toString() === vendorId.toString()
      );

      if (payout) {
        if (order.isPaid) {
          totalEarnings += payout.netPayout;
          if (payout.payoutStatus === 'Pending') {
            pendingPayouts += payout.netPayout;
          }
        }
      }

      const vendorItems = order.orderItems.filter(
        (item) => item.vendor.toString() === vendorId.toString()
      );

      const allDelivered = vendorItems.every((item) => item.fulfillmentStatus === 'Delivered');
      if (allDelivered) {
        completedOrders++;
      } else {
        pendingOrders++;
      }
    });

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders: orders.length,
        completedOrders,
        pendingOrders,
        totalEarnings: Number(totalEarnings.toFixed(2)),
        pendingPayouts: Number(pendingPayouts.toFixed(2)),
        commissionRate: req.user.vendorDetails?.commissionRate || 10,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Vendor's Products
// @route   GET /api/vendors/products
// @access  Private (Vendor)
export const getVendorProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public vendor profile by ID
// @route   GET /api/vendors/:id
// @access  Public
export const getVendorPublicProfile = async (req, res, next) => {
  try {
    const vendor = await User.findOne({ _id: req.params.id, role: 'Vendor' }).select(
      'name avatar vendorDetails createdAt'
    );

    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }

    const products = await Product.find({ vendor: vendor._id, isActive: true });

    res.json({
      success: true,
      vendor,
      products,
    });
  } catch (error) {
    next(error);
  }
};
