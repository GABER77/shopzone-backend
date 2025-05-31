import catchAsync from '../utils/catchAsync.js';
import Order from '../models/orderModel.js';

const getMyOrders = catchAsync(async (req, res, next) => {
  // Filter only orders for the current user
  const orders = await Order.find({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

const orderController = {
  getMyOrders,
};

export default orderController;
