import User from '../models/User.js';

/**
 * Calculates per-vendor gross amounts, platform commission fees, and net vendor payouts
 * @param {Array} orderItems - Array of order item objects containing { product, price, qty, vendor }
 * @returns {Promise<Array>} vendorPayouts array
 */
export const calculateVendorPayouts = async (orderItems) => {
  const defaultPlatformCommission = Number(process.env.PLATFORM_COMMISSION_PERCENT) || 10;

  // Group items by vendor ID
  const vendorMap = {};

  for (const item of orderItems) {
    const vendorId = item.vendor.toString();
    const itemTotal = Number(item.price) * Number(item.qty);

    if (!vendorMap[vendorId]) {
      vendorMap[vendorId] = {
        grossAmount: 0,
      };
    }
    vendorMap[vendorId].grossAmount += itemTotal;
  }

  const vendorPayouts = [];

  for (const [vendorId, data] of Object.entries(vendorMap)) {
    // Fetch custom vendor commission rate if set
    const vendorDoc = await User.findById(vendorId).select('vendorDetails');
    const commissionRate =
      vendorDoc?.vendorDetails?.commissionRate !== undefined
        ? vendorDoc.vendorDetails.commissionRate
        : defaultPlatformCommission;

    const grossAmount = Number(data.grossAmount.toFixed(2));
    const platformFee = Number(((grossAmount * commissionRate) / 100).toFixed(2));
    const netPayout = Number((grossAmount - platformFee).toFixed(2));

    vendorPayouts.push({
      vendor: vendorId,
      grossAmount,
      commissionRate,
      platformFee,
      netPayout,
      payoutStatus: 'Pending',
    });
  }

  return vendorPayouts;
};
