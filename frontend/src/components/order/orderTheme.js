// Helpers that turn an order's raw items into themed, cart-shaped items and a tracker stage.

export const TRACKER_STEPS = ['Ordered', 'Paid', 'Packing', 'Shipped', 'Delivered'];

// Order items carry a populated product ({ _id, category, theme }) when the API could resolve it.
const productIdOf = (item) => item.product?._id || (typeof item.product === 'string' ? item.product : undefined);

export const themedOrderItems = (order) =>
  order.orderItems.map((item) => ({
    ...item,
    _id: productIdOf(item) || item._id,
    productId: productIdOf(item),
    discountPrice: 0,
    category: item.product?.category,
    theme: item.product?.theme,
  }));

// -1 = cancelled, otherwise index into TRACKER_STEPS of the furthest step reached
export const trackerStage = (order) => {
  const statuses = order.orderItems.map((i) => i.fulfillmentStatus);
  if (statuses.length && statuses.every((s) => s === 'Cancelled')) return -1;
  if (statuses.length && statuses.every((s) => s === 'Delivered')) return 4;
  if (statuses.some((s) => s === 'Shipped' || s === 'Delivered')) return 3;
  if (statuses.some((s) => s === 'Processing')) return 2;
  return order.isPaid ? 1 : 0;
};

export const shortId = (id) => id.substring(id.length - 8).toUpperCase();

// Human label for the tracker stage; says "Partly shipped" when only some items have left the vendor
export const stageLabel = (order) => {
  const stage = trackerStage(order);
  if (stage === -1) return 'Cancelled';
  const everyShipped = order.orderItems.every((i) => i.fulfillmentStatus === 'Shipped' || i.fulfillmentStatus === 'Delivered');
  return stage === 3 && !everyShipped ? 'Partly shipped' : TRACKER_STEPS[stage];
};
