import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Get Platform-Wide Admin KPIs
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ role: 'Vendor' });
    const totalCustomers = await User.countDocuments({ role: 'Customer' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const paidOrders = await Order.find({ isPaid: true });

    let grossVolume = 0;
    let totalPlatformRevenue = 0;
    let totalVendorPayoutsOwed = 0;

    paidOrders.forEach((order) => {
      grossVolume += order.totalPrice;
      order.vendorPayouts.forEach((vp) => {
        totalPlatformRevenue += vp.platformFee;
        if (vp.payoutStatus === 'Pending') {
          totalVendorPayoutsOwed += vp.netPayout;
        }
      });
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalVendors,
        totalCustomers,
        totalProducts,
        totalOrders,
        grossVolume: Number(grossVolume.toFixed(2)),
        totalPlatformRevenue: Number(totalPlatformRevenue.toFixed(2)),
        totalVendorPayoutsOwed: Number(totalVendorPayoutsOwed.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Vendor Approval or Commission Rate
// @route   PATCH /api/admin/vendors/:id
// @access  Private (Admin)
export const updateVendorConfig = async (req, res, next) => {
  try {
    const { isApproved, commissionRate } = req.body;
    const vendor = await User.findOne({ _id: req.params.id, role: 'Vendor' });

    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }

    if (isApproved !== undefined) {
      vendor.vendorDetails.isApproved = isApproved;
    }
    if (commissionRate !== undefined) {
      const rate = Number(commissionRate);
      if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
        res.status(400);
        throw new Error('Commission rate must be a number between 0 and 100');
      }
      vendor.vendorDetails.commissionRate = rate;
    }

    await vendor.save();

    res.json({
      success: true,
      message: 'Vendor configuration updated successfully',
      vendor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark Vendor Payout as Paid
// @route   PATCH /api/admin/orders/:orderId/payouts/:vendorId
// @access  Private (Admin)
export const markVendorPayoutPaid = async (req, res, next) => {
  try {
    const { orderId, vendorId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const payout = order.vendorPayouts.find(
      (p) => p.vendor.toString() === vendorId.toString()
    );

    if (!payout) {
      res.status(404);
      throw new Error('Vendor payout record not found in this order');
    }

    payout.payoutStatus = 'Paid';
    payout.paidAt = new Date();

    await order.save();

    res.json({
      success: true,
      message: 'Vendor payout marked as Paid',
      order,
    });
  } catch (error) {
    next(error);
  }
};
