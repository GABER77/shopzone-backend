import catchAsync from '../utils/catchAsync.js';
import Order from '../models/orderModel.js';

const getMyOrders = catchAsync(async (req, res, next) => {
  // Filter only orders for the current user
  const orders = await Order.find({ user: req.user.id }).populate(
    'products.product',
    'name images',
  ); // populates only the 'name, iamges' field of the product

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
