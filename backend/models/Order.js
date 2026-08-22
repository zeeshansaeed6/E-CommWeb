import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  fulfillmentStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  trackingNumber: {
    type: String,
    default: '',
  },
  carrier: {
    type: String,
    default: '',
  },
  shippedAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
});

const vendorPayoutSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  grossAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  commissionRate: {
    type: Number,
    required: true,
    default: 10, // Percentage
  },
  platformFee: {
    type: Number,
    required: true,
    default: 0,
  },
  netPayout: {
    type: Number,
    required: true,
    default: 0,
  },
  payoutStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid', 'Refunded'],
    default: 'Pending',
  },
  paidAt: {
    type: Date,
  },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderItems: [orderItemSchema],
    vendorPayouts: [vendorPayoutSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Stripe',
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    stripeSessionId: {
      type: String,
      default: '',
    },
    overallFulfillmentStatus: {
      type: String,
      enum: ['Unfulfilled', 'Partially Fulfilled', 'Fulfilled', 'Cancelled'],
      default: 'Unfulfilled',
    },
  },
  {
    timestamps: true,
  }
);

// Method to re-evaluate overall fulfillment status based on individual items
orderSchema.methods.recalculateOverallStatus = function () {
  const statuses = this.orderItems.map((item) => item.fulfillmentStatus);
  if (statuses.every((s) => s === 'Delivered')) {
    this.overallFulfillmentStatus = 'Fulfilled';
  } else if (statuses.every((s) => s === 'Cancelled')) {
    this.overallFulfillmentStatus = 'Cancelled';
  } else if (statuses.some((s) => ['Processing', 'Shipped', 'Delivered'].includes(s))) {
    this.overallFulfillmentStatus = 'Partially Fulfilled';
  } else {
    this.overallFulfillmentStatus = 'Unfulfilled';
  }
};

const Order = mongoose.model('Order', orderSchema);
export default Order;
